import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes - match actual client and freelancer routes
  if (request.nextUrl.pathname.startsWith('/client') ||
      request.nextUrl.pathname.startsWith('/freelancer') ||
      request.nextUrl.pathname.startsWith('/onboarding')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Redirect logged in users away from auth pages
  if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/register')) {
    if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()
      
      const redirectUrl = profile?.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/client/:path*',
    '/freelancer/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
  ],
}
