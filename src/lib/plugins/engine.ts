/**
 * AfroStore Plugin Engine
 *
 * The core execution engine. Like WordPress's do_action() and apply_filters().
 *
 * Usage:
 *   const engine = new PluginEngine(siteId);
 *   await engine.load();                          // Load active plugins
 *   const results = await engine.run("order:created", orderData);
 *   const fees = engine.collectFees(results);     // Aggregate fees from all plugins
 *   const errors = engine.collectErrors(results); // Aggregate validation errors
 */

import { prisma } from "@/lib/db";
import { getHandler } from "./handlers";
import type {
  HookName,
  HookContext,
  HookResult,
  PluginExecResult,
  PluginManifest,
  AddedFee,
  HookAction,
  Notification,
  DashboardWidget,
} from "./types";

interface LoadedPlugin {
  id: string;
  slug: string;
  name: string;
  manifest: PluginManifest;
  settings: Record<string, unknown>;
  storePluginId: string;
}

export class PluginEngine {
  private siteId: string;
  private plugins: LoadedPlugin[] = [];
  private loaded = false;

  constructor(siteId: string) {
    this.siteId = siteId;
  }

  /**
   * Load all active plugins for this store.
   * Call once per request, results are cached on the instance.
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    const storePlugins = await prisma.sitePlugin.findMany({
      where: { siteId: this.siteId, isEnabled: true },
      include: { plugin: true },
    });

    this.plugins = storePlugins
      .filter((sp) => sp.plugin.isActive)
      .map((sp) => {
        const manifest = (sp.plugin.config as unknown as PluginManifest) || this.buildManifest(sp.plugin);
        return {
          id: sp.plugin.id,
          slug: sp.plugin.slug,
          name: sp.plugin.name,
          manifest,
          settings: (sp.settings as Record<string, unknown>) || manifest.defaultSettings || {},
          storePluginId: sp.id,
        };
      });

    this.loaded = true;
  }

  /**
   * Run all plugins subscribed to a hook.
   * Like WordPress do_action() — runs handlers in priority order.
   */
  async run(hook: HookName, data: Record<string, unknown> = {}): Promise<PluginExecResult[]> {
    await this.load();

    // Gather all hook subscribers sorted by priority
    const subscribers: Array<{ plugin: LoadedPlugin; hookDef: { handler: string; priority: number } }> = [];

    for (const plugin of this.plugins) {
      for (const hookDef of plugin.manifest.hooks || []) {
        if (hookDef.hook === hook) {
          subscribers.push({ plugin, hookDef });
        }
      }
    }

    // Sort by priority (lower = first, like WordPress)
    subscribers.sort((a, b) => a.hookDef.priority - b.hookDef.priority);

    // Get store context
    const store = await prisma.site.findUnique({
      where: { id: this.siteId },
      select: { name: true, currency: true, country: true },
    });

    const storeCtx = store || { name: "Store", currency: "NGN", country: "NG" };

    // Execute each subscriber
    const results: PluginExecResult[] = [];
    let currentData = { ...data };

    for (const { plugin, hookDef } of subscribers) {
      const start = performance.now();

      try {
        const handler = getHandler(hookDef.handler);
        if (!handler) {
          results.push({
            pluginSlug: plugin.slug,
            pluginName: plugin.name,
            hook,
            success: false,
            error: `Handler "${hookDef.handler}" not found`,
            durationMs: performance.now() - start,
          });
          continue;
        }

        const ctx: HookContext = {
          siteId: this.siteId,
          hook,
          data: currentData,
          pluginSettings: plugin.settings,
          store: storeCtx,
        };

        const result = await Promise.resolve(handler(ctx));

        // Chain: if handler modified data, pass it to next handler (like apply_filters)
        if (result.modified) {
          currentData = { ...currentData, ...result.modified };
        }

        // Execute side-effect actions
        if (result.actions) {
          await this.executeActions(result.actions, plugin);
        }

        results.push({
          pluginSlug: plugin.slug,
          pluginName: plugin.name,
          hook,
          success: true,
          result,
          durationMs: performance.now() - start,
        });
      } catch (err) {
        results.push({
          pluginSlug: plugin.slug,
          pluginName: plugin.name,
          hook,
          success: false,
          error: (err as Error).message,
          durationMs: performance.now() - start,
        });
      }
    }

    return results;
  }

  // ─── Aggregation helpers ────────────────────────────────

  /** Collect all fees from plugin results */
  collectFees(results: PluginExecResult[]): AddedFee[] {
    return results
      .filter((r) => r.success && r.result?.fees)
      .flatMap((r) => r.result!.fees!);
  }

  /** Collect all validation errors */
  collectErrors(results: PluginExecResult[]): string[] {
    return results
      .filter((r) => r.success && r.result?.errors)
      .flatMap((r) => r.result!.errors!);
  }

  /** Collect all HTML injections */
  collectInjections(results: PluginExecResult[]): string {
    return results
      .filter((r) => r.success && r.result?.inject)
      .map((r) => r.result!.inject!)
      .join("\n");
  }

  /** Collect all notifications */
  collectNotifications(results: PluginExecResult[]): Notification[] {
    return results
      .filter((r) => r.success && r.result?.notifications)
      .flatMap((r) => r.result!.notifications!);
  }

  /** Collect dashboard widgets */
  collectWidgets(results: PluginExecResult[]): DashboardWidget[] {
    return results
      .filter((r) => r.success && r.result?.widgets)
      .flatMap((r) => r.result!.widgets!);
  }

  /** Get modified data after all plugins ran (filter chain result) */
  getModifiedData(results: PluginExecResult[], original: Record<string, unknown>): Record<string, unknown> {
    let data = { ...original };
    for (const r of results) {
      if (r.success && r.result?.modified) {
        data = { ...data, ...r.result.modified };
      }
    }
    return data;
  }

  /** Get loaded plugins info */
  getPlugins() {
    return this.plugins.map((p) => ({
      slug: p.slug,
      name: p.name,
      hooks: p.manifest.hooks?.map((h) => h.hook) || [],
      settingsSchema: p.manifest.settingsSchema || [],
      settings: p.settings,
    }));
  }

  // ─── Private ──────────────────────────────────────────────

  private async executeActions(actions: HookAction[], plugin: LoadedPlugin) {
    for (const action of actions) {
      try {
        switch (action.type) {
          case "create_coupon": {
            const p = action.params;
            await prisma.coupon.create({
              data: {
                siteId: this.siteId,
                code: p.code as string,
                type: ((p.type as string) || "PERCENTAGE") as import("@/generated/prisma").CouponType,
                value: p.value as number,
                maxUses: (p.maxUses as number) || null,
                expiresAt: p.expiresAt ? new Date(p.expiresAt as string) : null,
              },
            });
            break;
          }
          case "log":
            await prisma.auditLog.create({
              data: {
                siteId: this.siteId,
                action: `plugin:${plugin.slug}`,
                entity: "plugin_action",
                after: action.params as any,
              },
            });
            break;
          // WhatsApp/email/SMS notifications are collected and processed by the caller
          default:
            break;
        }
      } catch (err) {
        console.error(`Plugin action error [${plugin.slug}/${action.type}]:`, err);
      }
    }
  }

  private buildManifest(plugin: Record<string, unknown>): PluginManifest {
    return {
      slug: plugin.slug as string,
      name: plugin.name as string,
      version: (plugin.version as string) || "1.0.0",
      description: (plugin.description as string) || "",
      author: (plugin.author as string) || "AfroStore",
      category: (plugin.category as PluginManifest["category"]) || "other",
      isPremium: (plugin.isPremium as boolean) || false,
      tags: [],
      hooks: [],
      settingsSchema: [],
      defaultSettings: {},
      permissions: [],
    };
  }
}

/**
 * Convenience: create engine, load, run hook, return results.
 */
export async function runHook(siteId: string, hook: HookName, data: Record<string, unknown> = {}): Promise<PluginExecResult[]> {
  const engine = new PluginEngine(siteId);
  await engine.load();
  return engine.run(hook, data);
}
