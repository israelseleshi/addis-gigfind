"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Tag, DollarSign, FileText, Send } from "lucide-react"

const gigFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  budget: z.string().min(1, { message: "Please enter a valid budget." }),
  location: z.string().min(1, { message: "Please select a location." }),
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

export default function PostGigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      budget: "",
      location: "",
    },
  })

  async function onSubmit(data: GigFormValues) {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error("Please sign in to post a gig")
        router.push("/login")
        return
      }

      const { error } = await supabase
        .from("gigs")
        .insert({
          title: data.title,
          category: data.category,
          description: data.description,
          budget: data.budget,
          location: data.location,
          client_id: user.id,
          status: "open",
        })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Gig posted successfully!")
      router.push("/client/my-gigs")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="bg-amber-600 p-4 text-white">
          <h2 className="text-xl font-semibold">Post a New Gig</h2>
          <p className="text-sm opacity-80 mt-1">Fill in the details below</p>
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

            {/* Category and Location Row */}
            <div className="grid grid-cols-2 gap-4">
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
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Post Gig
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
