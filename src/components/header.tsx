"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Menu } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const [user, setUser] = React.useState<{ id: string; email?: string } | null>(null)
  const [profile, setProfile] = React.useState<{ full_name?: string; avatar_url?: string } | null>(null)
  const [loading, setLoading] = React.useState(true)
  const supabase = createClient()

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single()
        if (profileData) {
          setProfile(profileData)
        }
      }
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        supabase.from('profiles').select('full_name, avatar_url').eq('id', session.user.id).single()
          .then(({ data }) => setProfile(data))
      } else {
        setUser(null)
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getDashboardPath = () => {
    if (!profile?.full_name) return '/onboarding/client'
    return '/client/dashboard'
  }
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ ease: "easeOut", duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-16 items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            AG
          </div>
          <span className="hidden sm:inline">Addis GigFind</span>
        </Link>

        {/* Navigation Menu */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {/* Search */}
            <NavigationMenuItem>
              <Link href="/search" className="px-3 py-2 text-sm font-medium">
                Search
              </Link>
            </NavigationMenuItem>

            {/* About Us */}
            <NavigationMenuItem>
              <Link href="/about" className="px-3 py-2 text-sm font-medium">
                About Us
              </Link>
            </NavigationMenuItem>

            {/* Services */}
            <NavigationMenuItem>
              <Link href="/services" className="px-3 py-2 text-sm font-medium">
                Services
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="inline-flex items-center justify-center rounded-md p-2 hover:bg-accent focus:outline-none"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-6 md:hidden bg-white">
              <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
              <nav className="mt-8 flex flex-col space-y-4">
                <Link href="/search" className="text-lg font-medium">Search</Link>
                <Link href="/about" className="text-lg font-medium">About Us</Link>
                <Link href="/services" className="text-lg font-medium">Services</Link>
                <Separator className="my-4" />
                {loading ? null : user ? (
                  <>
                    <Link href={getDashboardPath()} className="flex items-center gap-3 text-lg font-medium">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={profile?.avatar_url || ''} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(profile?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      {profile?.full_name || 'My Profile'}
                    </Link>
                    <button 
                      onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
                      className="text-lg font-medium text-left text-red-600"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-lg font-medium">Sign In</Link>
                    <Link href="/register" className="text-lg font-medium">Get Started</Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-4">
          {loading ? null : user ? (
            <Link
              href={getDashboardPath()}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{profile?.full_name || 'My Profile'}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
