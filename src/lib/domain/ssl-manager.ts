/**
 * SSL Manager — generates certbot commands and tracks SSL status.
 * This is a command generator only; it does NOT execute commands.
 * The generated commands should be run by the deployment system or admin.
 */

export interface CertbotCommandOptions {
  domain: string;
  email: string;
  includeWww?: boolean;
  staging?: boolean; // use --staging for testing
  webroot?: string;  // webroot path for challenge (default: /var/www/certbot)
}

export interface SSLStatusInfo {
  status: "NONE" | "PENDING" | "ACTIVE" | "ERROR";
  domain: string;
  expiresAt?: Date;
  renewsAt?: Date; // 30 days before expiry
  certPath?: string;
  keyPath?: string;
}

/**
 * Generate the certbot command to obtain a new SSL certificate.
 */
export function generateCertbotObtainCommand(options: CertbotCommandOptions): string {
  const {
    domain,
    email,
    includeWww = true,
    staging = false,
    webroot = "/var/www/certbot",
  } = options;

  const domains = includeWww ? `-d ${domain} -d www.${domain}` : `-d ${domain}`;
  const stagingFlag = staging ? " --staging" : "";

  return `certbot certonly --webroot \\
  --webroot-path ${webroot} \\
  --email ${email} \\
  --agree-tos \\
  --no-eff-email${stagingFlag} \\
  --force-renewal \\
  ${domains}`;
}

/**
 * Generate the certbot command to renew all certificates.
 */
export function generateCertbotRenewCommand(dryRun = false): string {
  const dryRunFlag = dryRun ? " --dry-run" : "";
  return `certbot renew${dryRunFlag} --webroot --webroot-path /var/www/certbot`;
}

/**
 * Generate the certbot command to revoke and delete a certificate.
 */
export function generateCertbotRevokeCommand(domain: string): string {
  return `certbot delete --cert-name ${domain}`;
}

/**
 * Generate a cron job entry for auto-renewal (runs twice daily as recommended).
 */
export function generateRenewalCronEntry(logPath = "/var/log/certbot-renew.log"): string {
  return `0 0,12 * * * root certbot renew --webroot --webroot-path /var/www/certbot --quiet >> ${logPath} 2>&1`;
}

/**
 * Generate a Docker run command for certbot (for Docker Compose setups).
 */
export function generateDockerCertbotCommand(options: CertbotCommandOptions): string {
  const {
    domain,
    email,
    includeWww = true,
    staging = false,
  } = options;

  const domains = includeWww
    ? `-d ${domain} -d www.${domain}`
    : `-d ${domain}`;
  const stagingFlag = staging ? " --staging" : "";

  return `docker run --rm \\
  -v /etc/letsencrypt:/etc/letsencrypt \\
  -v /var/www/certbot:/var/www/certbot \\
  certbot/certbot certonly --webroot \\
  --webroot-path=/var/www/certbot \\
  --email ${email} \\
  --agree-tos \\
  --no-eff-email${stagingFlag} \\
  --force-renewal \\
  ${domains}`;
}

/**
 * Get the expected certificate paths for a domain.
 */
export function getCertPaths(domain: string): { cert: string; key: string; fullchain: string } {
  const base = `/etc/letsencrypt/live/${domain}`;
  return {
    cert: `${base}/cert.pem`,
    key: `${base}/privkey.pem`,
    fullchain: `${base}/fullchain.pem`,
  };
}

/**
 * Calculate renewal date (30 days before expiry).
 */
export function calculateRenewalDate(expiresAt: Date): Date {
  const renewsAt = new Date(expiresAt);
  renewsAt.setDate(renewsAt.getDate() - 30);
  return renewsAt;
}

/**
 * Check if a certificate should be renewed soon (within 30 days).
 */
export function shouldRenewSoon(expiresAt: Date): boolean {
  const now = new Date();
  const renewsAt = calculateRenewalDate(expiresAt);
  return now >= renewsAt;
}

/**
 * Generate full SSL setup instructions for a domain.
 */
export function generateSSLSetupInstructions(options: CertbotCommandOptions): string {
  const { domain, email, includeWww = true } = options;

  const lines = [
    `# SSL Setup Instructions for ${domain}`,
    `# Generated: ${new Date().toISOString()}`,
    ``,
    `# Step 1: Ensure DNS is configured and pointing to this server`,
    `# Step 2: Ensure nginx is running with the HTTP-only config`,
    `# Step 3: Run the following certbot command:`,
    ``,
    generateCertbotObtainCommand({ domain, email, includeWww }),
    ``,
    `# Step 4: Update nginx config to use SSL (replace HTTP-only config)`,
    `# Step 5: Reload nginx:`,
    `nginx -s reload`,
    ``,
    `# Step 6: Set up auto-renewal cron:`,
    `echo "${generateRenewalCronEntry()}" | sudo tee /etc/cron.d/certbot`,
  ];

  return lines.join("\n");
}
