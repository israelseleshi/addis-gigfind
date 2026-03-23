'use server'

import { createClient } from '@/lib/supabase/server'
import { onboardingSchema } from '@/lib/validations/onboarding'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type Profile = {
  phone_number?: string
  location_sub_city?: string
  bio?: string
  avatar_url?: string
  updated_at?: string
}

export async function completeOnboarding(values: z.infer<typeof onboardingSchema>) {
  const supabase = await createClient()
  
  const validated = onboardingSchema.safeParse(values)
  if (!validated.success) {
    return { error: 'Invalid form data.' }
  }
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  
  // Check for phone number uniqueness (excluding the current user)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone_number', validated.data.phone)
    .neq('id', user.id)
    .single()
  
  if (existingProfile) {
    return { error: 'Phone number is already in use.' }
  }
  
  const { error } = await supabase
    .from('profiles')
    .update({
      phone_number: validated.data.phone,
      location_sub_city: validated.data.location,
      bio: validated.data.bio,
      avatar_url: validated.data.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/', 'layout')
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profile?.role === 'client') {
    redirect('/client/dashboard')
  } else {
    redirect('/freelancer/dashboard')
  }
}

export async function updateProfile(values: Partial<Profile>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')
  
  const { error } = await supabase
    .from('profiles')
    .update({
      ...values,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
  
  if (error) {
    return { error: error.message }
  }
  
  revalidatePath('/profile')
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided.' }
  }

  // Check file size (5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File size must be less than 5MB.' }
  }

  // Check file type (images only)
  if (!file.type.startsWith('image/')) {
    return { error: 'Please upload an image file.' }
  }

  const fileName = `${user.id}/${Date.now()}-${file.name}`
  
  const { error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file)
  
  if (error) {
    return { error: error.message }
  }
  
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)
  
  return { url: data.publicUrl }
}
