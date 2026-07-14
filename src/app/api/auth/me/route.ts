import { NextRequest } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth";
import { success } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return unauthorized();
  return success(user);
}
