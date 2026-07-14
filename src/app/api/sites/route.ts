import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { createStoreSchema } from "@/lib/validators";
import { success, error, validationError, generateSubdomain, logAudit } from "@/lib/api-helpers";
import { slugify } from "@/lib/utils";

// GET /api/sites — list user's stores
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const stores = await prisma.site.findMany({
    where: {
      OR: [
        { workspace: { ownerId: user.id } },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      _count: { select: { products: true, orders: true, customers: true } },
      settings: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return success(stores);
}

// POST /api/sites — create new store
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  try {
    const body = await req.json();
    const parsed = createStoreSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { name, description, businessType, country, currency, logo } = parsed.data;

    // Check store limit based on plan (simplified)
    const storeCount = await prisma.site.count({ where: { workspace: { ownerId: user.id } } });
    if (storeCount >= 10) {
      return error("Store limit reached for your plan", 403);
    }

    const baseSlug = slugify(name);
    const subdomain = generateSubdomain(name);

    // Ensure unique slug
    const existingSlug = await prisma.site.findFirst({ where: { slug: baseSlug } });
    const slug = existingSlug
      ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
      : baseSlug;

    // Ensure unique subdomain
    const existingSubdomain = await prisma.site.findUnique({ where: { subdomain } });
    const finalSubdomain = existingSubdomain
      ? `${subdomain}-${Math.random().toString(36).slice(2, 6)}`
      : subdomain;

    // Find or create a default workspace for this user
    let workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } });
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          ownerId: user.id,
          name: `${user.firstName}'s Workspace`,
          slug: `${slugify(user.firstName)}-${Math.random().toString(36).slice(2, 6)}`,
        },
      });
    }

    const store = await prisma.site.create({
      data: {
        workspaceId: workspace.id,
        name,
        slug,
        description,
        subdomain: finalSubdomain,
        businessType,
        country,
        currency,
        logo: logo || undefined,
        settings: {
          create: {
            allowGuestCheckout: true,
            payOnDelivery: true,
            bankTransfer: true,
            whatsappOrdering: true,
          },
        },
        socialLinks: { create: {} },
        members: {
          create: { userId: user.id, role: "OWNER" },
        },
      },
      include: {
        settings: true,
        _count: { select: { products: true, orders: true } },
      },
    });

    await logAudit({
      siteId: store.id,
      userId: user.id,
      action: "CREATE",
      entity: "store",
      entityId: store.id,
      after: store,
    });

    return success(store, 201);
  } catch (err) {
    console.error("Create store error:", err);
    return error("Internal server error", 500);
  }
}
