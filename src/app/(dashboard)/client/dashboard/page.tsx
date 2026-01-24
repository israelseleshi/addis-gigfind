import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Briefcase, Users, Clock, TrendingUp } from 'lucide-react'

export default function ClientDashboardPage() {
  const stats = [
    { title: 'Active Gigs', value: '3', icon: Briefcase, color: 'text-blue-500' },
    { title: 'Total Hires', value: '12', icon: Users, color: 'text-green-500' },
    { title: 'Pending Applications', value: '5', icon: Clock, color: 'text-amber-500' },
    { title: 'Completed Jobs', value: '8', icon: TrendingUp, color: 'text-purple-500' },
  ]

  const recentGigs = [
    { id: 1, title: 'Web Developer needed for E-commerce site', status: 'Active', applicants: 4 },
    { id: 2, title: 'Logo Design for Startup', status: 'Completed', applicants: 0 },
    { id: 3, title: 'Content Writer for Blog', status: 'Draft', applicants: 0 },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Dashboard</h1>
        <Button asChild className="bg-amber-500 hover:bg-amber-600">
          <Link href="/client/gigs/create">Post New Gig</Link>
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

      {/* Recent Gigs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Recent Gigs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGigs.map((gig) => (
              <div key={gig.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{gig.title}</h3>
                  <p className="text-sm text-gray-500">
                    Status: {gig.status} • {gig.applicants} applicants
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/client/my-jobs/${gig.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
