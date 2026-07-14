import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { CNAME_TARGET, SERVER_IP } from "@/lib/domain/domain-manager";

function domainError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function validateDomain(domain: string): string | null {
  const cleaned = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "").trim();
  const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/;
  if (!domainRegex.test(cleaned)) return null;
  return cleaned;
}

// GET — list domains for a site
export async function GET(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return domainError("Unauthorized", 401);
  const { siteId } = await params;

  const site = await prisma.site.findFirst({ where: { id: siteId, workspace: { members: { some: { userId: user.id } } } } });
  if (!site) return domainError("Site not found", 404);

  const domains = await prisma.domain.findMany({ where: { siteId }, orderBy: { createdAt: "desc" } });

  return NextResponse.json({
    success: true,
    data: {
      domains,
      subdomain: `${site.subdomain}.afrostore.com`,
      dnsInstructions: {
        aRecord: SERVER_IP ? { type: "A", name: "@", value: SERVER_IP, ttl: 3600 } : null,
        cnameRecord: { type: "CNAME", name: "@", value: CNAME_TARGET, ttl: 3600 },
        wwwRecord: { type: "CNAME", name: "www", value: CNAME_TARGET, ttl: 3600 },
      },
    },
  });
}

// POST — connect a custom domain
export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return domainError("Unauthorized", 401);
  const { siteId } = await params;

  const site = await prisma.site.findFirst({ where: { id: siteId, workspace: { members: { some: { userId: user.id } } } } });
  if (!site) return domainError("Site not found", 404);

  const body = await req.json();
  const domain = validateDomain(body.domain || "");
  if (!domain) return domainError("Invalid domain format. Enter a domain like mystore.com");

  // Check if domain is already taken
  const existing = await prisma.domain.findUnique({ where: { domain } });
  if (existing && existing.siteId !== siteId) return domainError("This domain is already connected to another store");

  if (existing && existing.siteId === siteId) {
    return NextResponse.json({ success: true, data: existing });
  }

  // Check domain limit (max 5 per site)
  const count = await prisma.domain.count({ where: { siteId } });
  if (count >= 5) return domainError("Maximum 5 custom domains per store");

  const verificationToken = `afrostore-verify-${siteId.slice(0, 8)}-${Date.now().toString(36)}`;

  const newDomain = await prisma.domain.create({
    data: {
      siteId,
      domain,
      type: "CUSTOM",
      status: "PENDING",
      sslStatus: "PENDING",
      verificationToken,
      isPrimary: count === 0,
    },
  });

  // Also update site's customDomain if it's the first/primary
  if (count === 0) {
    await prisma.site.update({ where: { id: siteId }, data: { customDomain: domain } });
  }

  return NextResponse.json({
    success: true,
    data: {
      ...newDomain,
      dnsInstructions: {
        aRecord: SERVER_IP ? { type: "A", name: "@", value: SERVER_IP, ttl: 3600 } : null,
        cnameRecord: { type: "CNAME", name: "@", value: CNAME_TARGET, ttl: 3600 },
        wwwRecord: { type: "CNAME", name: "www", value: CNAME_TARGET, ttl: 3600 },
        txtVerification: { type: "TXT", name: "_afrostore", value: verificationToken, ttl: 3600 },
        note: "Add ONE of the following: an A record pointing to our IP, or a CNAME record pointing to our domain. Also add the TXT record for verification.",
      },
    },
  }, { status: 201 });
}

// DELETE — disconnect a domain
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return domainError("Unauthorized", 401);
  const { siteId } = await params;

  const site = await prisma.site.findFirst({ where: { id: siteId, workspace: { members: { some: { userId: user.id } } } } });
  if (!site) return domainError("Site not found", 404);

  const { searchParams } = new URL(req.url);
  const domainId = searchParams.get("domainId");
  if (!domainId) return domainError("domainId is required");

  const domain = await prisma.domain.findFirst({ where: { id: domainId, siteId } });
  if (!domain) return domainError("Domain not found", 404);

  await prisma.domain.delete({ where: { id: domainId } });

  // If this was the primary domain, clear site's customDomain or set next one
  if (domain.isPrimary) {
    const nextDomain = await prisma.domain.findFirst({ where: { siteId }, orderBy: { createdAt: "asc" } });
    if (nextDomain) {
      await prisma.domain.update({ where: { id: nextDomain.id }, data: { isPrimary: true } });
      await prisma.site.update({ where: { id: siteId }, data: { customDomain: nextDomain.domain } });
    } else {
      await prisma.site.update({ where: { id: siteId }, data: { customDomain: null } });
    }
  }

  return NextResponse.json({ success: true });
}
