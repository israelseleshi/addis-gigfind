"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Shield, Phone, Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function FaydaVerificationPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [step, setStep] = useState<'fayda' | 'otp' | 'success'>('fayda')
  const [faydaNumber, setFaydaNumber] = useState('')
  const [fullName, setFullName] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')

  const handleRequestOTP = async () => {
    if (!faydaNumber || faydaNumber.length !== 11) {
      toast.error('Please enter a valid 11-digit Fayda number')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/verify/fayda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_otp',
          faydaNumber,
          name: fullName
        })
      })

      const data = await response.json()

      if (data.success) {
        setDemoOtp(data.demo_otp)
        setStep('otp')
        toast.success('OTP sent! (Check demo OTP below)')
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Failed to request OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/verify/fayda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          faydaNumber,
          otp
        })
      })

      const data = await response.json()

      if (data.success && data.verified) {
        // Update user profile with verification
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              fayda_verified: true,
              fayda_number: faydaNumber,
              fayda_verified_at: new Date().toISOString(),
              verification_status: 'verified'
            })
            .eq('id', user.id)

          if (updateError) {
            toast.error('Failed to update verification status')
            return
          }
        }

        setStep('success')
        toast.success('Fayda verification successful!')
      } else {
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === 'success' ? 'Verified!' : 'Fayda Identity Verification'}
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            {step === 'fayda' && 'Enter your Fayda number to verify your identity'}
            {step === 'otp' && 'Enter the OTP sent to your registered phone'}
            {step === 'success' && 'Your identity has been verified successfully'}
          </p>
        </CardHeader>

        <CardContent>
          {step === 'fayda' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name (as on Fayda)</Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="faydaNumber">Fayda Number</Label>
                <Input
                  id="faydaNumber"
                  placeholder="11-digit Fayda number"
                  value={faydaNumber}
                  onChange={(e) => setFaydaNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  maxLength={11}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter 11-digit number from your Fayda card
                </p>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleRequestOTP}
                disabled={loading || faydaNumber.length !== 11}
              >
                {loading ? 'Processing...' : 'Verify Identity'}
              </Button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 font-medium">Demo Mode</p>
                <p className="text-xs text-amber-600 mt-1">
                  For testing, your OTP is: <span className="font-bold text-lg">{demoOtp}</span>
                </p>
              </div>

              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                />
              </div>

              <p className="text-xs text-gray-500 text-center">
                OTP sent to ****{faydaNumber.slice(-4)}
              </p>

              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setStep('fayda')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={handleVerify}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-medium text-green-800">Identity Verified</p>
                <p className="text-sm text-green-600 mt-1">
                  Fayda: {faydaNumber}
                </p>
              </div>

              <div className="space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => router.push('/freelancer/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/freelancer/kyc')}
                >
                  View KYC Status
                </Button>
              </div>
            </div>
          )}

          {step !== 'success' && (
            <div className="mt-6 pt-4 border-t text-center">
              <p className="text-xs text-gray-500">
                This is a demo verification. In production, 
                this would connect to the official Fayda eSignet API.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back button */}
      {step !== 'success' && (
        <Link 
          href="/freelancer/kyc"
          className="absolute top-4 left-4 text-white/80 hover:text-white flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to KYC
        </Link>
      )}
    </div>
  )
}