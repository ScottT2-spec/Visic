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
    const { target, targetId } = await req.json();
    if (!target) return error("target is required (product, page, blog, site, all)", 400);

    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { name: true, description: true } });
    if (!site) return error("Site not found", 404);

    const results: Array<{ id: string; type: string; name: string; metaTitle: string; metaDescription: string }> = [];

    if (target === "product" || target === "all") {
      const where = targetId ? { id: targetId, siteId } : { siteId, OR: [{ metaTitle: null }, { metaDescription: null }] };
      const products = await prisma.product.findMany({ where: where as any, select: { id: true, name: true, description: true, tags: true }, take: 20 });

      if (products.length > 0) {
        const prompt = `Generate SEO meta titles (max 60 chars) and meta descriptions (max 160 chars) for these products from "${site.name}".
Return ONLY a JSON array: [{ "id": "...", "metaTitle": "...", "metaDescription": "..." }]
Products: ${JSON.stringify(products.map((p) => ({ id: p.id, name: p.name, desc: p.description?.slice(0, 100) })))}`;

        const res = await chatWithAI({ siteId, message: prompt });
        if (res.content) {
          try {
            const parsed = JSON.parse(res.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
            for (const item of parsed) {
              await prisma.product.update({ where: { id: item.id }, data: { metaTitle: item.metaTitle, metaDescription: item.metaDescription } });
              results.push({ id: item.id, type: "product", name: products.find((p) => p.id === item.id)?.name || "", metaTitle: item.metaTitle, metaDescription: item.metaDescription });
            }
          } catch { /* skip parse errors */ }
        }
      }
    }

    if (target === "page" || target === "all") {
      const where = targetId ? { id: targetId, siteId } : { siteId, OR: [{ metaTitle: null }, { metaDescription: null }] };
      const pages = await prisma.page.findMany({ where: where as any, select: { id: true, title: true, type: true }, take: 20 });

      if (pages.length > 0) {
        const prompt = `Generate SEO meta titles (max 60 chars) and meta descriptions (max 160 chars) for these pages from "${site.name}".
Return ONLY a JSON array: [{ "id": "...", "metaTitle": "...", "metaDescription": "..." }]
Pages: ${JSON.stringify(pages.map((p) => ({ id: p.id, title: p.title, type: p.type })))}`;

        const res = await chatWithAI({ siteId, message: prompt });
        if (res.content) {
          try {
            const parsed = JSON.parse(res.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
            for (const item of parsed) {
              await prisma.page.update({ where: { id: item.id }, data: { metaTitle: item.metaTitle, metaDescription: item.metaDescription } });
              results.push({ id: item.id, type: "page", name: pages.find((p) => p.id === item.id)?.title || "", metaTitle: item.metaTitle, metaDescription: item.metaDescription });
            }
          } catch { /* skip */ }
        }
      }
    }

    if (target === "blog" || target === "all") {
      const where = targetId ? { id: targetId, siteId } : { siteId, OR: [{ metaTitle: null }, { metaDescription: null }] };
      const blogs = await prisma.blog.findMany({ where: where as any, select: { id: true, title: true, excerpt: true }, take: 20 });

      if (blogs.length > 0) {
        const prompt = `Generate SEO meta titles (max 60 chars) and meta descriptions (max 160 chars) for these blog posts from "${site.name}".
Return ONLY a JSON array: [{ "id": "...", "metaTitle": "...", "metaDescription": "..." }]
Blogs: ${JSON.stringify(blogs.map((b) => ({ id: b.id, title: b.title, excerpt: b.excerpt?.slice(0, 80) })))}`;

        const res = await chatWithAI({ siteId, message: prompt });
        if (res.content) {
          try {
            const parsed = JSON.parse(res.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim());
            for (const item of parsed) {
              await prisma.blog.update({ where: { id: item.id }, data: { metaTitle: item.metaTitle, metaDescription: item.metaDescription } });
              results.push({ id: item.id, type: "blog", name: blogs.find((b) => b.id === item.id)?.title || "", metaTitle: item.metaTitle, metaDescription: item.metaDescription });
            }
          } catch { /* skip */ }
        }
      }
    }

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "ai_seo", entityId: siteId, after: { target, updated: results.length } });
    return success({ updated: results.length, results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("AI SEO generate error:", err);
    return error(msg, 500);
  }
}
