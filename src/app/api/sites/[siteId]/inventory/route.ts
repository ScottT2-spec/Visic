import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const filter = url.searchParams.get("filter"); // all, low_stock, out_of_stock
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "30"), 100);

  const where: Record<string, unknown> = { siteId, trackInventory: true };
  if (search) where.name = { contains: search, mode: "insensitive" };
  if (filter === "low_stock") where.stock = { gt: 0, lte: prisma.product.fields?.lowStockAlert ? undefined : 5 };
  if (filter === "out_of_stock") where.stock = { lte: 0 };

  // For low_stock, we need raw where with column comparison
  let products;
  let total;

  if (filter === "low_stock") {
    const baseWhere: Record<string, unknown> = { siteId, trackInventory: true };
    if (search) baseWhere.name = { contains: search, mode: "insensitive" };

    const allTracked = await prisma.product.findMany({
      where: baseWhere as any,
      select: { id: true, name: true, slug: true, sku: true, stock: true, lowStockAlert: true, price: true, status: true, images: true, createdAt: true },
      orderBy: { stock: "asc" },
    });
    const lowStockProducts = allTracked.filter((p) => p.stock > 0 && p.stock <= p.lowStockAlert);
    total = lowStockProducts.length;
    products = lowStockProducts.slice((page - 1) * limit, page * limit);
  } else {
    [products, total] = await Promise.all([
      prisma.product.findMany({
        where: where as any,
        select: { id: true, name: true, slug: true, sku: true, stock: true, lowStockAlert: true, price: true, status: true, images: true, createdAt: true },
        orderBy: { stock: "asc" }, skip: (page - 1) * limit, take: limit,
      }),
      prisma.product.count({ where: where as any }),
    ]);
  }

  // Summary stats
  const allProducts = await prisma.product.findMany({
    where: { siteId, trackInventory: true } as any,
    select: { stock: true, lowStockAlert: true },
  });
  const summary = {
    totalTracked: allProducts.length,
    inStock: allProducts.filter((p) => p.stock > p.lowStockAlert).length,
    lowStock: allProducts.filter((p) => p.stock > 0 && p.stock <= p.lowStockAlert).length,
    outOfStock: allProducts.filter((p) => p.stock <= 0).length,
    totalUnits: allProducts.reduce((sum, p) => sum + p.stock, 0),
  };

  return success({ products, summary, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

// Bulk stock update
export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { updates } = body as { updates: Array<{ productId: string; stock: number }> };
    if (!Array.isArray(updates) || updates.length === 0) return error("No updates provided", 400);
    if (updates.length > 50) return error("Max 50 updates per batch", 400);

    const results = [];
    for (const u of updates) {
      const product = await prisma.product.findFirst({ where: { id: u.productId, siteId } });
      if (!product) continue;
      const updated = await prisma.product.update({ where: { id: u.productId }, data: { stock: u.stock } });
      results.push({ productId: u.productId, name: product.name, oldStock: product.stock, newStock: u.stock });
    }

    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "inventory_bulk", entityId: "bulk", after: { updates: results } });
    return success({ updated: results.length, results });
  } catch (err) { console.error("Bulk inventory update error:", err); return error("Internal server error", 500); }
}
