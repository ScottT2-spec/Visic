import { NextRequest, NextResponse } from "next/server";
import { getTemplateBySlug } from "@/lib/templates/catalog";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const template = getTemplateBySlug(slug);

  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Redirect to static file in public/templates/
  return NextResponse.redirect(
    new URL(`/templates/${template.file}`, _req.url),
    302
  );
}
