"use client";

import ClientSidebar from "./ClientSidebar";
import DashboardContent from "./DashboardContent";

export default function ClientDashboardPage() {
  return (
    <div className="flex flex-1 h-full bg-gray-50">
      {/* Custom sidebar */}
      <ClientSidebar />
      
      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <DashboardContent />
      </main>
    </div>
  );
}
