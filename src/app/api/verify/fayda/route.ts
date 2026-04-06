import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function createDemoToken(faydaNumber: string, otp: string, name: string): string {
  const payload = JSON.stringify({ faydaNumber, otp, name: name || 'Demo User', expires: Date.now() + 5 * 60 * 1000 })
  return Buffer.from(payload).toString('base64')
}

function parseDemoToken(token: string): { faydaNumber: string; otp: string; name: string; expires: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    return decoded
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, faydaNumber, otp, name } = body

    if (action === 'request_otp') {
      if (!faydaNumber || faydaNumber.length !== 11) {
        return NextResponse.json(
          { success: false, error: 'Invalid Fayda number. Must be 11 digits.' },
          { status: 400 }
        )
      }

      const otpCode = generateOTP()
      
      const demoToken = createDemoToken(faydaNumber, otpCode, name || 'Demo User')

      console.log(`[Mock Fayda] OTP for ${faydaNumber}: ${otpCode}`)

      const response = NextResponse.json({
        success: true,
        message: 'OTP sent to registered phone number',
        demo_otp: otpCode
      })

      response.cookies.set('fayda_otp_token', demoToken, {
        httpOnly: false,
        maxAge: 5 * 60,
        path: '/',
      })

      return response
    }

    if (action === 'verify') {
      if (!faydaNumber || !otp) {
        return NextResponse.json(
          { success: false, error: 'Fayda number and OTP are required' },
          { status: 400 }
        )
      }

      const token = req.cookies.get('fayda_otp_token')?.value
      
      if (!token) {
        return NextResponse.json(
          { success: false, error: 'No OTP request found. Please request OTP first.' },
          { status: 400 }
        )
      }

      const stored = parseDemoToken(token)
      
      if (!stored) {
        return NextResponse.json(
          { success: false, error: 'Invalid session. Please request OTP again.' },
          { status: 400 }
        )
      }

      if (stored.faydaNumber !== faydaNumber) {
        return NextResponse.json(
          { success: false, error: 'Fayda number mismatch. Please start over.' },
          { status: 400 }
        )
      }

      if (Date.now() > stored.expires) {
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

      const response = NextResponse.json({
        success: true,
        verified: true,
        data: {
          fayda_number: faydaNumber,
          full_name: stored.name,
          verified_at: new Date().toISOString()
        }
      })

      response.cookies.delete('fayda_otp_token')

      return response
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