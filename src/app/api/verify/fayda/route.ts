import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Mock Fayda verification - simulates the real Fayda eSignet flow
// In production, this would connect to auth.fayda.et

// Simulated OTP storage (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number; data: any }>()

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, faydaNumber, otp, name, dob } = body

    // Action 1: Request OTP (simulates Fayda sending OTP to phone)
    if (action === 'request_otp') {
      if (!faydaNumber || faydaNumber.length !== 11) {
        return NextResponse.json(
          { success: false, error: 'Invalid Fayda number. Must be 11 digits.' },
          { status: 400 }
        )
      }

      const otpCode = generateOTP()
      
      // Store OTP for 5 minutes
      otpStore.set(faydaNumber, {
        otp: otpCode,
        expires: Date.now() + 5 * 60 * 1000,
        data: {
          faydaNumber,
          name: name || 'Demo User',
          dob: dob || '1995-01-01',
        }
      })

      console.log(`[Mock Fayda] OTP for ${faydaNumber}: ${otpCode}`)

      return NextResponse.json({
        success: true,
        message: 'OTP sent to registered phone number',
        // For demo purposes, return the OTP so user can test
        demo_otp: otpCode
      })
    }

    // Action 2: Verify OTP (simulates Fayda returning verified data)
    if (action === 'verify') {
      if (!faydaNumber || !otp) {
        return NextResponse.json(
          { success: false, error: 'Fayda number and OTP are required' },
          { status: 400 }
        )
      }

      const stored = otpStore.get(faydaNumber)
      
      if (!stored) {
        return NextResponse.json(
          { success: false, error: 'No OTP request found. Please request OTP first.' },
          { status: 400 }
        )
      }

      if (Date.now() > stored.expires) {
        otpStore.delete(faydaNumber)
        return NextResponse.json(
          { success: false, error: 'OTP expired. Please request a new one.' },
          { status: 400 }
        )
      }

      if (stored.otp !== otp) {
        return NextResponse.json(
          { success: false, error: 'Invalid OTP. Please try again.' },
          { status: 400 }
        )
      }

      // OTP verified - return the verified data
      const verifiedData = {
        fayda_number: faydaNumber,
        full_name: stored.data.name,
        date_of_birth: stored.data.dob,
        verified_at: new Date().toISOString()
      }

      // Clean up OTP
      otpStore.delete(faydaNumber)

      return NextResponse.json({
        success: true,
        verified: true,
        data: verifiedData
      })
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use request_otp or verify.' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[Mock Fayda] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification service error' },
      { status: 500 }
    )
  }
}

// Get verification status for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('fayda_verified, fayda_number, fayda_verified_at, full_name')
      .eq('id', userId)
      .single()

    return NextResponse.json({
      success: true,
      verified: profile?.fayda_verified || false,
      fayda_number: profile?.fayda_number || null,
      verified_at: profile?.fayda_verified_at || null,
      name: profile?.full_name || null
    })

  } catch (error) {
    console.error('[Mock Fayda] Get status error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get verification status' },
      { status: 500 }
    )
  }
}