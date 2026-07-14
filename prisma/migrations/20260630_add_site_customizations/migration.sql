-- Add persistent site customization storage
CREATE TABLE IF NOT EXISTS "site_customizations" (
  "id" TEXT PRIMARY KEY,
  "siteId" TEXT NOT NULL UNIQUE,
  "themeSettings" JSONB,
  "pageSettings" JSONB,
  "sectionSettings" JSONB,
  "blockSettings" JSONB,
  "navigationSettings" JSONB,
  "footerSettings" JSONB,
  "headerSettings" JSONB,
  "mediaAssets" JSONB,
  "seoSettings" JSONB,
  "revisionHistory" JSONB,
  "customCss" TEXT,
  "customJs" TEXT,
  "currentVersion" INTEGER NOT NULL DEFAULT 1,
  "publishedVersion" INTEGER NOT NULL DEFAULT 1,
  "lastPublishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "site_customizations_siteId_fkey"
    FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "site_customizations_siteId_idx"
  ON "site_customizations"("siteId");
