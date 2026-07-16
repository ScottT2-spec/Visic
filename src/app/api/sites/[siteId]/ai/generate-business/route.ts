import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { generateStore } from "@/lib/ai-store-generator";
import { chatWithAI } from "@/lib/ai-service";

export const maxDuration = 300;

type Params = { params: Promise<{ siteId: string }> };

/**
 * AI Business Mode (PRD §11)
 * Auto-generates pages, SEO, brand, email templates, launch checklist
 */
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { businessName, businessType, products, targetAudience, location, description } = body;

    if (!businessName || !businessType) return error("businessName and businessType are required", 400);

    const site = await prisma.site.findUnique({ where: { id: siteId }, select: { slug: true, currency: true } });
    if (!site) return error("Site not found", 404);

    const results: Record<string, unknown> = {};

    // 1. Generate pages
    const storeResult = await generateStore({
      siteId, storeSlug: site.slug, storeName: businessName,
      businessType, description, country: location, currency: site.currency || "GHS",
    });
    results.pages = storeResult.pages;

    // 2. Generate brand, SEO, email templates via AI
    const aiPrompt = `You are an AI business consultant. Generate the following for a ${businessType} business called "${businessName}".
${description ? `Description: ${description}` : ""}
${products ? `Products/Services: ${products}` : ""}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${location ? `Location: ${location}` : ""}

Return ONLY valid JSON:
{
  "brandColors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex", "background": "#hex", "text": "#hex" },
  "tagline": "short catchy tagline",
  "seoTitle": "meta title (max 60 chars)",
  "seoDescription": "meta description (max 160 chars)",
  "socialBio": "short bio for social media (max 160 chars)",
  "emailTemplates": [
    { "name": "Welcome Email", "subject": "subject line", "bodyPreview": "first 2 sentences" },
    { "name": "Order Confirmation", "subject": "subject", "bodyPreview": "first 2 sentences" },
    { "name": "Abandoned Cart", "subject": "subject", "bodyPreview": "first 2 sentences" }
  ],
  "launchChecklist": ["step 1", "step 2"],
  "whatsappTemplate": "greeting message for WhatsApp"
}`;

    const aiResult = await chatWithAI({ siteId, message: aiPrompt });

    if (aiResult.content) {
      try {
        const cleaned = aiResult.content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        results.brand = parsed.brandColors;
        results.tagline = parsed.tagline;
        results.seo = { title: parsed.seoTitle, description: parsed.seoDescription };
        results.socialBio = parsed.socialBio;
        results.emailTemplates = parsed.emailTemplates;
        results.launchChecklist = parsed.launchChecklist;
        results.whatsappTemplate = parsed.whatsappTemplate;

        // Save SEO to site settings
        if (parsed.seoTitle || parsed.seoDescription) {
          await prisma.siteSettings.upsert({
            where: { siteId },
            create: { siteId, metaTitle: parsed.seoTitle, metaDescription: parsed.seoDescription },
            update: { metaTitle: parsed.seoTitle, metaDescription: parsed.seoDescription },
          });
        }
      } catch { results.aiRaw = aiResult.content; }
    }

    // 3. Update site with business info
    await prisma.site.update({
      where: { id: siteId },
      data: { name: businessName, description: description || undefined },
    });

    await logAudit({ siteId, userId: ctx.user!.id, action: "CREATE", entity: "ai_business", entityId: siteId, after: { businessName, businessType, pagesGenerated: storeResult.pages.length } });

    return success({ message: "Business generated successfully", ...results, provider: storeResult.provider, model: storeResult.model });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("AI Business Mode error:", err);
    return error(msg, 500);
  }
}
