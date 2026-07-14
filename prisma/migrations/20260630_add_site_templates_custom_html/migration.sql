-- Add merchant-edited HTML storage for template snapshots
ALTER TABLE "site_templates"
ADD COLUMN IF NOT EXISTS "customHtml" TEXT;
