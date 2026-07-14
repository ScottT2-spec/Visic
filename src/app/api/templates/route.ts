import { NextRequest, NextResponse } from "next/server";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "@/lib/templates/catalog";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const industry = searchParams.get("industry");
  const search = searchParams.get("q")?.toLowerCase();

  let templates = [...TEMPLATES];

  // Sort industry matches first but always return all templates
  if (industry) {
    templates.sort((a, b) => {
      const aMatch = a.industries.includes(industry) ? 0 : 1;
      const bMatch = b.industries.includes(industry) ? 0 : 1;
      return aMatch - bMatch;
    });
  }

  if (category) {
    templates = templates.filter((t) => t.category === category);
  }

  if (search) {
    templates = templates.filter(
      (t) =>
        t.name.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.categoryLabel.toLowerCase().includes(search)
    );
  }

  return NextResponse.json({
    templates: templates.map((t) => ({
      slug: t.slug,
      name: t.name,
      category: t.category,
      categoryLabel: t.categoryLabel,
      description: t.description,
      previewImage: t.previewImage,
      previewUrl: `/templates/${t.file}`,
      industries: t.industries,
    })),
    categories: TEMPLATE_CATEGORIES,
    total: templates.length,
  });
}
