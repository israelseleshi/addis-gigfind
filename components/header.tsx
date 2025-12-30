"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { cn } from "@/lib/utils"

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
            {/* Browse */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>Browse</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus-visible:shadow-md"
                        href="/freelancer/find-work"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">Jobs</div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Find freelance opportunities in your field
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/services" title="Services">
                    Browse available services from professionals
                  </ListItem>
                  <ListItem href="/professionals" title="Professionals">
                    Find skilled professionals for your project
                  </ListItem>
                  <ListItem href="/categories" title="Categories">
                    Explore jobs by category
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* For Clients */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>For Clients</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/post-job" title="Post a Job">
                    Create and manage job postings
                  </ListItem>
                  <ListItem href="/find-talent" title="Find Talent">
                    Search and hire skilled professionals
                  </ListItem>
                  <ListItem href="/how-it-works" title="How It Works">
                    Learn how to get started as a client
                  </ListItem>
                  <ListItem href="/pricing" title="Pricing">
                    View our transparent pricing plans
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* For Professionals */}
            <NavigationMenuItem>
              <NavigationMenuTrigger>For Professionals</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem href="/find-work" title="Find Work">
                    Discover freelance opportunities
                  </ListItem>
                  <ListItem href="/build-profile" title="Build Profile">
                    Create a professional profile
                  </ListItem>
                  <ListItem href="/resources" title="Resources">
                    Tips and guides for freelancers
                  </ListItem>
                  <ListItem href="/community" title="Community">
                    Connect with other professionals
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm font-medium text-foreground/70 hover:text-foreground transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.header>
  )
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & {
    title: string
  }
>(({ className, title, children, ...props }, ref) => (
  <li>
    <NavigationMenuLink asChild>
      <a
        ref={ref}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
          className
        )}
        {...props}
      >
        <div className="text-sm font-medium leading-none">{title}</div>
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
          {children}
        </p>
      </a>
    </NavigationMenuLink>
  </li>
))
ListItem.displayName = "ListItem"
