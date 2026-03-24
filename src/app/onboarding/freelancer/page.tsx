import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FreelancerOnboardingForm } from '@/components/onboarding/freelancer-onboarding-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function FreelancerOnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_onboarding_complete')
    .eq('id', user.id)
    .single()

  if (profile?.is_onboarding_complete) {
    redirect('/freelancer/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Complete Your Freelancer Profile</CardTitle>
          <CardDescription>
            Tell us about your skills and experience so clients can find you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FreelancerOnboardingForm />
        </CardContent>
      </Card>
    </div>
  )
}
