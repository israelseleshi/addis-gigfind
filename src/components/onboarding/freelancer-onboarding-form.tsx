'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
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

const experienceLevels = [
  'Beginner (0-1 years)',
  'Intermediate (1-3 years)',
  'Advanced (3-5 years)',
  'Expert (5+ years)',
]

const freelancerOnboardingSchema = z.object({
  skills: z.string().min(2, 'Please enter at least one skill'),
  experienceLevel: z.string().min(1, 'Please select your experience level'),
  hourlyRate: z.string().optional(),
  portfolioUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
})

type FreelancerOnboardingValues = z.infer<typeof freelancerOnboardingSchema>

export function FreelancerOnboardingForm() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<FreelancerOnboardingValues>({
    resolver: zodResolver(freelancerOnboardingSchema),
    defaultValues: {
      skills: '',
      experienceLevel: '',
      hourlyRate: undefined,
      portfolioUrl: '',
      bio: '',
    },
  })

  async function onSubmit(values: FreelancerOnboardingValues) {
    setIsPending(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please log in to continue')
        router.push('/login')
        return
      }

      // Parse skills into array
      const skillsArray = values.skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const { error } = await supabase.from('freelancer_profiles').insert({
        id: user.id,
        skills: skillsArray,
        experience_level: values.experienceLevel,
        hourly_rate: values.hourlyRate ? Number(values.hourlyRate) : null,
        portfolio_url: values.portfolioUrl || null,
        bio: values.bio,
      })

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
      router.push('/freelancer/dashboard')
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
          name="skills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Skills</FormLabel>
              <FormControl>
                <Input placeholder="Web Development, UI/UX Design, Mobile Apps" {...field} />
              </FormControl>
              <FormDescription>
                Separate skills with commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="experienceLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Experience Level</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
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
          name="hourlyRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hourly Rate (ETB) - Optional</FormLabel>
              <FormControl>
                <Input placeholder="500" {...field} />
              </FormControl>
              <FormDescription>
                Leave blank if you prefer to negotiate per project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="portfolioUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Portfolio URL - Optional</FormLabel>
              <FormControl>
                <Input placeholder="https://yourportfolio.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Professional Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell clients about yourself, your experience, and what makes you unique..."
                  className="resize-none min-h-32"
                  {...field}
                />
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
