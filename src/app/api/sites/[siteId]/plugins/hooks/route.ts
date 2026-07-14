import { NextRequest } from "next/server";
import { getStoreContext, success, error } from "@/lib/api-helpers";
import { unauthorized } from "@/lib/auth";
import { PluginEngine } from "@/lib/plugins";

type Params = { params: Promise<{ siteId: string }> };

// GET — list all active plugin hooks for this store
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const engine = new PluginEngine(siteId);
  await engine.load();

  return success({ plugins: engine.getPlugins() });
}

// POST — manually trigger a hook (for testing)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const body = await req.json();
  const { hook, data = {} } = body;

  if (!hook) return error("hook is required");

  const engine = new PluginEngine(siteId);
  await engine.load();
  const results = await engine.run(hook, data);

  return success({
    hook,
    results,
    fees: engine.collectFees(results),
    errors: engine.collectErrors(results),
    injections: engine.collectInjections(results),
    notifications: engine.collectNotifications(results),
  });
}
