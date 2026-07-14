import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "./auth";

export async function getAdminUser(req: NextRequest) {
  const user = await getAuthUser(req);
  
  if (!user) {
    return null;
  }
  
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    return null;
  }
  
  return user;
}

export function adminRequired() {
  return NextResponse.json({ error: "Admin access required" }, { status: 403 });
}