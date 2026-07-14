-- Add customHtml column to site_templates for merchant template customizations
ALTER TABLE "site_templates" ADD COLUMN IF NOT EXISTS "customHtml" TEXT;
