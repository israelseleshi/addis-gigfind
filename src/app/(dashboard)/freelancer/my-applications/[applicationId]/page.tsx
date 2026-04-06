"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  MapPin, 
  User,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { markGigInProgress } from '@/lib/actions/applications'
import { markGigComplete } from '@/lib/actions/payments'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface Gig {
  id: string
  title: string
  description: string
  budget: number
  location: string
  category: string
  status: string
  client: {
    id: string
    full_name: string
    avatar_url?: string
    average_rating?: number
    reviews_count?: number
  }
}

interface Application {
  id: string
  gig_id: string
  status: string
  bid_amount?: number
  cover_note?: string
  created_at: string
  updated_at: string
  gig?: Gig
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: Clock },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-700', icon: FileText },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
}

export default function ApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [application, setApplication] = useState<Application | null>(null)
  const [processing, setProcessing] = useState(false)

  const loadApplication = useCallback(async (applicationId: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Please log in to view application details')
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          gig:gigs (
            id, title, description, budget, location, category, status,
            client:profiles!gigs_client_id_fkey(id, full_name, avatar_url, average_rating, reviews_count)
          )
        `)
        .eq('id', applicationId)
        .eq('freelancer_id', user.id)
        .single()

      if (error) {
        console.error('Error loading application:', error)
        toast.error('Failed to load application details')
        router.push('/freelancer/my-applications')
        return
      }

      setApplication(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('An error occurred')
      router.push('/freelancer/my-applications')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (params.applicationId) {
      loadApplication(params.applicationId as string)
    }
  }, [params.applicationId, loadApplication])

  if (loading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/freelancer/my-applications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Link>
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/freelancer/my-applications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Application Not Found</h3>
            <p className="text-gray-500 mb-4">
              The application you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            </p>
            <Button asChild className="bg-amber-500 hover:bg-amber-600">
              <Link href="/freelancer/my-applications">Back to Applications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const config = statusConfig[application.status] || statusConfig.pending
  const Icon = config.icon

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/freelancer/my-applications">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Application Details</h1>
            <p className="text-muted-foreground">View your application information</p>
          </div>
        </div>
        <Badge className={`${config.color} w-fit`}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gig Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">{application.gig?.title || 'Unknown Gig'}</h3>
                <p className="text-gray-600">{application.gig?.description || 'No description available'}</p>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Budget:</span>
                  <span className="text-green-600">
                    {application.gig?.budget ? `ETB ${application.gig.budget.toLocaleString()}` : 'Negotiable'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Location:</span>
                  <span>{application.gig?.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Category:</span>
                  <span>{application.gig?.category || 'Uncategorized'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Applied:</span>
                  <span>{application.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Application */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Bid Amount</h4>
                <p className="text-2xl font-bold text-green-600">
                  {application.bid_amount ? `ETB ${application.bid_amount.toLocaleString()}` : 'Not specified'}
                </p>
              </div>
              
              {application.cover_note && (
                <div>
                  <h4 className="font-medium mb-2">Cover Note</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{application.cover_note}</p>
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500">
                <span className="font-medium">Last Updated:</span> {application.updated_at ? new Date(application.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={application.gig?.client?.avatar_url || ''} />
                  <AvatarFallback>
                    {application.gig?.client?.full_name?.charAt(0)?.toUpperCase() || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{application.gig?.client?.full_name || 'Unknown Client'}</h4>
                  {application.gig?.client?.average_rating && (
                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      <Star className="h-3 w-3 fill-current" />
                      <span>{application.gig.client.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500">
                        ({application.gig.client.reviews_count} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-sm">Application Submitted</p>
                    <p className="text-xs text-gray-500">
                      {application.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                {application.status !== 'pending' && (
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      application.status === 'accepted' ? 'bg-green-500' : 
                      application.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-sm capitalize">{application.status}</p>
                      <p className="text-xs text-gray-500">
                        {application.updated_at ? new Date(application.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
