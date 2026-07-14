import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/themes
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search } },
      ];
    }

    const [themes, installedThemes] = await Promise.all([
      prisma.theme.findMany({
        where: where as any,
        orderBy: [{ isFeatured: "desc" }, { installs: "desc" }],
      }),
      prisma.siteTheme.findMany({
        where: { siteId },
        include: { theme: true },
      }),
    ]);

    const installedIds = new Set(installedThemes.map((t) => t.themeId));
    const activeTheme = installedThemes.find((t) => t.isActive);

    const themesWithStatus = themes.map((theme) => ({
      ...theme,
      isInstalled: installedIds.has(theme.id),
      isActive: activeTheme?.themeId === theme.id,
      customConfig: installedThemes.find((t) => t.themeId === theme.id)?.customConfig || null,
    }));

    return success({
      themes: themesWithStatus,
      activeThemeId: activeTheme?.themeId || null,
    });
  } catch (err) {
    console.error("Themes GET error:", err);
    return error("Internal server error", 500);
  }
}

// POST /api/sites/:siteId/themes — install/activate a theme
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  try {
    const body = await req.json();
    const { themeId, activate, customConfig } = body as {
      themeId: string;
      activate?: boolean;
      customConfig?: Record<string, unknown>;
    };

    if (!themeId) return error("themeId is required", 400);

    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme || !theme.isActive) return error("Theme not found", 404);

    // Upsert store theme
    const storeTheme = await prisma.siteTheme.upsert({
      where: { siteId_themeId: { siteId, themeId } },
      create: {
        siteId,
        themeId,
        isActive: activate !== false,
        customConfig: customConfig ? (customConfig as any) : undefined,
      },
      update: {
        isActive: activate !== false,
        customConfig: customConfig !== undefined ? (customConfig as any) : undefined,
      },
      include: { theme: true },
    });

    // If activating, deactivate all other themes
    if (activate !== false) {
      await prisma.siteTheme.updateMany({
        where: { siteId, themeId: { not: themeId } },
        data: { isActive: false },
      });

      // Increment install count if this is a new install
      await prisma.theme.update({
        where: { id: themeId },
        data: { installs: { increment: 1 } },
      });
    }

    return success(storeTheme, 201);
  } catch (err) {
    console.error("Themes POST error:", err);
    return error("Internal server error", 500);
  }
}
