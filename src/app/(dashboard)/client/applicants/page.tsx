"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { acceptApplication, rejectApplication } from '@/lib/actions/applications'
import { Check, X, Clock, Filter } from 'lucide-react'
import { toast } from 'sonner'

interface Gig {
  id: string;
  title: string;
}

interface Applicant {
  id: string;
  status: string;
  gig_id: string;
  cover_note: string;
  gig: {
    id: string;
    title: string;
    status: string;
  } | null;
  freelancer: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    average_rating: number | null;
    reviews_count: number | null;
  } | null;
}

export default function ApplicantsPage() {
  const [loading, setLoading] = useState(true)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [gigs, setGigs] = useState<Gig[]>([])
  const [selectedGig, setSelectedGig] = useState<string>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: gigsData } = await supabase
          .from('gigs')
          .select('id, title')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })

        setGigs(gigsData || [])

        const { data: appsData, error } = await supabase
          .from('applications')
          .select(`
            *,
            gig:gigs(id, title, status),
            freelancer:profiles!applications_freelancer_id_fkey(id, full_name, avatar_url, average_rating, reviews_count)
          `)
          .in('gig_id', gigsData?.map(g => g.id) || [])
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading applications:', error)
        } else {
          setApplicants(appsData || [])
        }
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (applicationId: string) => {
    try {
      const result = await acceptApplication(applicationId)
      if (result.error) {
        toast.error(String(result.error))
        return
      }

      toast.success('Application accepted!')
      loadData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      const result = await rejectApplication(applicationId)
      if (result.error) {
        toast.error(String(result.error))
        return
      }

      toast.success('Application rejected')
      loadData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const filteredApplicants = selectedGig === 'all' 
    ? applicants 
    : applicants.filter(a => a.gig_id === selectedGig)

  const pendingApps = filteredApplicants.filter(a => a.status === 'pending')
  const reviewedApps = filteredApplicants.filter(a => a.status !== 'pending')

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      withdrawn: 'bg-gray-500',
    }
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="h-6 sm:h-7 md:h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 sm:h-24 md:h-28 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">Applicants</h1>
        
        {/* Gig Filter */}
        <Select value={selectedGig} onValueChange={setSelectedGig}>
          <SelectTrigger className="w-full sm:w-48 md:w-56 lg:w-64">
            <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            <SelectValue placeholder="Filter by gig" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gigs</SelectItem>
            {gigs.map(gig => (
              <SelectItem key={gig.id} value={gig.id}>{gig.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">{filteredApplicants.length}</div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Total Applications</p>
          </CardContent>
        </Card>
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-500">{pendingApps.length}</div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-500">
              {filteredApplicants.filter(a => a.status === 'accepted').length}
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Accepted</p>
          </CardContent>
        </Card>
        <Card className="p-2 sm:p-3 md:p-4">
          <CardContent className="pt-2 sm:pt-3 md:pt-4 p-0">
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-red-500">
              {filteredApplicants.filter(a => a.status === 'rejected').length}
            </div>
            <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="w-full sm:w-auto h-auto flex flex-wrap">
          <TabsTrigger value="pending" className="text-xs sm:text-sm md:text-base">Pending ({pendingApps.length})</TabsTrigger>
          <TabsTrigger value="reviewed" className="text-xs sm:text-sm md:text-base">Reviewed ({reviewedApps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-2 sm:space-y-3 md:space-y-4 mt-3 sm:mt-4 md:mt-6">
          {pendingApps.length === 0 ? (
            <Card>
              <CardContent className="pt-4 sm:pt-6 md:pt-8 text-center">
                <Clock className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mx-auto text-gray-300 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-500">No pending applications</p>
              </CardContent>
            </Card>
          ) : (
            pendingApps.map(app => (
              <Card key={app.id} className="w-full p-3 sm:p-4 md:p-5 lg:p-6">
                <CardContent className="pt-3 sm:pt-4 md:pt-5 p-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                    <div className="flex gap-2.5 sm:gap-3 md:gap-4">
                      <Avatar className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14">
                        <AvatarImage src={app.freelancer?.avatar_url || ''} />
                        <AvatarFallback className="bg-amber-100 text-amber-600">
                          {app.freelancer?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-xs sm:text-sm md:text-base lg:text-lg truncate">
                          {app.freelancer?.full_name || 'Unknown'}
                        </h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 truncate">
                          {app.gig?.title}
                        </p>
                        {app.freelancer?.average_rating && (
                          <p className="text-[10px] sm:text-xs md:text-sm text-amber-500">
                            ★ {app.freelancer.average_rating.toFixed(1)} ({app.freelancer.reviews_count} reviews)
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-between sm:flex-col sm:items-end items-center gap-2">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                  
                  {app.cover_note && (
                    <div className="mt-2.5 sm:mt-3 md:mt-4 p-2.5 sm:p-3 md:p-4 bg-gray-50 rounded-lg">
                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-600">{app.cover_note}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 md:gap-3 mt-3 sm:mt-4 md:mt-5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleReject(app.id)}
                      className="text-red-500 hover:text-red-600 flex-1 sm:flex-none text-[10px] sm:text-xs md:text-sm"
                    >
                      <X className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-2" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-500 hover:bg-green-600 flex-1 sm:flex-none text-[10px] sm:text-xs md:text-sm"
                      onClick={() => handleAccept(app.id)}
                    >
                      <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 mr-1 sm:mr-2" />
                      Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-2 sm:space-y-3 md:space-y-4 mt-3 sm:mt-4 md:mt-6">
          {reviewedApps.length === 0 ? (
            <Card>
              <CardContent className="pt-4 sm:pt-6 md:pt-8 text-center">
                <p className="text-sm sm:text-base text-gray-500">No reviewed applications yet</p>
              </CardContent>
            </Card>
          ) : (
            reviewedApps.map(app => (
              <Card key={app.id} className="p-3 sm:p-4 md:p-5 lg:p-6">
                <CardContent className="pt-3 sm:pt-4 md:pt-5 p-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 md:gap-4">
                    <div className="flex gap-2.5 sm:gap-3 md:gap-4">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12">
                        <AvatarImage src={app.freelancer?.avatar_url || ''} />
                        <AvatarFallback className="bg-amber-100 text-amber-600">
                          {app.freelancer?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium text-xs sm:text-sm md:text-base lg:text-lg">{app.freelancer?.full_name || 'Unknown'}</h3>
                        <p className="text-[10px] sm:text-xs md:text-sm text-gray-500">{app.gig?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
