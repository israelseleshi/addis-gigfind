"use client";

import { useDashboardStore } from "./dashboard-store";
import Overview from "./Overview";
import { MyGigs } from "./MyGigs";
import { HiredJobs } from "./HiredJobs";
import { Messages } from "./Messages";
import { ProfileSettings } from "./ProfileSettings";

export default function DashboardContent() {
  const activeTab = useDashboardStore((s) => s.activeTab);

  return (
    <div className="h-full p-6">
      {activeTab === "overview" && <Overview />}
      {activeTab === "gigs" && <MyGigs />}
      {activeTab === "hired" && <HiredJobs />}
      {activeTab === "messages" && <Messages />}
      {activeTab === "profile" && <ProfileSettings />}
    </div>
  );
}
