import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";

async function getWorkspaceAccess(userId: string, workspaceId: string) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true },
  });
  if (!workspace) return null;
  const isOwner = workspace.ownerId === userId;
  const isMember = workspace.members.some(m => m.userId === userId);
  if (!isOwner && !isMember) return null;
  return { workspace, isOwner };
}

// GET /api/workspaces/[workspaceId]
export async function GET(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { workspaceId } = await params;

  const access = await getWorkspaceAccess(user.id, workspaceId);
  if (!access) return error("Workspace not found", 404);

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, avatar: true } } },
      },
      sites: {
        select: {
          id: true, name: true, siteType: true, slug: true, subdomain: true,
          customDomain: true, status: true, logo: true, industry: true,
          businessType: true, createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { sites: true, members: true } },
    },
  });

  return success(workspace);
}

// PATCH /api/workspaces/[workspaceId]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { workspaceId } = await params;

  const access = await getWorkspaceAccess(user.id, workspaceId);
  if (!access) return error("Workspace not found", 404);
  if (!access.isOwner) return error("Only the owner can update the workspace", 403);

  const body = await req.json();
  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name.trim();
  if (body.logo !== undefined) updates.logo = body.logo;

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: updates,
  });

  return success(workspace);
}

// DELETE /api/workspaces/[workspaceId]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  const { workspaceId } = await params;

  const access = await getWorkspaceAccess(user.id, workspaceId);
  if (!access) return error("Workspace not found", 404);
  if (!access.isOwner) return error("Only the owner can delete the workspace", 403);

  await prisma.workspace.delete({ where: { id: workspaceId } });
  return success({ deleted: true });
}
