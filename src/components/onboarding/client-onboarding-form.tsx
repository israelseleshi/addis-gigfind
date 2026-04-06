'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'

const industries = [
  'Technology',
  'Finance & Banking',
  'Healthcare',
  'Retail & E-commerce',
  'Manufacturing',
  'Education',
  'Construction',
  'Transportation & Logistics',
  'Hospitality & Tourism',
  'Media & Entertainment',
  'Legal Services',
  'Consulting',
  'Real Estate',
  'Other',
]

const clientOnboardingSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(1, 'Please select an industry'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
})

type ClientOnboardingValues = z.infer<typeof clientOnboardingSchema>

export function ClientOnboardingForm() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<ClientOnboardingValues>({
    resolver: zodResolver(clientOnboardingSchema),
    defaultValues: {
      companyName: '',
      industry: '',
      website: '',
      phoneNumber: '',
    },
  })

  async function onSubmit(values: ClientOnboardingValues) {
    setIsPending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to continue')
        router.push('/login')
        return
      }

      const { error } = await supabase.from('client_profiles').insert({
        id: user.id,
        company_name: values.companyName,
        industry: values.industry,
        website: values.website || null,
      })

      // Also update phone number in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone_number: values.phoneNumber })
        .eq('id', user.id)

      if (profileError) {
        console.error('Phone update error:', profileError)
      }

      if (error) {
        toast.error('Failed to save profile: ' + error.message)
        return
      }

      // Mark onboarding as complete
      await supabase
        .from('profiles')
        .update({ is_onboarding_complete: true })
        .eq('id', user.id)

      toast.success('Profile completed!')
      router.push('/client/dashboard')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Something went wrong')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="industry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://yourcompany.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="+2519XXXXXXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600" disabled={isPending}>
          {isPending ? 'Saving...' : 'Complete Profile'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}
