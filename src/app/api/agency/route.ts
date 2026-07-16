import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { getAuthUser, unauthorized } from "@/lib/auth";

type Params = Record<string, never>;

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

  const [workspaces, total] = await Promise.all([
    prisma.workspace.findMany({
      where: { ownerId: user.id },
      include: {
        sites: { select: { id: true, name: true, slug: true, siteType: true, status: true, createdAt: true } },
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        _count: { select: { sites: true, members: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.workspace.count({ where: { ownerId: user.id } }),
  ]);

  const totalSites = workspaces.reduce((sum, w) => sum + w._count.sites, 0);
  const totalMembers = workspaces.reduce((sum, w) => sum + w._count.members, 0);
  const planCounts = workspaces.reduce<Record<string, number>>((acc, w) => { acc[w.plan] = (acc[w.plan] || 0) + 1; return acc; }, {});

  return success({
    workspaces,
    stats: { totalWorkspaces: total, totalSites, totalMembers, planCounts },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const { name, slug, plan, clientEmail, createSite, siteName, siteType } = body;

    if (!name || !slug) return error("name and slug are required", 400);

    const agencyWorkspace = await prisma.workspace.findFirst({
      where: { ownerId: user.id, plan: { in: ["AGENCY", "ENTERPRISE"] } },
    });
    if (!agencyWorkspace) return error("Agency or Enterprise plan required", 403);

    const existing = await prisma.workspace.findUnique({ where: { slug } });
    if (existing) return error("Workspace slug already taken", 409);

    const workspace = await prisma.workspace.create({
      data: { name, slug, ownerId: user.id, plan: (plan as any) || "STARTER" },
    });

    if (clientEmail) {
      const clientUser = await prisma.user.findUnique({ where: { email: clientEmail } });
      if (clientUser) {
        await prisma.workspaceMember.create({
          data: { workspaceId: workspace.id, userId: clientUser.id, role: "ADMIN" },
        });
      }
    }

    let site = null;
    if (createSite && siteName) {
      const siteSlug = (siteName as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
      const uniqueSuffix = Date.now().toString(36);
      site = await prisma.site.create({
        data: {
          workspaceId: workspace.id, name: siteName, slug: `${siteSlug}-${uniqueSuffix}`,
          subdomain: `${siteSlug}-${uniqueSuffix}`,
          siteType: siteType || "ECOMMERCE", currency: "GHS",
        },
      });
    }

    return success({ workspace, site }, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create workspace";
    return error(msg, 500);
  }
}
