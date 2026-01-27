"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, ArrowLeft, Tag, DollarSign, FileText, Send } from "lucide-react"
import Link from "next/link"

const gigFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  budget: z.string().min(1, { message: "Please enter a valid budget." }),
  location: z.string().min(1, { message: "Please select a location." }),
  status: z.string().min(1, { message: "Please select a status." }),
})

type GigFormValues = z.infer<typeof gigFormSchema>

const CATEGORIES = [
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "writing", label: "Writing" },
  { value: "marketing", label: "Marketing" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "carpentry", label: "Carpentry" },
  { value: "cleaning", label: "Cleaning" },
  { value: "tutoring", label: "Tutoring" },
]

const LOCATIONS = [
  { value: "bole", label: "Bole" },
  { value: "kazanchis", label: "Kazanchis" },
  { value: "piassa", label: "Piassa" },
  { value: "addis_ketema", label: "Addis Ketema" },
  { value: "gulele", label: "Gulele" },
  { value: "yeka", label: "Yeka" },
  { value: "arada", label: "Arada" },
  { value: "nifas_silk", label: "Nifas Silk" },
]

const STATUSES = [
  { value: "open", label: "Open" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export default function EditGigPage() {
  const router = useRouter()
  const params = useParams()
  const gigId = params.id as string
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      budget: "",
      location: "",
      status: "",
    },
  })

  useEffect(() => {
    const fetchGig = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          toast.error("Please sign in to edit a gig")
          router.push("/login")
          return
        }

        // Fetch gig data
        const { data: gig, error } = await supabase
          .from('gigs')
          .select('*')
          .eq('id', gigId)
          .single()

        if (error || !gig) {
          toast.error("Gig not found")
          router.push("/client/my-gigs")
          return
        }

        // Check if user owns this gig
        if (gig.client_id !== user.id) {
          toast.error("You don't have permission to edit this gig")
          router.push("/client/my-gigs")
          return
        }

        // Set form values
        form.reset({
          title: gig.title,
          category: gig.category,
          description: gig.description,
          budget: gig.budget.toString(),
          location: gig.location,
          status: gig.status,
        })
      } catch (error) {
        console.error("Error fetching gig:", error)
        toast.error("Failed to load gig")
        router.push("/client/my-gigs")
      } finally {
        setFetchLoading(false)
      }
    }

    fetchGig()
  }, [gigId, router, form])

  async function onSubmit(data: GigFormValues) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please sign in to update a gig")
        return
      }

      const { error } = await supabase
        .from('gigs')
        .update({
          title: data.title,
          category: data.category,
          description: data.description,
          budget: parseInt(data.budget),
          location: data.location,
          status: data.status,
        })
        .eq('id', gigId)
        .eq('client_id', user.id) // Ensure user can only update their own gigs

      if (error) {
        toast.error(error.message || "Failed to update gig")
        return
      }

      toast.success("Gig updated successfully!")
      router.push("/client/my-gigs")
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
        {/* Header with Back Button */}
        <div className="bg-amber-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Edit Gig</h2>
              <p className="text-sm opacity-80 mt-1">Update your gig details</p>
            </div>
            <Button asChild variant="ghost" className="text-white hover:bg-amber-700 transition-colors">
              <Link href="/client/my-gigs" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Gigs</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Gig Title</FormLabel>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        placeholder="e.g., Professional House Painting"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Category, Location, and Status Row */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Location</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LOCATIONS.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>

            {/* Budget */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Budget (ETB)</FormLabel>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5000"
                        className="pl-10 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <FormControl>
                      <Textarea
                        placeholder="Describe the work to be done in detail..."
                        className="pl-10 min-h-[120px] bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 resize-none"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 text-sm" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Update Gig
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
