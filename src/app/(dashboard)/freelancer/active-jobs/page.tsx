"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Briefcase, MapPin, Clock, MessageSquare } from 'lucide-react'

export default function ActiveJobsPage() {
  const [loading, setLoading] = useState(true)
  const [activeJobs, setActiveJobs] = useState<any[]>([])

  useEffect(() => {
    loadActiveJobs()
  }, [])

  const loadActiveJobs = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // First get the applications
        const { data: applications, error: appError } = await supabase
          .from('applications')
          .select('*, gig_id')
          .eq('freelancer_id', user.id)
          .eq('status', 'accepted')

        if (appError) {
          console.error('Error loading applications:', appError)
          return
        }

        if (!applications || applications.length === 0) {
          setActiveJobs([])
          setLoading(false)
          return
        }

        // Get gig IDs
        const gigIds = applications.map(app => app.gig_id)

        // Then get the gigs
        const { data: gigs, error: gigError } = await supabase
          .from('gigs')
          .select('*')
          .in('id', gigIds)
          .in('status', ['assigned', 'in_progress'])

        if (gigError) {
          console.error('Error loading gigs:', gigError)
          setActiveJobs([])
        } else {
          // Get client IDs
          const clientIds = gigs?.map(gig => gig.client_id) || []
          
          // Get client profiles
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, average_rating')
            .in('id', clientIds)

          if (profileError) {
            console.error('Error loading profiles:', profileError)
          }

          // Combine the data
          const combinedJobs = applications.map(app => ({
            ...app,
            gig: gigs?.find(g => g.id === app.gig_id),
            gig_client: profiles?.find(p => p.id === gigs?.find(g => g.id === app.gig_id)?.client_id)
          }))

          setActiveJobs(combinedJobs)
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      assigned: 'bg-blue-500',
      in_progress: 'bg-amber-500',
    }
    return <Badge className={colors[status] || 'bg-gray-500'}>{status.replace('_', ' ')}</Badge>
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Active Jobs</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl sm:text-3xl font-bold">{activeJobs.length}</div>
            <p className="text-xs sm:text-sm text-gray-500">Active Jobs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl sm:text-3xl font-bold text-blue-500">
              {activeJobs.filter(j => j.gig?.status === 'assigned').length}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl sm:text-3xl font-bold text-amber-500">
              {activeJobs.filter(j => j.gig?.status === 'in_progress').length}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {activeJobs.reduce((sum, j) => sum + (j.gig?.budget || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs sm:text-sm text-gray-500">Total Value (ETB)</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs Grid */}
      {activeJobs.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Active Jobs</h3>
            <p className="text-gray-500 mb-4">
              You don't have any active jobs yet. Start applying to gigs!
            </p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600">
              <Link href="/freelancer/find-work">Browse Gigs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeJobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg">{job.gig?.title}</CardTitle>
                  {getStatusBadge(job.gig?.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500 line-clamp-2">{job.gig?.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">
                      {job.gig?.budget?.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin className="h-4 w-4" />
                    {job.gig?.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Briefcase className="h-4 w-4" />
                    {job.gig?.category}
                  </div>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={job.gig?.client?.avatar_url} />
                    <AvatarFallback>
                      {job.gig?.client?.full_name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{job.gig?.client?.full_name}</p>
                    {job.gig?.client?.average_rating && (
                      <p className="text-xs text-amber-500">
                        ★ {job.gig.client.average_rating.toFixed(1)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/freelancer/jobs/${job.gig?.id}`}>View Details</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/freelancer/messages?recipient=${job.gig?.client_id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Link>
                  </Button>
                </div>

                {job.gig?.status === 'assigned' && (
                  <Button 
                    size="sm" 
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={async () => {
                      const supabase = createClient()
                      await supabase
                        .from('gigs')
                        .update({ status: 'in_progress' })
                        .eq('id', job.gig?.id)
                      loadActiveJobs()
                    }}
                  >
                    Mark as In Progress
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
