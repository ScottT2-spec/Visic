import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ pageId: string }> };

// GET /api/pages/:pageId - Get page info including siteId
export async function GET(req: NextRequest, { params }: Params) {
  const { pageId } = await params;

  try {
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { id: true, siteId: true, title: true, slug: true },
    });

    if (!page) {
      return error("Page not found", 404);
    }

    return success(page);
  } catch (err) {
    console.error("Get page error:", err);
    return error("Internal server error", 500);
  }
}
