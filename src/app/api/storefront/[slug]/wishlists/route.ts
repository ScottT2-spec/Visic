import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

async function getSite(slug: string) {
  return prisma.site.findUnique({ where: { slug }, select: { id: true } });
}

// GET: Get wishlist for customer (by customerId query param)
export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });

  const customerId = new URL(req.url).searchParams.get("customerId");
  if (!customerId) return NextResponse.json({ success: false, error: "customerId required" }, { status: 400 });

  const wishlist = await prisma.wishlist.findUnique({
    where: { siteId_customerId: { siteId: site.id, customerId } },
    include: { items: { include: { product: { select: { id: true, name: true, slug: true, price: true, images: true, stock: true, status: true } } }, orderBy: { addedAt: "desc" } } },
  });

  return NextResponse.json({ success: true, data: wishlist || { items: [] } });
}

// POST: Add item to wishlist
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });

  try {
    const { customerId, productId } = await req.json();
    if (!customerId || !productId) return NextResponse.json({ success: false, error: "customerId and productId required" }, { status: 400 });

    // Verify product exists and belongs to site
    const product = await prisma.product.findFirst({ where: { id: productId, siteId: site.id, status: "ACTIVE" } });
    if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

    // Find or create wishlist
    const wishlist = await prisma.wishlist.upsert({
      where: { siteId_customerId: { siteId: site.id, customerId } },
      create: { siteId: site.id, customerId },
      update: {},
    });

    // Add item (ignore if already exists)
    await prisma.wishlistItem.upsert({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
      create: { wishlistId: wishlist.id, productId },
      update: {},
    });

    return NextResponse.json({ success: true, data: { added: true } }, { status: 201 });
  } catch (err) { console.error("Add to wishlist error:", err); return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 }); }
}

// DELETE: Remove item from wishlist
export async function DELETE(req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const site = await getSite(slug);
  if (!site) return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });

  const url = new URL(req.url);
  const customerId = url.searchParams.get("customerId");
  const productId = url.searchParams.get("productId");
  if (!customerId || !productId) return NextResponse.json({ success: false, error: "customerId and productId required" }, { status: 400 });

  const wishlist = await prisma.wishlist.findUnique({ where: { siteId_customerId: { siteId: site.id, customerId } } });
  if (!wishlist) return NextResponse.json({ success: true, data: { removed: true } });

  await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
  return NextResponse.json({ success: true, data: { removed: true } });
}
