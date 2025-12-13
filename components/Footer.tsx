"use client"

import { Briefcase, Facebook, Twitter, Linkedin, Instagram } from "lucide-react"
import Link from "next/link"
import {
  Footer as FooterRoot,
  FooterBottom,
  FooterColumn,
  FooterContent,
} from "@/src/components/ui/footer"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <FooterRoot className="bg-slate-900 text-slate-100 mt-20">
      <div className="container mx-auto max-w-6xl px-4">
        <FooterContent>
          {/* Brand Column */}
          <FooterColumn className="col-span-2 sm:col-span-3 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-blue-400">
              <Briefcase className="w-6 h-6" />
              <span>Addis GigFind</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting skilled professionals with clients in Addis Ababa.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </FooterColumn>

          {/* For Clients */}
          <FooterColumn>
            <h3 className="font-semibold text-white text-sm">For Clients</h3>
            <Link href="/post-gig" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              Post a Gig
            </Link>
            <Link href="/manage-gigs" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              Manage Gigs
            </Link>
            <Link href="/how-it-works" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              How It Works
            </Link>
            <Link href="/pricing" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              Pricing
            </Link>
          </FooterColumn>

          {/* For Workers */}
          <FooterColumn>
            <h3 className="font-semibold text-white text-sm">For Workers</h3>
            <Link href="/find-work" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              Find Work
            </Link>
            <Link href="/my-applications" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              My Applications
            </Link>
            <Link href="/profile" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              My Profile
            </Link>
            <Link href="/earnings" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              Earnings
            </Link>
          </FooterColumn>

          {/* Company */}
          <FooterColumn>
            <h3 className="font-semibold text-white text-sm">Company</h3>
            <Link href="/about" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              About Us
            </Link>
            <Link href="/blog" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              Blog
            </Link>
            <Link href="/contact" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              Contact
            </Link>
            <Link href="/faq" className="text-slate-400 hover:text-blue-400 transition-colors text-sm">
              FAQ
            </Link>
          </FooterColumn>
        </FooterContent>

        {/* Footer Bottom */}
        <FooterBottom className="border-slate-700 text-slate-400">
          <p>© {currentYear} Addis GigFind. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-blue-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </FooterBottom>
      </div>
    </FooterRoot>
  )
}
