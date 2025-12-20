"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Briefcase, Users, Settings } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/client/dashboard">
                <SidebarMenuButton asChild isActive={isActive("/client/dashboard")}>
                  <span>
                    <Home className="w-4 h-4" />
                    Dashboard
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/client/my-jobs">
                <SidebarMenuButton asChild isActive={isActive("/client/my-jobs")}>
                  <span>
                    <Briefcase className="w-4 h-4" />
                    My Jobs
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/client/profile">
                <SidebarMenuButton asChild isActive={isActive("/client/profile")}>
                  <span>
                    <Users className="w-4 h-4" />
                    Profile
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/client/settings">
                <SidebarMenuButton asChild isActive={isActive("/client/settings")}>
                  <span>
                    <Settings className="w-4 h-4" />
                    Settings
                  </span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
        <main className="flex-1 overflow-y-auto">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </header>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
