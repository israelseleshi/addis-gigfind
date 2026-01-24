import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for browser-side usage.
 * Use this in Client Components where you need to interact with Supabase
 * from the user's browser (e.g., auth state changes, real-time subscriptions).
 *
 * @returns A Supabase client configured for browser usage
 *
 * @example
 * // In a client component:
 * import { createClient } from '@/lib/supabase/client'
 * const supabase = createClient()
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
