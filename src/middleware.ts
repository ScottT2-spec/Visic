import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to route custom domains and subdomains to the correct store.
 *
 * Flow:
 *   mystore.afrostore.com/anything  →  internally rewrite to /store/mystore/anything
 *   mycustomdomain.com/anything     →  internally rewrite to /store/mycustomdomain.com/anything
 *   afrostore.com/anything          →  pass through (main app)
 */

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "afrostore.com";

// Paths that should NEVER be rewritten (app infrastructure)
const BYPASS_PREFIXES = [
  "/api/",
  "/_next/",
  "/static/",
  "/js/",
  "/favicon",
  "/robots.txt",
  "/sitemap",
  "/manifest",
  "/uploads/",
  // App pages (not store pages)
  "/dashboard",
  "/admin",
  "/builder",
  "/checkout",
  "/auth",
  "/login",
  "/register",
  "/signup",
  "/onboarding",
  "/verify",
  "/reset-password",
  "/invite",
  "/store/",  // Already has /store/ prefix — don't double-rewrite
];

export function middleware(req: NextRequest) {
  const hostname =
    req.headers.get("x-forwarded-host") ||
    req.headers.get("host") ||
    "";

  // Strip port if present (e.g., localhost:3000)
  const host = hostname.split(":")[0].toLowerCase();
  const pathname = req.nextUrl.pathname;

  // 1. Skip bypass paths
  for (const prefix of BYPASS_PREFIXES) {
    if (pathname.startsWith(prefix) || pathname === prefix.replace(/\/$/, "")) {
      return NextResponse.next();
    }
  }

  // 2. Check if this is the main app domain (no rewrite needed)
  const isMainDomain =
    host === APP_DOMAIN ||
    host === `www.${APP_DOMAIN}` ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "" ||  // Missing host header
    host.endsWith(".vercel.app");  // Vercel preview/production domains

  if (isMainDomain) {
    return NextResponse.next();
  }

  // 3. Check if this is a subdomain of the app domain
  //    e.g., mystore.afrostore.com → slug = "mystore"
  let storeSlug: string | null = null;

  if (host.endsWith(`.${APP_DOMAIN}`)) {
    const subdomain = host.replace(`.${APP_DOMAIN}`, "");
    // Ignore www, mail, etc.
    if (subdomain && subdomain !== "www" && subdomain !== "mail" && subdomain !== "admin" && !subdomain.includes(".")) {
      storeSlug = subdomain;
    }
  }

  // 4. If not a subdomain, it's a custom domain
  //    e.g., mycoolstore.com → slug = "mycoolstore.com"
  if (!storeSlug) {
    storeSlug = host;
  }

  // 5. Rewrite to /store/[slug]/...
  //    The store page + API routes already look up by slug, subdomain, OR customDomain
  const url = req.nextUrl.clone();
  const storePath = pathname === "/" ? "" : pathname;
  url.pathname = `/store/${storeSlug}${storePath}`;

  return NextResponse.rewrite(url);
}

export const config = {
  // Run middleware on all paths except static files
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder files with extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
