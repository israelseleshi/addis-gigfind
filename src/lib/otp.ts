import { createClient } from './supabase/server'

export type OTPurpose = 'signup' | 'reset_password' | 'email_change'

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function sendOTPEmail(email: string, otp: string, purpose: OTPurpose): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Use the correct redirect URL based on the environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const redirectTo = purpose === 'reset_password' 
      ? `${baseUrl}/update-password`
      : `${baseUrl}/auth/callback?type=${purpose}`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      console.error('Error sending OTP email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in sendOTPEmail:', error)
    return false
  }
}

export async function storeOTP(email: string, otp: string, purpose: OTPurpose): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('otp_verifications')
      .insert({
        email,
        otp_code: otp,
        purpose,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      })

    if (error) {
      console.error('Error storing OTP:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in storeOTP:', error)
    return false
  }
}

export async function verifyOTP(email: string, otp: string, purpose: OTPurpose): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('purpose', purpose)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return false
    }

    const { error: updateError } = await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', data.id)

    if (updateError) {
      console.error('Error updating OTP verification:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in verifyOTP:', error)
    return false
  }
}

export async function resendOTP(email: string, purpose: OTPurpose): Promise<boolean> {
  const otp = generateOTP()

  const stored = await storeOTP(email, otp, purpose)
  if (!stored) return false

  const sent = await sendOTPEmail(email, otp, purpose)
  return sent
}

export async function cleanupExpiredOTPs(): Promise<void> {
  try {
    const supabase = await createClient()

    await supabase.rpc('cleanup_expired_otps')
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error)
  }
}

export async function hasValidOTP(email: string, purpose: OTPurpose): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('otp_verifications')
      .select('id')
      .eq('email', email)
      .eq('purpose', purpose)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    return !error && !!data
  } catch {
    return false
  }
}
