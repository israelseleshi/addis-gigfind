
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, FileText, CheckCircle, Clock } from 'lucide-react'

export default function FreelancerDashboardPage() {
  const stats = [
    { title: 'Active Applications', value: '4', icon: FileText, color: 'text-blue-500' },
    { title: 'Pending Jobs', value: '2', icon: Clock, color: 'text-amber-500' },
    { title: 'Completed Jobs', value: '7', icon: CheckCircle, color: 'text-green-500' },
    { title: 'Available Gigs', value: '12', icon: Briefcase, color: 'text-purple-500' },
  ]

  const recentApplications = [
    { id: 1, gig: 'Web Developer for E-commerce', status: 'In Review', applied: '2 days ago' },
    { id: 2, gig: 'Logo Design Project', status: 'Accepted', applied: '3 days ago' },
    { id: 3, gig: 'Content Writer for Blog', status: 'Pending', applied: '1 week ago' },
  ]

  const recommendedGigs = [
    { id: 1, title: 'Mobile App Developer', budget: 'ETB 15,000-25,000', posted: '1 day ago' },
    { id: 2, title: 'SEO Specialist', budget: 'ETB 8,000-12,000', posted: '2 days ago' },
    { id: 3, title: 'Video Editor', budget: 'ETB 5,000-10,000', posted: '3 days ago' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
        <Button asChild className="bg-amber-500 hover:bg-amber-600">
          <Link href="/freelancer/find-work">Browse Gigs</Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Your Recent Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{app.gig}</h3>
                    <p className="text-sm text-gray-500">
                      Status: {app.status} • Applied {app.applied}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/freelancer/my-applications`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Gigs */}
        <Card>
          <CardHeader>
            <CardTitle>Recommended Gigs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendedGigs.map((gig) => (
                <div key={gig.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{gig.title}</h3>
                    <p className="text-sm text-gray-500">
                      Budget: {gig.budget} • Posted {gig.posted}
                    </p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={`/freelancer/find-work/${gig.id}/apply`}>Apply</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
