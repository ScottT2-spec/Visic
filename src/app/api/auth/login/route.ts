import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";
import { success, error, validationError } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return error("Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return error("Invalid email or password", 401);
    }

    const token = await createToken(user.id);

    const response = success({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return error("Internal server error", 500);
  }
}
