
"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Upload, FileText, Shield, CreditCard, Clock, XCircle } from "lucide-react"
import { uploadVerificationDocument, getVerificationStatus } from "@/lib/actions/verification"
import { toast } from "sonner"

interface VerificationData {
  id?: string;
  document_type?: string;
  id_number?: string;
  front_image_url?: string;
  back_image_url?: string;
  description?: string;
  status?: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  admin_notes?: string;
}

export default function KycPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [verificationStatus, setVerificationStatus] = React.useState<string | null>(null)
  const [verificationData, setVerificationData] = React.useState<VerificationData | null>(null)
  const [idType, setIdType] = React.useState<"kebele" | "passport" | "driver_license">("kebele")
  const [formData, setFormData] = React.useState({
    idNumber: "",
    idPhoto: null as File | null,
    description: "",
  })
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)

  // Load current verification status on component mount
  React.useEffect(() => {
    const loadVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const result = await getVerificationStatus(user.id)
        
        if (result.status && result.status !== 'unverified') {
          setVerificationStatus(result.status)
          setVerificationData(result.document)
        }
      } catch (error) {
        console.error('Error loading verification status:', error)
      }
    }

    loadVerificationStatus()
  }, [supabase])

  const idTypeOptions = [
    { value: "kebele", label: "Kebele ID", icon: CreditCard },
    { value: "passport", label: "Passport", icon: FileText },
    { value: "driver_license", label: "Driver's License", icon: CreditCard },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB")
        e.target.value = '' // Clear the input
        setImagePreview(null) // Clear preview
        return
      }
      
      // Check file type (images only)
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file")
        e.target.value = '' // Clear the input
        setImagePreview(null) // Clear preview
        return
      }
      
      setFormData({ ...formData, idPhoto: file })
      
      // Create image preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // If already verified, show success state
  if (verificationStatus === 'verified') {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">Account Verified!</h2>
              <p className="text-muted-foreground">
                Your identity has been verified. You can now apply for jobs and access all freelancer features.
              </p>
              <div className="space-y-2">
                {verificationData?.document_type && (
                  <p className="text-sm text-gray-600">
                    <strong>ID Type:</strong> {verificationData.document_type.replace('_', ' ').toUpperCase()}
                  </p>
                )}
                {verificationData?.id_number && (
                  <p className="text-sm text-gray-600">
                    <strong>ID Number:</strong> {verificationData.id_number}
                  </p>
                )}
                {verificationData?.approved_at && (
                  <p className="text-sm text-gray-600">
                    <strong>Verified on:</strong> {new Date(verificationData.approved_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {/* Display submitted images */}
              {verificationData?.front_image_url && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Submitted Documents:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Front Image</p>
                      <Image
                        src={verificationData.front_image_url}
                        alt="Submitted ID Front"
                        width={800}
                        height={320}
                        unoptimized
                        className="h-40 w-full cursor-pointer rounded border object-cover"
                        onClick={() => window.open(verificationData.front_image_url, "_blank")}
                      />
                    </div>
                    {verificationData.back_image_url && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Back Image</p>
                        <Image
                          src={verificationData.back_image_url}
                          alt="Submitted ID Back"
                          width={800}
                          height={320}
                          unoptimized
                          className="h-40 w-full cursor-pointer rounded border object-cover"
                          onClick={() => window.open(verificationData.back_image_url, "_blank")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={() => router.push("/freelancer/find-work")}
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
              >
                Find Work Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If rejected, show rejection state
  if (verificationStatus === 'rejected') {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-red-600">Verification Rejected</h2>
              <p className="text-muted-foreground">
                Your verification was rejected. Please review the feedback and try again.
              </p>
              {verificationData?.admin_notes && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700">
                    <strong>Reason:</strong> {verificationData.admin_notes}
                  </p>
                </div>
              )}
              
              {/* Display submitted images */}
              {verificationData?.front_image_url && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Submitted Documents:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Front Image</p>
                      <Image
                        src={verificationData.front_image_url}
                        alt="Submitted ID Front"
                        width={800}
                        height={320}
                        unoptimized
                        className="h-40 w-full cursor-pointer rounded border object-cover"
                        onClick={() => window.open(verificationData.front_image_url, "_blank")}
                      />
                    </div>
                    {verificationData.back_image_url && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Back Image</p>
                        <Image
                          src={verificationData.back_image_url}
                          alt="Submitted ID Back"
                          width={800}
                          height={320}
                          unoptimized
                          className="h-40 w-full cursor-pointer rounded border object-cover"
                          onClick={() => window.open(verificationData.back_image_url, "_blank")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={() => {
                  setVerificationStatus(null)
                  setVerificationData(null)
                  setIsSubmitted(false)
                }}
                className="w-full mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // If pending, show pending state
  if (verificationStatus === 'pending') {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-amber-600">Verification Pending</h2>
              <p className="text-muted-foreground">
                Your verification is under review. This usually takes 1-2 business days.
              </p>
              <div className="space-y-2">
                {verificationData?.document_type && (
                  <p className="text-sm text-gray-600">
                    <strong>ID Type:</strong> {verificationData.document_type.replace('_', ' ').toUpperCase()}
                  </p>
                )}
                {verificationData?.id_number && (
                  <p className="text-sm text-gray-600">
                    <strong>ID Number:</strong> {verificationData.id_number}
                  </p>
                )}
                {verificationData?.submitted_at && (
                  <p className="text-sm text-gray-600">
                    <strong>Submitted on:</strong> {new Date(verificationData.submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {/* Display submitted images */}
              {verificationData?.front_image_url && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Submitted Documents:</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Front Image</p>
                      <Image
                        src={verificationData.front_image_url}
                        alt="Submitted ID Front"
                        width={800}
                        height={320}
                        unoptimized
                        className="h-40 w-full cursor-pointer rounded border object-cover"
                        onClick={() => window.open(verificationData.front_image_url, "_blank")}
                      />
                    </div>
                    {verificationData.back_image_url && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Back Image</p>
                        <Image
                          src={verificationData.back_image_url}
                          alt="Submitted ID Back"
                          width={800}
                          height={320}
                          unoptimized
                          className="h-40 w-full cursor-pointer rounded border object-cover"
                          onClick={() => window.open(verificationData.back_image_url, "_blank")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={() => router.push("/freelancer/dashboard")}
                className="w-full mt-4"
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please log in first")
        router.push("/login")
        return
      }

      const result = await uploadVerificationDocument({
        documentType: idType,
        idNumber: formData.idNumber,
        frontImage: formData.idPhoto!,
        description: formData.description,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Verification submitted successfully!")
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error("KYC submission error:", error)
      toast.error("Failed to submit verification. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">Verification Submitted!</h2>
              <p className="text-muted-foreground">
                Your verification documents have been submitted for review. You will be notified once your account is verified.
              </p>
              <Button
                onClick={() => router.push("/freelancer/dashboard")}
                className="w-full mt-4"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Identity Verification</CardTitle>
          <CardDescription>
            Complete your verification to access all freelancer features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>ID Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {idTypeOptions.map((option) => {
                  const Icon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setIdType(option.value as typeof idType)}
                      className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                        idType === option.value
                          ? "border-orange-500 bg-orange-50 text-orange-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">{idTypeOptions.find(o => o.value === idType)?.label} Number</Label>
              <Input
                id="idNumber"
                placeholder={`Enter your ${idTypeOptions.find(o => o.value === idType)?.label.toLowerCase()} number`}
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idPhoto">ID Photo (Front)</Label>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  id="idPhoto"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="idPhoto" className="cursor-pointer">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="ID preview"
                      width={800}
                      height={256}
                      unoptimized
                      className="mx-auto mb-2 h-32 w-full rounded object-cover"
                    />
                  ) : (
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  )}
                  <p className="text-sm text-gray-500">
                    {formData.idPhoto ? formData.idPhoto.name : "Click to upload your ID photo"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Information</Label>
              <Textarea
                id="description"
                placeholder="Any additional information about your verification..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Why do we need this?</p>
                  <p>We verify freelancer identities to ensure safety and trust on our platform. Your information is encrypted and stored securely.</p>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
