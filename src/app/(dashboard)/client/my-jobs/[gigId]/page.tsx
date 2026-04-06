"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Edit, Users, MapPin, DollarSign, CreditCard, Navigation } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { initiateChapaPayment } from '@/lib/actions/payments'
import { parsePostGISPoint, reverseGeocode, calculateDistanceKm } from '@/components/gig/location-picker'
import { useGeolocation, calculateDistance, formatDistance } from '@/hooks/use-geolocation'

interface Gig {
  id: string
  title: string
  description: string
  category: string
  budget: number
  location: string
  status: string
  created_at: string
  updated_at: string
  payment_status?: 'pending' | 'paid'
  _displayLocation?: string
  _distanceKm?: number
  _lat?: number
  _lng?: number
  applications?: Array<{
    id: string
    freelancer_id: string
    cover_note: string
    bid_amount: number
    status: string
    created_at: string
    freelancer?: {
      full_name: string
      avatar_url?: string
    }
  }>
}

export default function GigDetailPage() {
  const params = useParams()
  const router = useRouter()
  const gigId = params.gigId as string
  const [gig, setGig] = useState<Gig | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)
  const { position: userPosition, requestLocation: requestUserLocation, loading: locationLoading } = useGeolocation()

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          toast.error("Please sign in to view gig details")
          router.push("/login")
          return
        }

        // Fetch gig with applications
        const { data: gigData, error: gigError } = await supabase
          .from('gigs')
          .select(`
            *,
            applications (
              *,
              freelancer:profiles!applications_freelancer_id_fkey (
                full_name,
                avatar_url
              )
            )
          `)
          .eq('id', gigId)
          .eq('client_id', user.id) // Ensure user owns this gig
          .single()

        if (gigError || !gigData) {
          toast.error("Gig not found or you don't have permission to view it")
          router.push("/client/my-gigs")
          return
        }

        if (gigData.location) {
          console.log('Raw location:', gigData.location);
          console.log('Location type:', typeof gigData.location);
          console.log('Starts with POINT:', gigData.location.startsWith('POINT'));
          console.log('Starts with 010100:', gigData.location.startsWith('010100'));
          const coords = parsePostGISPoint(gigData.location);
          console.log('Parsed coords:', coords);
          if (coords) {
            gigData._displayLocation = reverseGeocode(coords.lat, coords.lng);
            gigData._distanceKm = calculateDistanceKm(coords.lat, coords.lng);
            gigData._lat = coords.lat;
            gigData._lng = coords.lng;
          }
        }

        setGig(gigData)
      } catch (error) {
        console.error("Error fetching gig:", error)
        toast.error("Failed to load gig")
        router.push("/client/my-gigs")
      } finally {
        setLoading(false)
      }
    }

    fetchGig()
  }, [gigId, router])

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      open: 'bg-green-500',
      assigned: 'bg-blue-500',
      in_progress: 'bg-amber-500',
      completed: 'bg-purple-500',
      cancelled: 'bg-red-500',
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/client/my-gigs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Gigs
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gig Details */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{gig.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="capitalize">{gig.category}</span>
                    <span>•</span>
                    <span>{formatDate(gig.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(gig.status)}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/client/gigs/${gig.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{gig.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-semibold">{gig.budget.toLocaleString()} ETB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Distance</p>
                    {gig._lat && gig._lng ? (
                      userPosition ? (
                        <button 
                          onClick={() => {
                            const url = `https://www.openstreetmap.org/?mlat=${gig._lat}&mlon=${gig._lng}#map=15/${gig._lat}/${gig._lng}`;
                            window.open(url, '_blank');
                          }}
                          className="font-semibold text-blue-600 hover:underline text-left"
                        >
                          {formatDistance(calculateDistance(userPosition.latitude, userPosition.longitude, gig._lat, gig._lng))} away
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{gig._distanceKm?.toFixed(1)} km from center</p>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 text-xs text-blue-600"
                            onClick={requestUserLocation}
                            disabled={locationLoading}
                          >
                            {locationLoading ? 'Getting...' : 'Find my distance'}
                          </Button>
                        </div>
                      )
                    ) : (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-xs"
                        asChild
                      >
                        <Link href={`/client/gigs/${gig.id}/edit`}>
                          <Navigation className="h-3 w-3 mr-1" />
                          Set location
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-500">Applications</p>
                    <p className="font-semibold">{gig.applications?.length || 0}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications */}
          {gig.applications && gig.applications.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Applications ({gig.applications.length})</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/client/my-jobs/${gig.id}/applicants`}>
                      View All
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gig.applications.slice(0, 3).map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={application.freelancer?.avatar_url || ''} />
                            <AvatarFallback>
                              {application.freelancer?.full_name?.charAt(0) || 'F'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">
                              {application.freelancer?.full_name || 'Unknown Freelancer'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Applied on {formatDate(application.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {application.bid_amount ? application.bid_amount.toLocaleString() : '0'} ETB
                          </p>
                          <Badge className={application.status === 'pending' ? 'bg-amber-500' : 'bg-green-500'}>
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 ml-13">
                        {application.cover_note}
                      </p>
                    </div>
                  ))}
                  {gig.applications.length > 3 && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/client/my-jobs/${gig.id}/applicants`}>
                        View All {gig.applications.length} Applications
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {gig.status !== 'completed' && (
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/client/gigs/${gig.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Gig
                  </Link>
                </Button>
              )}
              {gig.status === 'open' && gig.applications && gig.applications.length > 0 && (
                <Button className="w-full bg-amber-500 hover:bg-amber-600" asChild>
                  <Link href={`/client/my-jobs/${gig.id}/applicants`}>
                    <Users className="h-4 w-4 mr-2" />
                    View Applicants
                  </Link>
                </Button>
              )}
              {gig.status === 'in_progress' && (
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700" 
                  disabled={processingPayment}
                  onClick={async () => {
                    setProcessingPayment(true)
                    try {
                      const supabase = createClient()
                      const { error: updateError } = await supabase
                        .from('gigs')
                        .update({ status: 'completed' })
                        .eq('id', gig.id)
                        .eq('status', 'in_progress')
                      
                      if (updateError) {
                        toast.error('Failed to mark as completed: ' + updateError.message)
                        setProcessingPayment(false)
                        return
                      }
                       
                      toast.success('Job marked as completed!')
                      
                      const result = await initiateChapaPayment(gig.id)
                      console.log('Payment result:', result)
                      if (result.error) {
                        toast.error(String(result.error))
                      } else if (result.checkout_url) {
                        window.location.href = result.checkout_url
                      } else {
                        toast.error('Failed to initiate payment')
                      }
                    } catch (error) {
                      console.error('Error:', error)
                      toast.error('An error occurred')
                    } finally {
                      setProcessingPayment(false)
                    }
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Mark as Completed & Pay
                </Button>
              )}
              {gig.status === 'completed' && gig.payment_status !== 'paid' && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={processingPayment}
                  onClick={async () => {
                    setProcessingPayment(true)
                    const result = await initiateChapaPayment(gig.id)
                    if (result.error) {
                      toast.error(String(result.error))
                    } else if (result.checkout_url) {
                      window.location.href = result.checkout_url
                    } else {
                      toast.error('Failed to initiate payment')
                    }
                    setProcessingPayment(false)
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Freelancer
                </Button>
              )}
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
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div>
                    <p className="font-medium">Posted</p>
                    <p className="text-sm text-gray-500">{formatDate(gig.created_at)}</p>
                  </div>
                </div>
                {gig.updated_at !== gig.created_at && (
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-medium">Last Updated</p>
                      <p className="text-sm text-gray-500">{formatDate(gig.updated_at)}</p>
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
