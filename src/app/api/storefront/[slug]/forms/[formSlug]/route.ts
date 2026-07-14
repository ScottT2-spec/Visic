import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ slug: string; formSlug: string }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/storefront/:slug/forms/:formSlug — get form fields (public)
export async function GET(_req: NextRequest, { params }: Params) {
  const { slug, formSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true },
    });
    if (!site) return json({ success: false, error: "Site not found" }, 404);

    const form = await prisma.form.findFirst({
      where: { siteId: site.id, slug: formSlug, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        fields: true,
        submitButtonText: true,
        successMessage: true,
      },
    });

    if (!form) return json({ success: false, error: "Form not found" }, 404);
    return json({ success: true, data: form });
  } catch (err) {
    console.error("GET form error:", err);
    return json({ success: false, error: "Internal server error" }, 500);
  }
}

// POST /api/storefront/:slug/forms/:formSlug — submit form (public)
export async function POST(req: NextRequest, { params }: Params) {
  const { slug, formSlug } = await params;

  try {
    const site = await prisma.site.findFirst({
      where: {
        status: "ACTIVE",
        OR: [{ slug }, { subdomain: slug }, { customDomain: slug }],
      },
      select: { id: true },
    });
    if (!site) return json({ success: false, error: "Site not found" }, 404);

    const form = await prisma.form.findFirst({
      where: { siteId: site.id, slug: formSlug, isActive: true },
    });
    if (!form) return json({ success: false, error: "Form not found" }, 404);

    const body = await req.json();
    const fields = form.fields as Array<{ id: string; label: string; type: string; required?: boolean }>;

    // Validate required fields
    for (const field of fields) {
      if (field.required) {
        const value = body[field.id];
        if (value === undefined || value === null || value === "") {
          return json({ success: false, error: `${field.label} is required` }, 400);
        }
      }
    }

    // Validate email fields
    for (const field of fields) {
      if (field.type === "email" && body[field.id]) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body[field.id])) {
          return json({ success: false, error: `${field.label} must be a valid email` }, 400);
        }
      }
    }

    // Rate limit: max 10 submissions per IP per form per hour
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.formSubmission.count({
      where: { formId: form.id, ip, createdAt: { gte: oneHourAgo } },
    });
    if (recentCount >= 10) {
      return json({ success: false, error: "Too many submissions. Please try again later." }, 429);
    }

    // Save submission
    const submission = await prisma.formSubmission.create({
      data: {
        formId: form.id,
        data: body,
        ip,
        userAgent: req.headers.get("user-agent") || undefined,
        source: req.headers.get("referer") || undefined,
      },
    });

    // Increment submission count
    await prisma.form.update({
      where: { id: form.id },
      data: { submissionCount: { increment: 1 } },
    });

    return json({
      success: true,
      data: {
        id: submission.id,
        message: form.successMessage || "Thank you! Your submission has been received.",
      },
    }, 201);
  } catch (err) {
    console.error("Form submission error:", err);
    return json({ success: false, error: "Failed to submit form" }, 500);
  }
}
