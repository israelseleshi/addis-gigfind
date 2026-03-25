'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Star, MapPin, DollarSign, CheckCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface HiredFreelancer {
  id: string
  full_name: string
  avatar_url: string | null
  average_rating: number | null
  reviews_count: number | null
  freelancer_profile?: {
    skills: string[] | null
    hourly_rate: number | null
    experience_level: string | null
  }
}

interface GigDetails {
  id: string
  title: string
  description: string
  category: string
  budget: number
  location: string
  status: string
  client_id: string
  hired_freelancer?: HiredFreelancer | null
}

export default function CompletePage() {
  const params = useParams()
  const router = useRouter()
  const gigId = params.gigId as string
  const [gig, setGig] = useState<GigDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          toast.error("Please sign in")
          router.push("/login")
          return
        }

        const { data: gigData, error: gigError } = await supabase
          .from('gigs')
          .select(`
            *,
            applications (
              status,
              freelancer:profiles!applications_freelancer_id_fkey (
                id,
                full_name,
                avatar_url,
                average_rating,
                reviews_count,
                freelancer_profiles (
                  skills,
                  hourly_rate,
                  experience_level
                )
              )
            )
          `)
          .eq('id', gigId)
          .eq('client_id', user.id)
          .single()

        if (gigError || !gigData) {
          toast.error("Gig not found or you don't have permission")
          router.push("/client/my-jobs")
          return
        }

        const hiredApplication = gigData.applications?.find(
          (app: { status: string }) => app.status === 'accepted'
        )

        const gigWithFreelancer: GigDetails = {
          ...gigData,
          hired_freelancer: hiredApplication?.freelancer || null
        }

        setGig(gigWithFreelancer)

        if (gigData.status === 'completed') {
          toast.info("This gig has already been marked as completed")
        }
      } catch (error) {
        console.error("Error fetching gig:", error)
        toast.error("Failed to load gig details")
      } finally {
        setLoading(false)
      }
    }

    fetchGig()
  }, [gigId, router])

  const handleComplete = async () => {
    if (!gig || !gig.hired_freelancer) {
      toast.error("No freelancer hired for this gig")
      return
    }

    if (rating === 0) {
      toast.error("Please provide a rating")
      return
    }

    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please sign in")
        return
      }

      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('gig_id', gigId)
        .eq('reviewer_id', user.id)
        .single()

      if (existingReview) {
        const { error: updateError } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment.trim() || null,
          })
          .eq('gig_id', gigId)
          .eq('reviewer_id', user.id)

        if (updateError) throw updateError
      } else {
        const { error: reviewError } = await supabase
          .from('reviews')
          .insert({
            gig_id: gigId,
            reviewer_id: user.id,
            reviewee_id: gig.hired_freelancer!.id,
            rating,
            comment: comment.trim() || null,
          })

        if (reviewError) throw reviewError
      }

      const { error: gigError } = await supabase
        .from('gigs')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', gigId)

      if (gigError) throw gigError

      const { data: freelancerReviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', gig.hired_freelancer!.id)

      if (freelancerReviews && freelancerReviews.length > 0) {
        const totalRating = freelancerReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
        const avgRating = totalRating / freelancerReviews.length

        await supabase
          .from('profiles')
          .update({ 
            average_rating: Math.round(avgRating * 10) / 10,
            reviews_count: freelancerReviews.length
          })
          .eq('id', gig.hired_freelancer!.id)
      }

      toast.success("Gig marked as completed! Review submitted.")
      router.push("/client/my-jobs")
    } catch (error) {
      console.error("Error completing gig:", error)
      toast.error("Failed to complete gig. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({ interactive = false }: { interactive?: boolean }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          onClick={() => interactive && setRating(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        >
          <Star
            className={`h-6 w-6 ${
              star <= (interactive ? (hoverRating || rating) : rating)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-gray-200 text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Gig not found</p>
        <Button variant="link" asChild className="mt-4">
          <Link href="/client/my-jobs">Back to My Jobs</Link>
        </Button>
      </div>
    )
  }

  if (gig.status === 'completed') {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Gig Already Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This gig has already been marked as completed and reviewed.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">{gig.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{gig.category}</p>
            </div>
            <Button asChild>
              <Link href="/client/my-jobs">Back to My Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!gig.hired_freelancer) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              No Freelancer Hired
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This gig does not have a hired freelancer yet. You need to hire a freelancer first before marking the gig as complete.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold">{gig.title}</h3>
              <Badge className="mt-2">{gig.status}</Badge>
            </div>
            <div className="flex gap-3">
              <Button asChild>
                <Link href={`/client/my-jobs/${gigId}/applicants`}>View Applicants</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/client/my-jobs">Back to My Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href={`/client/my-jobs/${gigId}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Gig Details
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Complete Gig</h1>
          <p className="text-gray-500">Mark this gig as completed and leave a review for the freelancer</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gig Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{gig.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="capitalize">{gig.category}</span>
                <span>•</span>
                <Badge variant="outline" className="capitalize">{gig.status}</Badge>
              </div>
            </div>
            <p className="text-gray-600">{gig.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-2">
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
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold capitalize">{gig.location}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hired Freelancer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={gig.hired_freelancer.avatar_url || ''} />
                <AvatarFallback className="text-lg">
                  {gig.hired_freelancer.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{gig.hired_freelancer.full_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating />
                  {gig.hired_freelancer.average_rating && (
                    <span className="text-sm text-gray-500">
                      {gig.hired_freelancer.average_rating.toFixed(1)} ({gig.hired_freelancer.reviews_count || 0} reviews)
                    </span>
                  )}
                </div>
                {gig.hired_freelancer.freelancer_profile?.skills && 
                 gig.hired_freelancer.freelancer_profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {gig.hired_freelancer.freelancer_profile.skills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {gig.hired_freelancer.freelancer_profile.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{gig.hired_freelancer.freelancer_profile.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Your Rating *</Label>
              <StarRating interactive />
              <p className="text-sm text-gray-500">
                {rating === 0 ? 'Click to rate' :
                 rating === 1 ? 'Poor' :
                 rating === 2 ? 'Fair' :
                 rating === 3 ? 'Good' :
                 rating === 4 ? 'Very Good' : 'Excellent'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with this freelancer. What did they do well? Would you recommend them to others?"
                rows={4}
                className="w-full"
              />
              <p className="text-sm text-gray-500">
                Your review helps other clients make informed decisions
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/client/my-jobs/${gigId}`)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={submitting || rating === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completing...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
