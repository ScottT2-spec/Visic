import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

// POST /api/workspaces/[workspaceId]/members — invite member
export async function POST(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) return error("Not authorized", 403);

  const { email, role = "EDITOR" } = await req.json();
  if (!email) return error("Email is required", 422);

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return error("User not found. They must sign up first.", 404);

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUser.id } },
  });
  if (existing) return error("User is already a member", 409);

  const member = await prisma.workspaceMember.create({
    data: { workspaceId, userId: targetUser.id, role },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
  });

  return success(member, 201);
}

// DELETE /api/workspaces/[workspaceId]/members — remove member
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { workspaceId } = await params;

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) return error("Not authorized", 403);

  const { userId } = await req.json();
  if (!userId) return error("userId is required", 422);
  if (userId === user.id) return error("Cannot remove yourself", 400);

  await prisma.workspaceMember.deleteMany({ where: { workspaceId, userId } });
  return success({ removed: true });
}
