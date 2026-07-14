import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { error, getSiteContext, success } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import type { Prisma } from "@/generated/prisma";
import {
  mergeSiteCustomization,
  normalizeSiteCustomization,
  loadSiteCustomizationSafely,
  type SiteCustomizationDocument,
} from "@/lib/site-customization";

type Params = { params: Promise<{ siteId: string }> };

function isMissingCustomizationTableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = `${error.name}: ${error.message}`.toLowerCase();
  return message.includes("site_customizations") || message.includes("p2021") || message.includes("p2022");
}

export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const customization = await loadSiteCustomizationSafely(
    prisma.siteCustomization.findUnique({
      where: { siteId },
    })
  );

  return success({
    siteId,
    customization: normalizeSiteCustomization(customization),
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = (await req.json()) as Partial<SiteCustomizationDocument> & { note?: string };
  const existing = normalizeSiteCustomization(
    await loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId } }))
  );
  const next = mergeSiteCustomization(existing, body);

  if (typeof next.customCss === "string" && next.customCss.length > 250_000) {
    return error("Custom CSS is too large", 400);
  }

  if (typeof next.customJs === "string" && next.customJs.length > 250_000) {
    return error("Custom JavaScript is too large", 400);
  }

  const revisionHistory = [
    ...existing.revisionHistory.slice(-19),
    {
      version: existing.currentVersion,
      savedAt: new Date().toISOString(),
      note: body.note || null,
      snapshot: existing,
    },
  ];

  try {
    const saved = await prisma.siteCustomization.upsert({
      where: { siteId },
      update: {
        themeSettings: next.themeSettings as Prisma.InputJsonValue,
        pageSettings: next.pageSettings as Prisma.InputJsonValue,
        sectionSettings: next.sectionSettings as Prisma.InputJsonValue,
        blockSettings: next.blockSettings as Prisma.InputJsonValue,
        navigationSettings: next.navigationSettings as Prisma.InputJsonValue,
        footerSettings: next.footerSettings as Prisma.InputJsonValue,
        headerSettings: next.headerSettings as Prisma.InputJsonValue,
        mediaAssets: next.mediaAssets as Prisma.InputJsonValue,
        seoSettings: next.seoSettings as Prisma.InputJsonValue,
        revisionHistory: revisionHistory as unknown as Prisma.InputJsonValue,
        customCss: next.customCss,
        customJs: next.customJs,
        currentVersion: existing.currentVersion + 1,
        publishedVersion: existing.currentVersion + 1,
        lastPublishedAt: new Date(),
      },
      create: {
        siteId,
        themeSettings: next.themeSettings as Prisma.InputJsonValue,
        pageSettings: next.pageSettings as Prisma.InputJsonValue,
        sectionSettings: next.sectionSettings as Prisma.InputJsonValue,
        blockSettings: next.blockSettings as Prisma.InputJsonValue,
        navigationSettings: next.navigationSettings as Prisma.InputJsonValue,
        footerSettings: next.footerSettings as Prisma.InputJsonValue,
        headerSettings: next.headerSettings as Prisma.InputJsonValue,
        mediaAssets: next.mediaAssets as Prisma.InputJsonValue,
        seoSettings: next.seoSettings as Prisma.InputJsonValue,
        revisionHistory: revisionHistory as unknown as Prisma.InputJsonValue,
        customCss: next.customCss,
        customJs: next.customJs,
        currentVersion: 1,
        publishedVersion: 1,
        lastPublishedAt: new Date(),
      },
    });

    return success({
      siteId,
      customization: normalizeSiteCustomization(saved),
    });
  } catch (err) {
    if (isMissingCustomizationTableError(err)) {
      return error("Customization storage is not available in this database yet. Apply the site_customizations migration first.", 503);
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getSiteContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const existing = await loadSiteCustomizationSafely(prisma.siteCustomization.findUnique({ where: { siteId } }));
  if (!existing) {
    return success({ reset: true });
  }

  try {
    await prisma.siteCustomization.delete({ where: { siteId } });
    return success({ reset: true });
  } catch (err) {
    if (isMissingCustomizationTableError(err)) {
      return error("Customization storage is not available in this database yet. Apply the site_customizations migration first.", 503);
    }
    throw err;
  }
}
