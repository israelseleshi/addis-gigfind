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
import { LocationPicker } from "@/components/gig/location-picker"

const gigFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  budget: z.string().min(1, { message: "Please enter a valid budget." }),
  location: z.string().min(1, { message: "Please select a location." }),
  latitude: z.number(),
  longitude: z.number(),
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
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      budget: "",
      location: "",
      latitude: 0,
      longitude: 0,
    },
  })

  const handleLocationSelect = (locationValue: string, lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    form.setValue("location", locationValue);
    form.setValue("latitude", lat);
    form.setValue("longitude", lng);
  };

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

      // Verify user is a client
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (!profile || profile.role !== 'client') {
        toast.error("Only clients can post gigs")
        return
      }

      const { error } = await supabase
        .from("gigs")
        .insert({
          title: data.title,
          category: data.category,
          description: data.description,
          budget: parseInt(data.budget),
          location: data.location,
          client_id: user.id,
          status: "open",
        })

      if (error) {
        console.error('Gig creation error:', error)
        toast.error(error.message || "Failed to create gig")
        return
      }

      toast.success("Gig posted successfully!")
      router.push("/client/my-gigs")
    } catch (error) {
      console.error('Submit error:', error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-auto sm:h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] flex items-start sm:items-center justify-center py-4 sm:py-0">
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
        {/* Header */}
        <div className="bg-amber-600 p-3 sm:p-4 md:p-6 text-white">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Post a New Gig</h2>
          <p className="text-xs sm:text-sm opacity-80 mt-0.5 sm:mt-1">Fill in the details below</p>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-3 sm:space-y-4 md:space-y-5">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">Gig Title</FormLabel>
                  <div className="relative">
                    <Tag className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        placeholder="e.g., Professional House Painting"
                        className="pl-9 sm:pl-10 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 h-9 sm:h-10 md:h-11 text-sm"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 text-[10px] sm:text-xs md:text-sm" />
                </FormItem>
              )}
            />

            {/* Category and Location Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 h-9 sm:h-10 md:h-11 text-sm">
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
                    <FormMessage className="text-red-500 text-[10px] sm:text-xs md:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">Location</FormLabel>
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={field.value}
                    />
                    <FormMessage className="text-red-500 text-[10px] sm:text-xs md:text-sm" />
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
                  <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">Budget (ETB)</FormLabel>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 5000"
                        className="pl-9 sm:pl-10 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 h-9 sm:h-10 md:h-11 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 text-[10px] sm:text-xs md:text-sm" />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium text-xs sm:text-sm md:text-base">Description</FormLabel>
                  <div className="relative">
                    <FileText className="absolute left-2.5 sm:left-3 top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <FormControl>
                      <Textarea
                        placeholder="Describe the work to be done in detail..."
                        className="pl-9 sm:pl-10 min-h-[100px] sm:min-h-[120px] bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 resize-none text-sm"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-red-500 text-[10px] sm:text-xs md:text-sm" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 sm:py-2.5 md:py-3 mt-3 sm:mt-4 md:mt-6 text-xs sm:text-sm md:text-base"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
