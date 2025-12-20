"use client";

import ClientSidebar from "./ClientSidebar";
import DashboardContent from "./DashboardContent";
import ClientDashboardHeader from "@/components/client-dashboard-header";

export default function ClientDashboardPage() {
  return (
    <div>
      <ClientDashboardHeader />
      <div className="flex flex-1 h-full bg-gray-50">
        {/* Custom sidebar */}
        <ClientSidebar />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <DashboardContent />
        </main>
      </div>
    </div>
  );
}
