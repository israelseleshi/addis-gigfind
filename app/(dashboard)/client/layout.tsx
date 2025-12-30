"use client";

import ClientDashboardHeader from "@/components/client-dashboard-header";
import { Sidebar } from "@/components/sidebar";
import { Home, Package, ShoppingCart, Users } from "lucide-react";

const navItems = [
  { href: "/client/dashboard", icon: <Home className="h-4 w-4" />, label: "Dashboard" },
  { href: "/client/gigs", icon: <Package className="h-4 w-4" />, label: "My Gigs" },
  { href: "/client/hired", icon: <Users className="h-4 w-4" />, label: "Hired Freelancers" },
  { href: "/client/messages", icon: <ShoppingCart className="h-4 w-4" />, label: "Messages", badge: 3 },
];

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <Sidebar navItems={navItems} />
      <div className="flex flex-col">
        <ClientDashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

