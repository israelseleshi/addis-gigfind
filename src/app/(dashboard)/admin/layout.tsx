
"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Users, Briefcase, Shield, FileText, 
  Settings, LogOut, Menu
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const adminNavLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/gigs', label: 'Gigs', icon: Briefcase },
  { href: '/admin/verifications', label: 'Verifications', icon: Shield },
  { href: '/admin/reports', label: 'Reports', icon: FileText },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Demo mode - allow access without auth check
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                  AG
                </div>
                <span className="font-bold text-xl">Admin Dashboard</span>
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 bottom-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex-col z-40 transition-all duration-300`}>
          {/* Collapse/Expand Toggle */}
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
          
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminNavLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                  {!isSidebarCollapsed && <span>{link.label}</span>}
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors ${isSidebarCollapsed ? 'px-2' : 'px-4'}`}
            >
              <LogOut className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
