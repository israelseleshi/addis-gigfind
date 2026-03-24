import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { logoutUser } from '@/lib/actions/auth'

async function UserNav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
          <Link href="/register">Get Started</Link>
        </Button>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-9 w-9">
        <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
        <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <form action={logoutUser}>
        <Button variant="ghost" type="submit">Logout</Button>
      </form>
    </div>
  )
}

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user ? await supabase.from('profiles').select('role').eq('id', user.id).single() : { data: null }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold text-lg">Addis GigFind</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/freelancer/find-work" className="transition-colors hover:text-amber-500">
            Browse Gigs
          </Link>
          {profile?.role === 'client' && (
            <Link href="/client/dashboard" className="transition-colors hover:text-amber-500">
              My Gigs
            </Link>
          )}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <UserNav />
        </div>
      </div>
    </header>
  )
}
