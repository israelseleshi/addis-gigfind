
"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Check, X, Clock, Star, Phone, Users } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Applicant {
  id: string
  status: string
  cover_note: string
  bid_amount?: number
  created_at: string
  freelancer: {
    id: string
    full_name: string | null
    avatar_url: string | null
    average_rating: number | null
    reviews_count: number | null
    phone_number?: string | null
  } | null
}

interface Gig {
  id: string
  title: string
  budget: number
  status: string
}

export default function GigApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const gigId = params.gigId as string
  const [loading, setLoading] = useState(true)
  const [gig, setGig] = useState<Gig | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])

  const loadData = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Fetch gig details
      const { data: gigData, error: gigError } = await supabase
        .from('gigs')
        .select('id, title, budget, status')
        .eq('id', gigId)
        .eq('client_id', user.id)
        .single()

      if (gigError || !gigData) {
        toast.error('Gig not found')
        router.push('/client/my-gigs')
        return
      }

      setGig(gigData)

      // Fetch applicants
      const { data: appsData, error: appsError } = await supabase
        .from('applications')
        .select(`
          *,
          freelancer:profiles!applications_freelancer_id_fkey (
            id,
            full_name,
            avatar_url,
            average_rating,
            reviews_count,
            phone_number
          )
        `)
        .eq('gig_id', gigId)
        .order('created_at', { ascending: false })

      if (appsError) {
        console.error('Error loading applicants:', appsError)
        toast.error('Failed to load applicants')
      } else {
        setApplicants(appsData || [])
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }, [gigId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAccept = async (applicationId: string) => {
    try {
      const supabase = createClient()
      const application = applicants.find(a => a.id === applicationId)
      if (!application) return

      // Update application status
      const { error } = await supabase
        .from('applications')
        .update({ status: 'accepted' })
        .eq('id', applicationId)

      if (error) {
        toast.error('Failed to accept application')
        return
      }

      // Update gig status
      await supabase
        .from('gigs')
        .update({ status: 'assigned' })
        .eq('id', gigId)

      // Reject other applications
      await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('gig_id', gigId)
        .neq('id', applicationId)

      toast.success('Application accepted!')
      loadData()
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const handleReject = async (applicationId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('applications')
        .update({ status: 'rejected' })
        .eq('id', applicationId)

      if (error) {
        toast.error('Failed to reject application')
      } else {
        toast.success('Application rejected')
        loadData()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500',
      withdrawn: 'bg-gray-500',
    }
    return <Badge className={colors[status] || 'bg-gray-500'}>{status}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const pendingApplicants = applicants.filter(a => a.status === 'pending')
  const reviewedApplicants = applicants.filter(a => a.status !== 'pending')

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Gig not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/client/my-jobs/${gigId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gig Details
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Applicants for {gig.title}</h1>
            <p className="text-gray-500 mt-1">Budget: {gig.budget.toLocaleString()} ETB</p>
          </div>
          <div className="flex gap-2">
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold">{applicants.length}</div>
                <p className="text-sm text-gray-500">Total</p>
              </div>
            </Card>
            <Card className="px-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">{pendingApplicants.length}</div>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Pending Applicants */}
      {pendingApplicants.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Applications ({pendingApplicants.length})
          </h2>
          <div className="space-y-4">
            {pendingApplicants.map(applicant => (
              <Card key={applicant.id} className="border-amber-200">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div className="flex gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={applicant.freelancer?.avatar_url || ''} />
                        <AvatarFallback className="bg-amber-100 text-amber-600 text-lg">
                          {applicant.freelancer?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {applicant.freelancer?.full_name || 'Unknown Freelancer'}
                        </h3>
                        {applicant.freelancer?.average_rating && (
                          <div className="flex items-center gap-1 text-amber-500 my-1">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">
                              {applicant.freelancer.average_rating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                              ({applicant.freelancer.reviews_count} reviews)
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-500">
                          {applicant.freelancer?.phone_number && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {applicant.freelancer.phone_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          {applicant.bid_amount ? applicant.bid_amount.toLocaleString() : '0'} ETB
                        </div>
                        {getStatusBadge(applicant.status)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAccept(applicant.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(applicant.id)}
                          className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Cover Note</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {applicant.cover_note || 'No cover note provided'}
                    </p>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    Applied on {formatDate(applicant.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Reviewed Applicants */}
      {reviewedApplicants.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Reviewed Applications ({reviewedApplicants.length})</h2>
          <div className="space-y-4">
            {reviewedApplicants.map(applicant => (
              <Card key={applicant.id} className="opacity-75">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={applicant.freelancer?.avatar_url || ''} />
                        <AvatarFallback>
                          {applicant.freelancer?.full_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {applicant.freelancer?.full_name || 'Unknown Freelancer'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {applicant.bid_amount ? applicant.bid_amount.toLocaleString() : '0'} ETB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(applicant.status)}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    Applied on {formatDate(applicant.created_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Applicants */}
      {applicants.length === 0 && (
        <Card>
          <CardContent className="pt-12 text-center">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No applicants yet</h3>
            <p className="text-gray-500">Applications will appear here once freelancers start applying to your gig.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
