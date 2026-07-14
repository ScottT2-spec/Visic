import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side client with service role (for uploads, admin ops)
// Lazy-init to avoid crashing at build time when env vars aren't set
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }
  return _supabaseAdmin;
}

/** @deprecated Use getSupabaseAdmin() instead — kept for backward compat */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseAdmin() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const STORAGE_BUCKET = "uploads";

/**
 * Get the public URL for a file in the uploads bucket
 */
export function getPublicUrl(filePath: string): string {
  const { data } = getSupabaseAdmin().storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}
