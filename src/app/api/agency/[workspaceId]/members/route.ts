import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { getAuthUser, unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ workspaceId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { workspaceId } = await params;
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) return error("Access denied", 403);

  const { email, role } = await req.json();
  if (!email) return error("email is required", 400);

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) return error("User not found. They must create an account first.", 404);

  const existing = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: targetUser.id } },
  });
  if (existing) return error("User is already a member", 409);

  const validRoles = ["ADMIN", "MANAGER", "EDITOR", "MARKETER", "SUPPORT", "DEVELOPER", "VIEWER"] as const;
  const memberRole = validRoles.includes(role as any) ? role : "EDITOR";

  const member = await prisma.workspaceMember.create({
    data: { workspaceId, userId: targetUser.id, role: memberRole as any },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });

  return success({ member }, 201);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspaceId } = await params;
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) return error("Access denied", 403);

  const url = new URL(req.url);
  const memberId = url.searchParams.get("memberId");
  if (!memberId) return error("memberId query param required", 400);

  await prisma.workspaceMember.delete({ where: { id: memberId } });
  return success({ message: "Member removed" });
}
