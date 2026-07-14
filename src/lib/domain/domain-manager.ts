/**
 * Domain Manager Service — orchestrates domain connection, verification, and cleanup.
 * Provider-agnostic: works by generating configs and managing state in the DB.
 */

import dns from "dns";
import { promisify } from "util";
import { prisma } from "@/lib/db";
import { generateNginxServerBlock, generateNginxHttpOnlyBlock, getNginxConfigFilename } from "./nginx-generator";

const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

// The IP/CNAME that custom domains should point to
// Override via environment variables for your deployment
export const SERVER_IP = process.env.SERVER_IP || process.env.NEXT_PUBLIC_SERVER_IP || "";
export const CNAME_TARGET = process.env.CNAME_TARGET || process.env.NEXT_PUBLIC_CNAME_TARGET || "cname.afrostore.com";
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "afrostore.com";

export interface DomainConnectionResult {
  success: boolean;
  domain?: string;
  status?: string;
  dnsInstructions?: DnsInstructions;
  error?: string;
}

export interface DnsInstructions {
  aRecord?: { type: "A"; name: string; value: string; ttl: number };
  cnameRecord?: { type: "CNAME"; name: string; value: string; ttl: number };
  note: string;
}

export interface DnsVerificationResult {
  verified: boolean;
  method?: "A" | "CNAME";
  resolvedTo?: string;
  expected?: string;
  error?: string;
  message: string;
}

/**
 * Validate a domain string: no protocol, no path, just the domain.
 */
export function validateDomain(domain: string): { valid: boolean; error?: string } {
  const trimmed = domain.trim().toLowerCase();

  if (!trimmed) return { valid: false, error: "Domain is required" };
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return { valid: false, error: "Domain should not include protocol (http:// or https://)" };
  }
  if (trimmed.includes("/")) {
    return { valid: false, error: "Domain should not include a path" };
  }
  if (trimmed.includes("@")) {
    return { valid: false, error: "Invalid domain format" };
  }

  // Basic domain regex: letters, numbers, hyphens, dots
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(trimmed)) {
    return { valid: false, error: "Invalid domain format. Use format: yourdomain.com" };
  }

  return { valid: true };
}

/**
 * Get DNS instructions for connecting a custom domain.
 */
export function getDnsInstructions(domain: string): DnsInstructions {
  const instructions: DnsInstructions = {
    note: `Add ONE of the following DNS records to your domain provider. CNAME is recommended if your provider supports it.`,
  };

  if (CNAME_TARGET) {
    instructions.cnameRecord = {
      type: "CNAME",
      name: domain.startsWith("www.") ? domain : "@",
      value: CNAME_TARGET,
      ttl: 3600,
    };
  }

  if (SERVER_IP) {
    instructions.aRecord = {
      type: "A",
      name: "@",
      value: SERVER_IP,
      ttl: 3600,
    };
  }

  return instructions;
}

/**
 * Connect a custom domain to a site.
 * Creates a Domain record and updates Site.customDomain.
 */
export async function connectDomain(siteId: string, domain: string): Promise<DomainConnectionResult> {
  const normalized = domain.trim().toLowerCase();

  // Validate
  const validation = validateDomain(normalized);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check if domain is already taken by another site
  const existing = await prisma.domain.findUnique({
    where: { domain: normalized },
  });

  if (existing && existing.siteId !== siteId) {
    return { success: false, error: "This domain is already connected to another site" };
  }

  // If domain record already exists for this site, return it
  if (existing && existing.siteId === siteId) {
    return {
      success: true,
      domain: normalized,
      status: existing.status,
      dnsInstructions: getDnsInstructions(normalized),
    };
  }

  // Create Domain record
  const verificationToken = `afrostore-verify-${siteId.slice(0, 8)}-${Date.now().toString(36)}`;
  const domainCount = await prisma.domain.count({ where: { siteId } });

  await prisma.domain.create({
    data: {
      siteId,
      domain: normalized,
      type: "CUSTOM",
      status: "PENDING",
      sslStatus: "PENDING",
      verificationToken,
      isPrimary: domainCount === 0,
    },
  });

  // Update Site.customDomain if it's the first domain
  if (domainCount === 0) {
    await prisma.site.update({
      where: { id: siteId },
      data: { customDomain: normalized },
    });
  }

  const dnsInstructions = getDnsInstructions(normalized);

  return {
    success: true,
    domain: normalized,
    status: "PENDING",
    dnsInstructions,
  };
}

/**
 * Perform a DNS lookup to verify the domain points to this server.
 */
export async function checkDnsResolution(domain: string): Promise<DnsVerificationResult> {
  // Try CNAME first
  if (CNAME_TARGET) {
    try {
      const cnames = await resolveCname(domain);
      if (cnames.some((c) => c.toLowerCase().includes(CNAME_TARGET.toLowerCase()) || c.toLowerCase() === CNAME_TARGET.toLowerCase())) {
        return {
          verified: true,
          method: "CNAME",
          resolvedTo: cnames[0],
          expected: CNAME_TARGET,
          message: `✓ Domain correctly points to ${CNAME_TARGET} via CNAME`,
        };
      }
    } catch {
      // CNAME lookup failed, try A record
    }
  }

  // Try A record
  if (SERVER_IP) {
    try {
      const ips = await resolve4(domain);
      if (ips.includes(SERVER_IP)) {
        return {
          verified: true,
          method: "A",
          resolvedTo: ips[0],
          expected: SERVER_IP,
          message: `✓ Domain correctly points to ${SERVER_IP} via A record`,
        };
      } else {
        return {
          verified: false,
          method: "A",
          resolvedTo: ips[0],
          expected: SERVER_IP,
          message: `Domain resolves to ${ips[0]} but expected ${SERVER_IP}. DNS may still be propagating.`,
        };
      }
    } catch {
      // A record lookup failed
    }
  }

  // Try AAAA if we have an IPv6 address
  try {
    const ips6 = await resolve6(domain);
    if (ips6.length > 0) {
      return {
        verified: false,
        resolvedTo: ips6[0],
        message: `Domain resolves to IPv6 ${ips6[0]}. Please add an A record or CNAME pointing to our server.`,
      };
    }
  } catch {
    // IPv6 lookup failed
  }

  return {
    verified: false,
    message: "Domain does not resolve. Please check your DNS settings and wait for propagation (can take up to 48 hours).",
  };
}

/**
 * Verify DNS configuration and update domain status in DB.
 * Works with the Domain model (not Site fields).
 */
export async function verifyDomain(siteId: string): Promise<DnsVerificationResult & { domainStatus: string }> {
  // Find the primary domain for this site
  const domainRecord = await prisma.domain.findFirst({
    where: { siteId, isPrimary: true },
  });

  if (!domainRecord) {
    // Fall back to any domain
    const anyDomain = await prisma.domain.findFirst({ where: { siteId } });
    if (!anyDomain) {
      return {
        verified: false,
        message: "No custom domain connected",
        domainStatus: "NONE",
      };
    }
    return verifyDomainRecord(anyDomain.id, anyDomain.domain);
  }

  return verifyDomainRecord(domainRecord.id, domainRecord.domain);
}

async function verifyDomainRecord(domainId: string, domain: string): Promise<DnsVerificationResult & { domainStatus: string }> {
  const result = await checkDnsResolution(domain);

  const newStatus = result.verified ? "ACTIVE" : "PENDING";
  await prisma.domain.update({
    where: { id: domainId },
    data: {
      status: newStatus,
      dnsVerified: result.verified,
    },
  });

  return { ...result, domainStatus: newStatus };
}

/**
 * Remove a custom domain from a site.
 * Deletes Domain record and clears Site.customDomain.
 */
export async function removeDomain(siteId: string): Promise<void> {
  // Delete all domain records for this site
  await prisma.domain.deleteMany({ where: { siteId } });

  // Clear customDomain on Site
  await prisma.site.update({
    where: { id: siteId },
    data: { customDomain: null },
  });
}

/**
 * Generate nginx config string for a domain.
 */
export function generateNginxConfig(domain: string, upstreamPort: number = 3000, ssl = true): string {
  if (ssl) {
    return generateNginxServerBlock({ domain, upstreamPort, includeWww: true });
  }
  return generateNginxHttpOnlyBlock({ domain, upstreamPort, includeWww: true });
}

/**
 * Get the nginx config filename for a domain.
 */
export function getDomainConfigFilename(domain: string): string {
  return getNginxConfigFilename(domain);
}

/**
 * Get domain info for a site.
 * Reads from Domain model instead of Site fields.
 */
export async function getDomainInfo(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      subdomain: true,
      customDomain: true,
    },
  });

  if (!site) return null;

  // Get the primary domain record
  const domainRecord = await prisma.domain.findFirst({
    where: { siteId, isPrimary: true },
  });

  const dnsInstructions = site.customDomain
    ? getDnsInstructions(site.customDomain)
    : getDnsInstructions("");

  return {
    subdomain: site.subdomain,
    freeSubdomain: `${site.subdomain}.${APP_DOMAIN}`,
    customDomain: site.customDomain,
    domainStatus: domainRecord?.status || "NONE",
    domainVerifiedAt: domainRecord?.dnsVerified ? domainRecord.updatedAt : null,
    sslStatus: domainRecord?.sslStatus || "NONE",
    dnsInstructions: site.customDomain ? dnsInstructions : null,
  };
}
