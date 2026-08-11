import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const fetchWithRetry: typeof fetch = async (url, options) => {
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      attempts++;
      return await fetch(url, options);
    } catch (err: any) {
      const isConnectTimeout =
        err?.name === 'ConnectTimeoutError' ||
        err?.message?.includes('Connect Timeout Error') ||
        err?.message?.includes('fetch failed') ||
        err?.code === 'UND_ERR_CONNECT_TIMEOUT';

      if (isConnectTimeout && attempts < maxAttempts) {
        console.warn(
          `[Supabase Fetch Retry] Attempt ${attempts}/${maxAttempts} failed for ${url}: ${err.message}. Retrying...`
        );
        await new Promise((resolve) => setTimeout(resolve, 500 * attempts));
      } else {
        throw err;
      }
    }
  }
  return await fetch(url, options);
};

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithRetry,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
