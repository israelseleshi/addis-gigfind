"use client";

import CollapsibleSidebar from "./dashboard/CollapsibleSidebar";
import ClientDashboardHeader from "@/components/client-dashboard-header";

export default function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ClientDashboardHeader />
      <div className="flex flex-1 h-full bg-gray-50">
        {/* Custom sidebar */}
        <CollapsibleSidebar />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
