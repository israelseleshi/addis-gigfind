"use client"

import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Briefcase } from "lucide-react"
import Link from "next/link"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <Briefcase className="w-6 h-6" />
            <span>Addis GigFind</span>
          </Link>

          {/* Navigation Menu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-slate-700 hover:text-blue-600">
                  Browse
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-4 space-y-2">
                    <Link href="/gigs" className="block px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-blue-600">
                      Find Gigs
                    </Link>
                    <Link href="/categories" className="block px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-blue-600">
                      Categories
                    </Link>
                    <Link href="/how-it-works" className="block px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-blue-600">
                      How It Works
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-slate-700 hover:text-blue-600">
                  For Clients
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-4 space-y-2">
                    <Link href="/post-gig" className="block px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-blue-600">
                      Post a Gig
                    </Link>
                    <Link href="/manage-gigs" className="block px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-blue-600">
                      Manage Gigs
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-slate-700 hover:text-blue-600">
                  For Workers
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-48 p-4 space-y-2">
                    <Link href="/find-work" className="block px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-blue-600">
                      Find Work
                    </Link>
                    <Link href="/my-applications" className="block px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-blue-600">
                      My Applications
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Sign In
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
