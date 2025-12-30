"use client";

import { Sidebar } from "@/components/sidebar";
import DashboardHeader from '@/components/dashboard-header';
import { Home, Package, ShoppingCart, Users } from "lucide-react";

const navItems = [
  { href: "/freelancer/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/freelancer/gigs", icon: <Package className="h-4 w-4" />, label: "Active Gigs" },
  { href: "/freelancer/proposals", icon: <Users className="h-4 w-4" />, label: "Proposals" },
  { href: "/freelancer/messages", icon: <ShoppingCart className="h-4 w-4" />, label: "Messages", badge: 2 },
];

export default function FreelancerDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar navItems={navItems} />
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

