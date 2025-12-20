"use client"

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Home, Briefcase, Users, Settings, Search, MessageSquare, LogOut, PanelLeft } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isFreelancer = pathname.startsWith('/freelancer');

  const handleLogout = () => {
    // Clear any user session/token here
    localStorage.removeItem('authToken'); // Adjust based on your auth implementation
    // Redirect to login page
    router.push('/login');
  };

  const isActive = (href: string) => pathname === href;

  const clientNavLinks = [
    { href: "/client/dashboard", label: "Dashboard", icon: Home },
    { href: "/client/my-jobs", label: "My Jobs", icon: Briefcase },
    { href: "/client/profile", label: "Profile", icon: Users },
    { href: "/client/settings", label: "Settings", icon: Settings },
  ];

  const freelancerNavLinks = [
    { href: "/freelancer/dashboard", label: "Overview", icon: Home },
    { href: "/freelancer/find-work", label: "Find Work", icon: Search },
    { href: "/freelancer/my-jobs", label: "My Jobs", icon: Briefcase },
    { href: "/freelancer/messages", label: "Messages", icon: MessageSquare },
    { href: "/freelancer/profile", label: "Profile & Identity", icon: Users },
  ];

  const navLinks = isFreelancer ? freelancerNavLinks : clientNavLinks;

  // This layout is now deprecated and the logic is handled in the respective dashboards
  return <main className="flex-1">{children}</main>;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-slate-50/50">
        <Sidebar collapsible="icon" className="flex flex-col group">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-muted-foreground">Navigation</span>
            <SidebarTrigger className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent hover:bg-muted">
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </SidebarTrigger>
          </div>
          <SidebarMenu className="flex-1">
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href}>
                  <SidebarMenuButton asChild isActive={isActive(link.href)} className="cursor-pointer">
                    <span>
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <SidebarMenuItem>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </SidebarMenuItem>
            </div>
          </SidebarMenu>
        </Sidebar>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-slate-50/50">
        <Sidebar collapsible="icon" className="flex flex-col group">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <span className="text-sm font-medium text-muted-foreground">Navigation</span>
            <SidebarTrigger className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent hover:bg-muted">
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">Toggle Sidebar</span>
            </SidebarTrigger>
          </div>
          <SidebarMenu className="flex-1">
            {navLinks.map((link) => (
              <SidebarMenuItem key={link.href}>
                <Link href={link.href}>
                  <SidebarMenuButton asChild isActive={isActive(link.href)} className="cursor-pointer">
                    <span>
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                    </span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <SidebarMenuItem>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </SidebarMenuItem>
            </div>
          </SidebarMenu>
        </Sidebar>
        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
