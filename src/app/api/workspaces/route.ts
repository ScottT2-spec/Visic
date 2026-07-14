import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { slugify, generateId } from "@/lib/utils";

// GET /api/workspaces — list user's workspaces
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const workspaces = await prisma.workspace.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      _count: { select: { sites: true, members: true } },
      sites: {
        select: { id: true, name: true, siteType: true, slug: true, status: true, subdomain: true, logo: true },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return success(workspaces);
}

// POST /api/workspaces — create workspace
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const body = await req.json();
  const { name, logo } = body;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return error("Workspace name is required (min 2 characters)", 422);
  }

  // Generate unique slug
  let slug = slugify(name.trim());
  let counter = 0;
  while (true) {
    const candidate = counter === 0 ? slug : `${slug}-${counter}`;
    const existing = await prisma.workspace.findUnique({ where: { slug: candidate } });
    if (!existing) { slug = candidate; break; }
    counter++;
  }

  const workspace = await prisma.workspace.create({
    data: {
      ownerId: user.id,
      name: name.trim(),
      slug,
      logo: logo || null,
    },
    include: {
      _count: { select: { sites: true, members: true } },
    },
  });

  return success(workspace, 201);
}
