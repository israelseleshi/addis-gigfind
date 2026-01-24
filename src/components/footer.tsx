import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8">
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>
          {/* Marketplace */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/categories">Categories</Link></li>
              <li><Link href="/professionals">Professionals</Link></li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
            </ul>
          </div>
          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#">Terms of Service</Link></li>
              <li><Link href="#">Privacy Policy</Link></li>
            </ul>
          </div>
          {/* Newsletter */}
          <div className="col-span-2 sm:col-span-1 md:col-span-1">
            <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for the latest news.</p>
            <form className="flex w-full max-w-sm">
              <input type="email" placeholder="Email" className="flex-1 rounded-l-md border border-border px-3 py-2 text-sm focus:outline-none" />
              <button type="submit" className="rounded-r-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Subscribe</button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Addis GigFind. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></a>
            <a href="#" aria-label="GitHub" className="text-muted-foreground hover:text-primary"><Github className="h-5 w-5" /></a>
            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
