'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import {
  clientSignUpSchema,
  freelancerSignUpSchema,
  loginSchema,
  forgotPasswordSchema,
} from '@/lib/validations/auth'
import { z } from 'zod'

export async function registerClient(values: z.infer<typeof clientSignUpSchema>) {
  try {
    console.log('[registerClient] Starting signup...')
    const supabase = await createClient()

    const validated = clientSignUpSchema.safeParse(values)
    if (!validated.success) {
      console.error('Validation failed:', validated.error.flatten().fieldErrors)
      return { error: 'Invalid form data. Please check your inputs.' }
    }

    const { fullName, email, password } = validated.data

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'client',
        },
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      return { error: error.message }
    }

    console.log('[registerClient] User created:', signUpData.user?.id)

    // Create profile record
    if (signUpData.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          full_name: fullName,
          role: 'client',
          created_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { error: 'Failed to create user profile' }
      }
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding')
  } catch (e) {
    console.error('Caught exception in registerClient:', e)
    // Check if this is a redirect error from Next.js - if so, let it propagate
    if (e instanceof Error && 'digest' in e && String(e.digest).startsWith('NEXT_REDIRECT')) {
      throw e
    }
    const errorMessage = e instanceof Error ? e.message : 'An unknown server error occurred.'
    return { error: errorMessage }
  }
}

export async function registerFreelancer(values: z.infer<typeof freelancerSignUpSchema>) {
  try {
    console.log('[registerFreelancer] Starting signup...')
    const supabase = await createClient()

    const validated = freelancerSignUpSchema.safeParse(values)
    if (!validated.success) {
      console.error('Validation failed:', validated.error.flatten().fieldErrors)
      return { error: 'Invalid form data. Please check your inputs.' }
    }

    const { fullName, email, password } = validated.data

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'freelancer',
        },
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      return { error: error.message }
    }

    console.log('[registerFreelancer] User created:', signUpData.user?.id)

    // Create profile record
    if (signUpData.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: signUpData.user.id,
          full_name: fullName,
          role: 'freelancer',
          created_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return { error: 'Failed to create user profile' }
      }
    }

    revalidatePath('/', 'layout')
    redirect('/onboarding')
  } catch (e) {
    console.error('Caught exception in registerFreelancer:', e)
    // Check if this is a redirect error from Next.js - if so, let it propagate
    if (e instanceof Error && 'digest' in e && String(e.digest).startsWith('NEXT_REDIRECT')) {
      throw e
    }
    const errorMessage = e instanceof Error ? e.message : 'An unknown server error occurred.'
    return { error: errorMessage }
  }
}

export async function loginUser(credentials: z.infer<typeof loginSchema>) {
  const supabase = await createClient()

  const validated = loginSchema.safeParse(credentials)
  if (!validated.success) {
    return { error: 'Invalid credentials' }
  }

  const { email, password } = validated.data

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error)
    return { error: 'Invalid login credentials' }
  }

  console.log('[loginUser] Logged in user:', data.user?.id)

  // Get user role from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user?.id)
    .single()

  if (profileError || !profile) {
    console.error('Profile lookup error:', profileError)
    return { error: 'User profile not found' }
  }

  revalidatePath('/', 'layout')
  const redirectUrl = profile.role === 'client' ? '/client/dashboard' : '/freelancer/dashboard'
  redirect(redirectUrl)
}

export async function logoutUser() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function recoverPassword(values: z.infer<typeof forgotPasswordSchema>) {
  const supabase = await createClient()

  const validated = forgotPasswordSchema.safeParse(values)
  if (!validated.success) {
    return { error: 'Invalid email address' }
  }

  const { email } = validated.data

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: '/update-password',
  })

  if (error) {
    console.error('Password recovery error:', error)
    return { error: 'Could not send password reset email' }
  }

  return { success: true }
}


