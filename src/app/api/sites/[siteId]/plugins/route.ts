import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, logAudit } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";

type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/plugins
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  const where: Record<string, unknown> = { isActive: true };
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const [allPlugins, installedPlugins] = await Promise.all([
    prisma.plugin.findMany({
      where: where as any,
      orderBy: [{ installs: "desc" }],
    }),
    prisma.sitePlugin.findMany({
      where: { siteId },
      select: { pluginId: true, isEnabled: true, config: true, installedAt: true },
    }),
  ]);

  const installedMap = new Map(installedPlugins.map((p) => [p.pluginId, p]));

  const plugins = allPlugins.map((plugin) => {
    const installed = installedMap.get(plugin.id);
    return {
      ...plugin,
      rating: Number(plugin.rating),
      isInstalled: !!installed,
      isEnabled: installed?.isEnabled ?? false,
      storeConfig: installed?.config ?? null,
      installedAt: installed?.installedAt ?? null,
    };
  });

  return success(plugins);
}

// POST /api/sites/:siteId/plugins — install/uninstall a plugin
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { pluginId, action, config } = body as {
    pluginId: string;
    action: "install" | "uninstall" | "toggle";
    config?: Record<string, unknown>;
  };

  if (!pluginId) return error("pluginId is required");
  if (!action) return error("action is required (install|uninstall|toggle)");

  const plugin = await prisma.plugin.findUnique({ where: { id: pluginId } });
  if (!plugin) return error("Plugin not found", 404);

  if (action === "uninstall") {
    await prisma.sitePlugin.deleteMany({ where: { siteId, pluginId } });
    await logAudit({
      siteId, userId: ctx.user!.id,
      action: "UNINSTALL_PLUGIN", entity: "plugin", entityId: pluginId,
    });
    return success({ uninstalled: true });
  }

  if (action === "toggle") {
    const existing = await prisma.sitePlugin.findUnique({
      where: { siteId_pluginId: { siteId, pluginId } },
    });
    if (!existing) return error("Plugin not installed", 404);
    const updated = await prisma.sitePlugin.update({
      where: { id: existing.id },
      data: { isEnabled: !existing.isEnabled },
    });
    return success(updated);
  }

  // install
  const storePlugin = await prisma.sitePlugin.upsert({
    where: { siteId_pluginId: { siteId, pluginId } },
    update: { isEnabled: true, config: config as any },
    create: { siteId, pluginId, isEnabled: true, config: config as any },
  });

  await prisma.plugin.update({
    where: { id: pluginId },
    data: { installs: { increment: 1 } },
  });

  await logAudit({
    siteId, userId: ctx.user!.id,
    action: "INSTALL_PLUGIN", entity: "plugin", entityId: pluginId,
  });

  return success(storePlugin, 201);
}
