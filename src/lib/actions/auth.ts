'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAppUrl } from '@/lib/app-url'
import {
  clientSignUpSchema,
  freelancerSignUpSchema,
  adminSignUpSchema,
  loginSchema,
  forgotPasswordSchema,
} from '@/lib/validations/auth'
import { z } from 'zod'
import { generateOTP, storeOTP, verifyOTP } from '@/lib/otp'

export async function sendOTP(email: string, purpose: 'signup') {
  try {
    const otp = generateOTP()
    const stored = await storeOTP(email, otp, purpose)

    if (!stored) {
      return { error: 'Failed to generate OTP' }
    }

    return { success: true, otp }
  } catch (error) {
    console.error('Error sending OTP:', error)
    return { error: 'Failed to send OTP' }
  }
}

export async function verifyOTPCode(email: string, code: string, purpose: 'signup') {
  try {
    const isValid = await verifyOTP(email, code, purpose)
    
    if (!isValid) {
      return { error: 'Invalid or expired OTP code' }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return { error: 'Failed to verify OTP' }
  }
}

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

    // Sign up WITHOUT email confirmation
    console.log('[registerClient] Step 1: Creating auth user...')
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
      console.error('[registerClient] Auth signUp error:', error.code, error.message)
      return { error: `Auth error: ${error.message}` }
    }

    console.log('[registerClient] Auth user created:', signUpData.user?.id)

    // Sign in immediately to create active session for RLS
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('[registerClient] Sign in after signup error:', signInError)
      return { error: 'Account created but failed to sign in. Please try logging in.' }
    }

    // Now create profile with active session
    if (signUpData.user) {
      console.log('[registerClient] Creating profile...')
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        full_name: fullName,
        role: 'client',
      })

      if (profileError) {
        console.error('[registerClient] Profile creation error:', profileError)
        return { error: `Profile error: ${profileError.message}` }
      }
      console.log('[registerClient] Profile created successfully')
    }

    return { success: true, userId: signUpData.user?.id }
  } catch (e) {
    console.error('Caught exception in registerClient:', e)
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

    // Sign up WITHOUT email confirmation
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

    // Sign in immediately to create active session for RLS
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('[registerFreelancer] Sign in after signup error:', signInError)
      return { error: 'Account created but failed to sign in. Please try logging in.' }
    }

    // Now create profile with active session
    if (signUpData.user) {
      console.log('[registerFreelancer] Creating profile...')
      const { error: profileError } = await supabase.from('profiles').insert({
        id: signUpData.user.id,
        full_name: fullName,
        role: 'freelancer',
      })

      if (profileError) {
        console.error('[registerFreelancer] Profile creation error:', profileError)
        return { error: `Profile error: ${profileError.message}` }
      }
      console.log('[registerFreelancer] Profile created successfully')
    }

    return { success: true, userId: signUpData.user?.id }
  } catch (e) {
    console.error('Caught exception in registerFreelancer:', e)
    const errorMessage = e instanceof Error ? e.message : 'An unknown server error occurred.'
    return { error: errorMessage }
  }
}

export async function registerAdmin(values: z.infer<typeof adminSignUpSchema>) {
  try {
    console.log('[registerAdmin] Starting admin signup...')
    const supabase = await createClient()

    const validated = adminSignUpSchema.safeParse(values)
    if (!validated.success) {
      console.error('Validation failed:', validated.error.flatten().fieldErrors)
      return { error: 'Invalid form data. Please check your inputs.' }
    }

    const { fullName, email, password } = validated.data

    // Sign up admin WITHOUT email confirmation - direct creation
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined, // Disable Supabase email confirmation
        data: {
          full_name: fullName,
          role: 'admin',
        },
      },
    })

    if (error) {
      console.error('Admin sign up error:', error)
      return { error: error.message }
    }

    console.log('[registerAdmin] Admin user created:', signUpData.user?.id)
    // Profile is created automatically by the trigger with admin role

    return { success: true, userId: signUpData.user?.id }
  } catch (e) {
    console.error('Caught exception in registerAdmin:', e)
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

  // Hardcoded admin/regulator demo credentials
  const DEMO_CREDENTIALS: Record<string, { password: string; role: string }> = {
    'admin@addisgigfind.com': { password: 'admin123', role: 'admin' },
    'regulator@addisgigfind.com': { password: 'regulator123', role: 'regulator' },
  }

  // Check if this is a demo admin/regulator login
  const demoUser = DEMO_CREDENTIALS[email]
  if (demoUser && password === demoUser.password) {
    console.log('[loginUser] Demo admin/regulator login:', email)
    revalidatePath('/', 'layout')
    redirect('/admin/dashboard')
  }

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
  // Cast UUID to text for comparison
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user?.id as string)
    .single()

  if (profileError || !profile) {
    console.error('Profile lookup error:', profileError)
    return { error: 'Your account exists but has no profile. Please contact support.' }
  }

  revalidatePath('/', 'layout')
  let redirectUrl = '/freelancer/dashboard'; // Default to freelancer
  if (profile.role === 'client') {
    redirectUrl = '/client/dashboard';
  } else if (profile.role === 'admin' || profile.role === 'regulator') {
    redirectUrl = '/admin/dashboard';
  }
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
    redirectTo: `${getAppUrl()}/update-password`,
  })

  if (error) {
    console.error('Password recovery error:', error)
    return { error: 'Could not send password reset email' }
  }

  return { success: true }
}


