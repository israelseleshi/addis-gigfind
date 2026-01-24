
import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { logoutUser } from '@/lib/actions/auth'
import Link from 'next/link'
import { 
  LogOut
} from 'lucide-react'
import { DashboardSidebar, freelancerNavLinks } from '@/components/shared/dashboard-sidebar'

export default async function FreelancerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: profile } = user ? await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single() : { data: null }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/freelancer/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                  AG
                </div>
                <span className="font-bold text-xl">Freelancer Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
                <AvatarFallback>{profile?.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <form action={logoutUser}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar navLinks={freelancerNavLinks} />

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
