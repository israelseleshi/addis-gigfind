import Link from "next/link";
import { Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 py-12">
        <div className="space-y-4 col-span-2 md:col-span-1">
          <h3 className="text-2xl font-bold">Addis GigFind</h3>
          <p className="text-foreground/60">A Local Skills Marketplace</p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">For Clients</h4>
          <Link href="#" className="block text-foreground/60 hover:text-foreground">Post a Gig</Link>
          <Link href="#" className="block text-foreground/60 hover:text-foreground">Browse Freelancers</Link>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">For Freelancers</h4>
          <Link href="#" className="block text-foreground/60 hover:text-foreground">Find Work</Link>
          <Link href="#" className="block text-foreground/60 hover:text-foreground">Create Profile</Link>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Company</h4>
          <Link href="#" className="block text-foreground/60 hover:text-foreground">About Us</Link>
          <Link href="#" className="block text-foreground/60 hover:text-foreground">Contact</Link>
        </div>
      </div>
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-4 py-6 border-t">
        <p className="text-sm text-foreground/60">&copy; {new Date().getFullYear()} Addis GigFind. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="transition-colors hover:text-foreground"><Twitter className="h-5 w-5" /></a>
          <a href="#" className="transition-colors hover:text-foreground"><Github className="h-5 w-5" /></a>
          <a href="#" className="transition-colors hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
        </div>
      </div>
    </footer>
  );
}
