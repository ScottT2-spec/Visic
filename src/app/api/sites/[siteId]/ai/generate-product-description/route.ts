import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { chatWithAI } from "@/lib/ai-service";

export const maxDuration = 60;

type Params = { params: Promise<{ siteId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const { productId, productIds, tone, language } = await req.json();

    const ids: string[] = productId ? [productId] : (productIds || []);
    if (ids.length === 0) return error("productId or productIds required", 400);
    if (ids.length > 20) return error("Max 20 products per batch", 400);

    const products = await prisma.product.findMany({
      where: { id: { in: ids }, siteId },
      select: { id: true, name: true, description: true, price: true, tags: true, category: { select: { name: true } } },
    });

    if (products.length === 0) return error("No products found", 404);

    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { name: true } });

    const prompt = `Generate compelling product descriptions for an online store called "${site?.name || ""}".
${tone ? `Tone: ${tone}` : "Tone: Professional yet friendly"}
${language ? `Language: ${language}` : "Language: English"}

For each product, generate:
- shortDescription: 1-2 compelling sentences (max 200 chars)
- longDescription: 3-5 paragraphs with features, benefits, and CTA (HTML allowed: <p>, <ul>, <li>, <strong>)
- seoDescription: meta description (max 160 chars)

Return ONLY a valid JSON array:
[{ "id": "product-id", "shortDescription": "...", "longDescription": "...", "seoDescription": "..." }]

Products:
${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, currentDesc: p.description?.slice(0, 100), price: p.price.toString(), category: p.category?.name, tags: p.tags })))}`;

    const res = await chatWithAI({ siteId, message: prompt });
    if (!res.content) return error("AI failed to generate descriptions", 500);

    let generated: Array<{ id: string; shortDescription?: string; longDescription?: string; seoDescription?: string }>;
    try {
      generated = JSON.parse(res.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
    } catch {
      return error("AI returned invalid response. Try again.", 422);
    }

    const updated = [];
    for (const item of generated) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;

      await prisma.product.update({
        where: { id: item.id },
        data: {
          description: item.longDescription || item.shortDescription || undefined,
          metaDescription: item.seoDescription || undefined,
        },
      });
      updated.push({ ...item, name: product.name });
    }

    await logAudit({ siteId, userId: ctx.user!.id, action: "UPDATE", entity: "ai_product_descriptions", entityId: siteId, after: { count: updated.length } });
    return success({ updated: updated.length, products: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("AI product description error:", err);
    return error(msg, 500);
  }
}
