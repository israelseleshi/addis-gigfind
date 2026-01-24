"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Settings, Search, LucideIcon } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface DashboardSidebarProps {
  navLinks: NavLink[];
}

export function DashboardSidebar({ navLinks }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)]">
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
              }`}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export const clientNavLinks: NavLink[] = [
  { href: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/my-jobs', label: 'My Jobs', icon: Briefcase },
  { href: '/client/settings', label: 'Settings', icon: Settings },
];

export const freelancerNavLinks: NavLink[] = [
  { href: '/freelancer/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/freelancer/find-work', label: 'Find Work', icon: Search },
  { href: '/freelancer/my-applications', label: 'My Applications', icon: Briefcase },
  { href: '/freelancer/settings', label: 'Settings', icon: Settings },
];
