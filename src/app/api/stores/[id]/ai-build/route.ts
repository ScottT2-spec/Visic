import { NextRequest } from "next/server";
import { getSiteContext, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ctx = await getSiteContext(req, id);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();
  return error("AI template generation has been removed. Select a theme package instead.", 410);
}
