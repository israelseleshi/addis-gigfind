"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700', icon: FileText },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
}

interface Gig {
  id: string
  title: string
  description: string
  budget: number
  location: string
  category: string
  status: string
  client?: {
    full_name: string
    avatar_url?: string
    average_rating?: number
  }
}

interface Application {
  id: string
  gig_id: string
  status: string
  bid_amount?: number
  cover_note?: string
  created_at: string
  gig?: Gig
}

export default function MyApplicationsPage() {
  const [loading, setLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            gig:gigs (
              id, title, description, budget, location, category, status,
              client:profiles!gigs_client_id_fkey(id, full_name, avatar_url, average_rating)
            )
          `)
          .eq('freelancer_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading applications:', error)
        } else {
          setApplications(data || [])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">My Applications</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track and manage your job applications</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-[400px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-3 sm:space-y-4">
            {applications.length > 0 ? applications.map((app: Application) => {
              const config = statusConfig[app.status] || statusConfig.pending
              const Icon = config.icon
              return (
                <Card key={app.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg">{app.gig?.title || 'Unknown Gig'}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {app.gig?.client?.full_name || 'Unknown Client'} · {app.gig?.category || 'Uncategorized'}
                        </CardDescription>
                      </div>
                      <Badge className={`${config.color} w-fit`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="font-medium text-green-600">
                          {app.gig?.budget ? `ETB ${app.gig.budget.toLocaleString()}` : 'Negotiable'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                          <Link href={`/freelancer/my-applications/${app.id}`}>
                            View Details
                          </Link>
                        </Button>
                        {app.status === 'accepted' && (
                          <Button size="sm" className="bg-amber-500 hover:bg-amber-600 flex-1 sm:flex-none">
                            Start Work
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Applications Yet</h3>
                  <p className="text-gray-500 mb-4">
                    You haven&apos;t applied to any gigs yet. Start browsing!
                  </p>
                  <Button asChild className="bg-amber-500 hover:bg-amber-600">
                    <Link href="/freelancer/find-work">Browse Gigs</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="space-y-3 sm:space-y-4">
            {applications.filter(app => app.status === 'pending' || app.status === 'in_review').length > 0 ? applications.filter(app => app.status === 'pending' || app.status === 'in_review').map((app: Application) => {
              const config = statusConfig[app.status] || statusConfig.pending
              const Icon = config.icon
              return (
                <Card key={app.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg">{app.gig?.title || 'Unknown Gig'}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {app.gig?.client?.full_name || 'Unknown Client'} · {app.gig?.category || 'Uncategorized'}
                        </CardDescription>
                      </div>
                      <Badge className={`${config.color} w-fit`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="font-medium text-green-600">
                          {app.gig?.budget ? `ETB ${app.gig.budget.toLocaleString()}` : 'Negotiable'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                        <Link href={`/freelancer/my-applications/${app.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            }) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Applications</h3>
                  <p className="text-gray-500">You don&apos;t have any pending applications.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="accepted" className="mt-4">
          <div className="space-y-3 sm:space-y-4">
            {applications.filter(app => app.status === 'accepted').length > 0 ? applications.filter(app => app.status === 'accepted').map((app: Application) => {
              const config = statusConfig.accepted
              const Icon = config.icon
              return (
                <Card key={app.id} className="overflow-hidden border-green-200 bg-green-50/50">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg">{app.gig?.title || 'Unknown Gig'}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {app.gig?.client?.full_name || 'Unknown Client'} · {app.gig?.category || 'Uncategorized'}
                        </CardDescription>
                      </div>
                      <Badge className={`${config.color} w-fit`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="font-medium text-green-600">
                          {app.gig?.budget ? `ETB ${app.gig.budget.toLocaleString()}` : 'Negotiable'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                          <Link href={`/freelancer/my-applications/${app.id}`}>
                            View Details
                          </Link>
                        </Button>
                        <Button size="sm" className="bg-amber-500 hover:bg-amber-600 flex-1 sm:flex-none">
                          Start Work
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Accepted Applications</h3>
                  <p className="text-gray-500">You don&apos;t have any accepted applications yet.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <div className="space-y-3 sm:space-y-4">
            {applications.filter(app => app.status === 'rejected').length > 0 ? applications.filter(app => app.status === 'rejected').map((app: Application) => {
              const config = statusConfig.rejected
              const Icon = config.icon
              return (
                <Card key={app.id} className="overflow-hidden opacity-75">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg">{app.gig?.title || 'Unknown Gig'}</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          {app.gig?.client?.full_name || 'Unknown Client'} · {app.gig?.category || 'Uncategorized'}
                        </CardDescription>
                      </div>
                      <Badge className={`${config.color} w-fit`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          Applied: {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="font-medium text-green-600">
                          {app.gig?.budget ? `ETB ${app.gig.budget.toLocaleString()}` : 'Negotiable'}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                        <Link href={`/freelancer/my-applications/${app.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            }) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Rejected Applications</h3>
                  <p className="text-gray-500">You don&apos;t have any rejected applications.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
