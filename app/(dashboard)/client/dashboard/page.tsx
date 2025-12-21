import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, FileText, PlusCircle } from 'lucide-react';

// Mock Data
const clientStats = {
  activeGigs: 3,
  pendingApplications: 12,
  jobsInProgress: 2,
};

const notifications = [
  { id: 1, text: 'New applicant for Plumbing Job' },
  { id: 2, text: 'Message from Electrician (Bole)' },
];

export default function ClientDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Active Gigs" value={clientStats.activeGigs} icon={Briefcase} />
        <StatCard title="Pending Applications" value={clientStats.pendingApplications} icon={Users} />
        <StatCard title="Jobs In-Progress" value={clientStats.jobsInProgress} icon={FileText} />
      </div>

      {/* Notifications & Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {notifications.map(notification => (
                <li key={notification.id} className="text-sm text-gray-700">• {notification.text}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full cursor-pointer">
              <PlusCircle className="w-4 h-4 mr-2" />
              Post a New Gig
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: number; icon: React.ElementType }) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-gray-500">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center">
        <Icon className="w-6 h-6 mr-4 text-blue-500" />
        <span className="text-3xl font-bold">{value}</span>
      </CardContent>
    </Card>
  );
}
