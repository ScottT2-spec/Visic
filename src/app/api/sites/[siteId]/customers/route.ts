import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError } from "@/lib/api-helpers";
import { createCustomerSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/customers
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where: where as any,
      include: { _count: { select: { orders: true } } },
      orderBy: { totalSpent: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where: where as any }),
  ]);

  return success({
    customers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/customers
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const parsed = createCustomerSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

  const existing = await prisma.customer.findUnique({
    where: { siteId_email: { siteId, email: parsed.data.email } },
  });
  if (existing) return error("Customer with this email already exists", 409);

  const customer = await prisma.customer.create({
    data: { siteId, ...parsed.data },
  });

  return success(customer, 201);
}
