import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { slug } = await params;

  const site = await prisma.site.findUnique({ where: { slug }, select: { id: true } });
  if (!site) return NextResponse.json({ success: false, error: "Site not found" }, { status: 404 });

  const categories = await prisma.category.findMany({
    where: { siteId: site.id },
    select: {
      id: true, name: true, slug: true, description: true, image: true, parentId: true, position: true,
      _count: { select: { products: true } },
    },
    orderBy: { position: "asc" },
  });

  // Build tree structure
  const rootCategories = categories.filter((c) => !c.parentId);
  const childMap = new Map<string, typeof categories>();
  for (const cat of categories) {
    if (cat.parentId) {
      if (!childMap.has(cat.parentId)) childMap.set(cat.parentId, []);
      childMap.get(cat.parentId)!.push(cat);
    }
  }

  const tree = rootCategories.map((cat) => ({
    ...cat,
    children: childMap.get(cat.id) || [],
  }));

  return NextResponse.json({ success: true, data: { categories: tree, flat: categories } });
}
