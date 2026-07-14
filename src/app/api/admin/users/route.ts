import { NextRequest } from "next/server";
import { getAdminUser, adminRequired } from "@/lib/admin-auth";
import { success, error } from "@/lib/api-helpers";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          siteMembers: {
            select: { id: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const usersWithStoreCount = users.map((user) => ({
      ...user,
      storesCount: user.siteMembers.length,
      siteMembers: undefined,
    }));

    return success({
      users: usersWithStoreCount,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Admin users list error:", err);
    return error("Failed to fetch users");
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser(req);
    if (!admin) return adminRequired();

    const body = await req.json();
    const { email, firstName, lastName, password, role = "MERCHANT" } = body;

    if (!email || !firstName || !lastName || !password) {
      return error("All fields are required", 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return error("A user with this email already exists", 409);

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: { email, firstName, lastName, passwordHash, role: role === "ADMIN" ? "ADMIN" : "MERCHANT" },
    });

    return success({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, 201);
  } catch (err) {
    console.error("Admin create user error:", err);
    return error("Failed to create user", 500);
  }
}