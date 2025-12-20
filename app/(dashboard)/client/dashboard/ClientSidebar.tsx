"use client";

import { useDashboardStore } from "./dashboard-store";
import { cn } from "@/lib/utils";
import { Briefcase, MessageSquare, User, Settings } from "lucide-react";

export default function ClientSidebar() {
  const { activeTab, setTab } = useDashboardStore();
  
  const menuItems = [
    { id: "gigs", label: "My Gigs", icon: Briefcase },
    { id: "hired", label: "Hired / In-Progress", icon: Briefcase },
    { id: "messages", label: "Messages", icon: MessageSquare },
    { id: "profile", label: "Profile & Settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-full border-r border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold mb-6 px-2">Client Dashboard</h2>
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={cn(
              'w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors',
              activeTab === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
