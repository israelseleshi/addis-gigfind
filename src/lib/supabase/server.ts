import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates a Supabase client for server-side usage.
 * Use this in Server Components and Server Actions where you need to
 * interact with Supabase on the server (e.g., authenticated requests, data fetching).
 *
 * This client handles cookies automatically for session management.
 *
 * @returns A Supabase client configured for server usage
 *
 * @example
 * // In a server component:
 * import { createClient } from '@/lib/supabase/server'
 * const supabase = await createClient()
 *
 * @example
 * // In a server action:
 * import { createClient } from '@/lib/supabase/server'
 * export async function myAction() {
 *   const supabase = await createClient()
 *   // ... use supabase
 * }
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
