import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientOnboardingForm } from '@/components/onboarding/client-onboarding-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function ClientOnboardingPage() {
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
    redirect('/client/dashboard')
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Complete Your Client Profile</CardTitle>
          <CardDescription>
            Tell us about your company so freelancers can learn more about you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientOnboardingForm />
        </CardContent>
      </Card>
    </div>
  )
}
