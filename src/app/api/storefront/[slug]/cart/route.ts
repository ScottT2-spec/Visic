import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

interface CartItem { productId: string; variantId?: string; quantity: number; }

// POST: Validate cart and return pricing
export async function POST(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({ where: { slug }, select: { id: true, currency: true } });
  if (!site) return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });

  try {
    const { items } = await req.json() as { items: CartItem[] };
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart items required" }, { status: 400 });
    }
    if (items.length > 50) {
      return NextResponse.json({ success: false, error: "Max 50 items per cart" }, { status: 400 });
    }

    const productIds = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, siteId: site.id, status: "ACTIVE" },
      select: { id: true, name: true, slug: true, price: true, stock: true, trackInventory: true, images: true, currency: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Fetch variants if needed
    const variantIds = items.filter((i) => i.variantId).map((i) => i.variantId!);
    const variants = variantIds.length > 0
      ? await prisma.productVariant.findMany({ where: { id: { in: variantIds } }, select: { id: true, productId: true, name: true, price: true, stock: true, image: true } })
      : [];
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    const validatedItems = [];
    const errors = [];
    let subtotal = 0;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) { errors.push({ productId: item.productId, error: "Product not found or unavailable" }); continue; }

      let price = parseFloat(product.price.toString());
      let stock = product.stock;
      let variantName: string | null = null;

      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant || variant.productId !== item.productId) { errors.push({ productId: item.productId, variantId: item.variantId, error: "Variant not found" }); continue; }
        if (variant.price) price = parseFloat(variant.price.toString());
        stock = variant.stock;
        variantName = variant.name;
      }

      const qty = Math.max(1, Math.min(item.quantity, 99));
      if (product.trackInventory && stock < qty) { errors.push({ productId: item.productId, error: `Only ${stock} in stock` }); continue; }

      const lineTotal = price * qty;
      subtotal += lineTotal;

      validatedItems.push({
        productId: product.id, productName: product.name, productSlug: product.slug,
        variantId: item.variantId || null, variantName,
        image: product.images?.[0] || null, price, quantity: qty, lineTotal,
        currency: product.currency,
      });
    }

    // Apply tax if default rule exists
    const defaultTax = await prisma.taxRule.findFirst({ where: { siteId: site.id, isDefault: true, isActive: true } });
    const taxRate = defaultTax ? parseFloat(defaultTax.rate.toString()) : 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    return NextResponse.json({
      success: true,
      data: {
        items: validatedItems, errors: errors.length > 0 ? errors : undefined,
        summary: { subtotal, taxRate, taxAmount, total, currency: site.currency || "GHS", itemCount: validatedItems.reduce((s, i) => s + i.quantity, 0) },
      },
    });
  } catch (err) { console.error("Cart validation error:", err); return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 }); }
}
