"use client";

import { useState } from 'react';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, Users, MessageSquare, Settings, ChevronLeft, ChevronRight } from "lucide-react";

export default function CollapsibleSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: "/client/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/client/gigs", label: "My Gigs", icon: Briefcase },
    { href: "/client/hired", label: "Hired / In-Progress", icon: Users },
    { href: "/client/messages", label: "Messages", icon: MessageSquare },
    { href: "/client/settings", label: "Profile & Settings", icon: Settings },
  ];

  return (
    <div className={cn("relative h-screen border-r border-gray-200 bg-white transition-all duration-300", isCollapsed ? "w-20" : "w-64")}>
      <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-10 z-10 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      <div className="p-4">
        {!isCollapsed && <h2 className="text-lg font-semibold mb-6 px-2">Client Dashboard</h2>}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                isCollapsed ? "justify-center" : ""
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
