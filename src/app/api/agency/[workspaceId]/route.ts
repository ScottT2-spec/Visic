import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { getAuthUser, unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ workspaceId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { workspaceId } = await params;
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      sites: { include: { _count: { select: { products: true, orders: true, pages: true, blogs: true } } } },
      members: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } } },
    },
  });
  if (!workspace || workspace.ownerId !== user.id) return error("Not found", 404);

  return success({ workspace });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { workspaceId } = await params;
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) return error("Not found", 404);

  const { name, logo, plan, status } = await req.json();
  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(name && { name }),
      ...(logo !== undefined && { logo }),
      ...(plan && { plan: plan as any }),
      ...(status && { status: status as any }),
    },
  });

  return success({ workspace: updated });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { workspaceId } = await params;
  const user = await getAuthUser(req);
  if (!user) return unauthorized();

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace || workspace.ownerId !== user.id) return error("Not found", 404);

  const activeOrders = await prisma.order.count({
    where: { site: { workspaceId }, status: { in: ["PENDING", "PROCESSING", "SHIPPED"] } },
  });
  if (activeOrders > 0) return error(`Cannot delete: ${activeOrders} active orders`, 409);

  await prisma.workspace.delete({ where: { id: workspaceId } });
  return success({ message: "Workspace deleted" });
}
