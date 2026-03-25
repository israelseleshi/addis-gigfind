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

export function Header() {
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
                <Link href="/login" className="text-lg font-medium">Sign In</Link>
                <Link href="/register" className="text-lg font-medium">Get Started</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-4">
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
        </div>
      </div>
    </motion.header>
  )
}
