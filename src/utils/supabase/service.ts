import { createClient as createServerClient } from '@supabase/supabase-js';

/**
 * Service client — bypasses RLS.
 * Only use in trusted server-side actions (never client-side).
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment variables.
 */
export function createServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn(
      'WARNING: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables. ' +
        'Falling back to NEXT_PUBLIC_SUPABASE_ANON_KEY. This might cause permission errors ' +
        'if Row Level Security (RLS) is enabled on the target table.',
    );
  }
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}
