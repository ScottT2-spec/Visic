import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, logAudit } from "@/lib/api-helpers";
import { addMemberSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/members
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const members = await prisma.siteMember.findMany({
    where: { siteId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Also include the store owner
  const site = ctx.site!;
  const owner = await prisma.user.findUnique({
    where: { id: site.workspace.ownerId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      avatar: true,
      role: true,
    },
  });

  return success({
    owner: owner ? { ...owner, memberRole: "OWNER" as const } : null,
    members: members.map((m) => ({
      id: m.id,
      role: m.role,
      createdAt: m.createdAt,
      user: m.user,
    })),
  });
}

// POST /api/sites/:siteId/members
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  // Only owner or ADMIN members can add members
  const site = ctx.site!;
  const isOwner = site.workspace.ownerId === ctx.user!.id;
  const callerMember = site.members.find((m) => m.userId === ctx.user!.id);
  const isStoreAdmin = callerMember?.role === "ADMIN";

  if (!isOwner && !isStoreAdmin && ctx.user!.role !== "SUPER_ADMIN") {
    return error("Only store owners and admins can add members", 403);
  }

  try {
    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    // Look up user by email
    const targetUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!targetUser) {
      return error("User not found. They must sign up first.", 404);
    }

    // Cannot add the owner as a member
    if (targetUser.id === site.workspace.ownerId) {
      return error("This user is already the store owner", 409);
    }

    // Check if already a member
    const existing = await prisma.siteMember.findUnique({
      where: { siteId_userId: { siteId, userId: targetUser.id } },
    });

    if (existing) {
      return error("This user is already a member of the store", 409);
    }

    const member = await prisma.siteMember.create({
      data: {
        siteId,
        userId: targetUser.id,
        role: parsed.data.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    await logAudit({
      siteId,
      userId: ctx.user!.id,
      action: "CREATE",
      entity: "member",
      entityId: member.id,
      after: { userId: targetUser.id, email: targetUser.email, role: parsed.data.role },
    });

    return success(member, 201);
  } catch (err) {
    console.error("Add member error:", err);
    return error("Internal server error", 500);
  }
}
