import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, generateOrderNumber, logAudit } from "@/lib/api-helpers";
import { createOrderSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";


type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/orders
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const paymentStatus = url.searchParams.get("paymentStatus");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customer: { firstName: { contains: search, mode: "insensitive" } } },
      { customer: { lastName: { contains: search, mode: "insensitive" } } },
      { customer: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: where as any,
      include: {
        items: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: where as any }),
  ]);

  return success({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/orders — create order (storefront checkout)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;

  // Orders can be created by anyone (guest checkout)
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { settings: true, deliveryZones: true },
  });
  if (!site) return error("Store not found", 404);

  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { items, deliveryAddress, deliveryZoneId, paymentMethod, couponCode, email, phone, firstName, lastName, note } = parsed.data;

    // Resolve products and calculate prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, siteId, status: "ACTIVE" },
      include: { variants: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      let price = Number(product.price);
      let variantName: string | undefined;

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) throw new Error(`Variant ${item.variantId} not found`);
        if (variant.price) price = Number(variant.price);
        variantName = variant.name;
      }

      // Check stock
      if (product.trackInventory && product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      const lineTotal = price * item.quantity;
      subtotal += lineTotal;

      return {
        productId: product.id,
        variantId: item.variantId || null,
        name: product.name,
        variantName,
        price,
        quantity: item.quantity,
        total: lineTotal,
        image: undefined as string | undefined,
      };
    });

    // Delivery fee
    let deliveryFee = 0;
    if (deliveryZoneId) {
      const zone = site.deliveryZones.find((z) => z.id === deliveryZoneId);
      if (zone) {
        const zoneFreeAbove = zone.freeAbove ? Number(zone.freeAbove) : null;
        deliveryFee = zoneFreeAbove && subtotal >= zoneFreeAbove ? 0 : Number(zone.fee);
      }
    }

    // Coupon
    let discount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { siteId_code: { siteId, code: couponCode.toUpperCase() } },
      });
      if (coupon && coupon.isActive) {
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return error("Coupon usage limit reached", 400);
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
          return error("Coupon has expired", 400);
        }
        const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null;
        if (minAmount && subtotal < minAmount) {
          return error(`Minimum order amount is ₦${minAmount}`, 400);
        }

        const couponValue = Number(coupon.value);
        if (coupon.type === "PERCENTAGE") {
          discount = subtotal * couponValue / 100;
        } else if (coupon.type === "FIXED") {
          discount = Math.min(couponValue, subtotal);
        } else if (coupon.type === "FREE_SHIPPING") {
          deliveryFee = 0;
        }
        couponId = coupon.id;
      }
    }

    const total = subtotal + deliveryFee - discount;

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { siteId_email: { siteId, email } },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { siteId, email, firstName, lastName, phone },
      });
    }

    // Create order (with retry on unlikely order number collision)
    let attempts = 0;
    const createOrder = async (): Promise<any> => {
      attempts++;
      try {
        return await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          siteId,
          customerId: customer!.id,
          orderNumber: generateOrderNumber(),
          email,
          phone,
          paymentMethod,
          subtotal,
          deliveryFee,
          discount,
          total,
          currency: site.currency,
          couponId,
          note,
          deliveryAddress: deliveryAddress as any,
          deliveryZoneId,
          items: {
            create: orderItems,
          },
          timeline: {
            create: { status: "PENDING", note: "Order placed" },
          },
        },
        include: { items: true, customer: true },
      });

      // Update stock
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        if (product.trackInventory) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      // Update customer stats
      await tx.customer.update({
        where: { id: customer!.id },
        data: {
          totalOrders: { increment: 1 },
          totalSpent: { increment: total },
        },
      });

      // Update coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return ord;
        });
      } catch (err: any) {
        // Retry on unique constraint violation (order number collision)
        if (attempts < 3 && err.code === "P2002" && err.meta?.target?.includes("orderNumber")) {
          return createOrder();
        }
        throw err;
      }
    };

    const order = await createOrder();

    await logAudit({
      siteId, action: "CREATE", entity: "order",
      entityId: order.id, after: order,
    });

    return success(order, 201);
  } catch (err: any) {
    console.error("Create order error:", err);
    if (err.message?.includes("not found") || err.message?.includes("Insufficient")) {
      return error(err.message, 400);
    }
    return error("Internal server error", 500);
  }
}
