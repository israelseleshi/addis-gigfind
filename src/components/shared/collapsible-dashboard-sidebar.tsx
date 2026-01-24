"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useState } from 'react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface CollapsibleDashboardSidebarProps {
  navLinks: NavLink[];
}

export function CollapsibleDashboardSidebar({ navLinks }: CollapsibleDashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className={`relative h-screen border-r border-gray-200 bg-white transition-all duration-300 ${isCollapsed ? "w-20" : "w-64"}`}>
      {/* Collapser Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)} 
        className="absolute -right-3 top-10 z-10 h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
      >
        {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                active
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-50'
              } ${isCollapsed ? 'justify-center' : ''}`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
