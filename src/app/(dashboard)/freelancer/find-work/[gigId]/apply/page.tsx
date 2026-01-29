
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertCircle, ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { applyForGig } from "@/lib/actions/applications"

interface Gig {
  id: string
  title: string
  description: string
  budget: number
  category: string
  location: string
  status: string
  client: {
    full_name: string
  }
}

export default function ApplyPage() {
  const router = useRouter()
  const params = useParams()
  const gigId = params.gigId as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [gig, setGig] = useState<Gig | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }

        // Check verification status
        const { data: profile } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('id', user.id)
          .single()

        if (profile) {
          setVerificationStatus(profile.verification_status)
        }

        // Fetch gig details
        const { data: gigData, error } = await supabase
          .from('gigs')
          .select(`
            *,
            client:profiles!gigs_client_id_fkey(full_name)
          `)
          .eq('id', gigId)
          .single()

        if (error) {
          toast.error("Gig not found")
          router.push("/freelancer/find-work")
          return
        }

        setGig(gigData)
      } catch (error) {
        console.error('Error:', error)
        toast.error("Failed to load gig details")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [gigId, router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!coverLetter.trim()) {
      toast.error("Please write a cover letter")
      return
    }

    setSubmitting(true)
    try {
      const result = await applyForGig({
        gigId,
        coverNote: coverLetter,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success("Application submitted successfully!")
      router.push("/freelancer/my-applications")
    } catch (error) {
      console.error('Error:', error)
      toast.error("Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  // Show verification required message
  if (verificationStatus !== 'verified') {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/freelancer/find-work/${gigId}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Gig
            </Link>
          </Button>

          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-amber-800">Verification Required</h2>
                <p className="text-amber-700">
                  You need to verify your identity before applying for jobs. This helps ensure a safe and trustworthy platform for everyone.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-amber-600">
                    <strong>Status:</strong> {verificationStatus === 'pending' ? 'Verification Pending' : 'Not Verified'}
                  </p>
                  {verificationStatus === 'pending' && (
                    <p className="text-sm text-amber-600">
                      Your verification is under review. This usually takes 1-2 business days.
                    </p>
                  )}
                </div>
                <div className="flex gap-3 justify-center">
                  <Button asChild className="bg-amber-600 hover:bg-amber-700">
                    <Link href="/freelancer/kyc">Complete Verification</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/freelancer/find-work">Browse Other Gigs</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!gig) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Gig Not Found</h1>
          <Button asChild>
            <Link href="/freelancer/find-work">Browse Gigs</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/freelancer/find-work/${gigId}`} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Gig
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Gig Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{gig.title}</CardTitle>
                <CardDescription>
                  Posted by {gig.client?.full_name} • {gig.category} • {gig.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{gig.description}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary" className="text-green-600">
                    Budget: {gig.budget.toLocaleString()} ETB
                  </Badge>
                  <Badge variant="outline">{gig.status}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Application Form */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Submit Your Application</CardTitle>
                <CardDescription>
                  Write a cover letter explaining why you&apos;re the perfect fit for this gig.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Cover Letter *</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Introduce yourself, explain your relevant experience, and why you're interested in this gig..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Be specific about your relevant skills and experience
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Explain why you&apos;re interested in this particular gig
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  <p className="text-sm text-gray-600">
                    Keep your cover letter concise but comprehensive
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-800">Verified Account</h3>
                  <p className="text-sm text-green-700">
                    Your identity is verified and you can apply for jobs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
