
"use client"

import { Button } from '@/components/ui/button'
import { logoutUser } from '@/lib/actions/auth'
import Link from 'next/link'
import {
  LogOut,
  Menu,
  X,
  Home,
  Briefcase,
  Users,
  Settings,
  PlusCircle,
  MessageSquare
} from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/client/dashboard', label: 'Dashboard', icon: Home },
    { href: '/client/my-gigs', label: 'My Gigs', icon: Briefcase },
    { href: '/client/chat', label: 'Chat', icon: MessageSquare },
    { href: '/client/applicants', label: 'Applicants', icon: Users },
    { href: '/client/gigs/create', label: 'Post Gig', icon: PlusCircle },
    { href: '/client/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 lg:hidden">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/client/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
              AG
            </div>
            <span className="font-bold text-lg">Addis GigFind</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-zinc-200 flex-col z-40 transition-all duration-300`}>
        <div className={`p-4 border-b border-zinc-200 ${isSidebarCollapsed ? 'flex justify-center' : ''}`}>
          <Link href="/client/dashboard" className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/20 flex-shrink-0">
              AG
            </div>
            {!isSidebarCollapsed && (
              <div>
                <span className="font-bold text-lg">Addis GigFind</span>
                <p className="text-xs text-muted-foreground">Client Portal</p>
              </div>
            )}
          </Link>
        </div>
        
        {/* Collapse/Expand Toggle */}
        <div className="p-2 border-b border-zinc-200">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-4'} py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Icon className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-zinc-200">
          <form action={logoutUser}>
            <Button variant="destructive" className={`w-full ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-start'}`} type="submit">
              <LogOut className={`h-5 w-5 ${isSidebarCollapsed ? '' : 'mr-3'}`} />
              {!isSidebarCollapsed && <span>Logout</span>}
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content - Adjust padding based on sidebar state */}
      <main className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                <Link href="/client/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold">
                    AG
                  </div>
                  <span className="font-bold text-lg">Addis GigFind</span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                        isActive
                          ? 'bg-orange-50 text-orange-600 shadow-sm'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-orange-500' : ''}`} />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
              <div className="p-4 border-t border-zinc-200">
                <form action={logoutUser}>
                  <Button variant="destructive" className="w-full justify-start" type="submit">
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-zinc-200 lg:hidden safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  isActive ? 'text-orange-500' : 'text-zinc-400'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-orange-500' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
      
      {/* Spacer for bottom nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
