"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const gigFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  description: z.string().min(20, { message: "Description must be at least 20 characters." }),
  budget: z.number().min(1, { message: "Please enter a valid budget." }),
  location: z.string().min(1, { message: "Please select a location." }),
});

type GigFormValues = z.infer<typeof gigFormSchema>

export default function PostGigPage() {
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      budget: 0,
      location: "",
    },
  })

  function onSubmit(data: GigFormValues) {
    console.log(data)
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Post a New Gig</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h3 className="text-lg font-medium">Basic Info</h3>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gig Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Professional House Painting" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="development">Development</SelectItem>
                            <SelectItem value="writing">Writing</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the work to be done in detail..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Pricing & Location</h3>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget (in Birr)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="e.g., 5000" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.valueAsNumber)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bole">Bole</SelectItem>
                            <SelectItem value="kazanchis">Kazanchis</SelectItem>
                            <SelectItem value="piassa">Piassa</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button type="submit">Post Gig</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
