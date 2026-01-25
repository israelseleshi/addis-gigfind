"use client"

import * as React from "react"
import { OTPInput } from "@/components/ui/otp-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { sendOTP, verifyOTPCode } from "@/lib/actions/auth"
import { Mail, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react"

interface OTPVerificationProps {
  email: string
  onVerified: () => void
  purpose?: "signup"
}

export function OTPVerification({ email, onVerified, purpose = "signup" }: OTPVerificationProps) {
  const [otp, setOtp] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [resendTimer, setResendTimer] = React.useState(0)
  const [otpSent, setOtpSent] = React.useState(false)

  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleSendOTP = async () => {
    setIsSending(true)
    setError(null)

    const result = await sendOTP(email, purpose)

    if (result.error) {
      setError(result.error)
    } else {
      setOtpSent(true)
      setResendTimer(60)
    }

    setIsSending(false)
  }

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsVerifying(true)
    setError(null)

    const result = await verifyOTPCode(email, otp, purpose)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => {
        onVerified()
      }, 1500)
    }

    setIsVerifying(false)
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-600">Email Verified!</h3>
            <p className="text-muted-foreground">Redirecting to continue...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
        <CardDescription>
          We&apos;ve sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!otpSent ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>Click the button below to receive your verification code via email.</p>
                </div>
              </div>
            </div>
            <Button
              onClick={handleSendOTP}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Code
                </>
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label className="text-center text-sm text-muted-foreground">
                Enter the 6-digit code
              </Label>
              <OTPInput
                length={6}
                value={otp}
                onChange={setOtp}
                disabled={isVerifying}
                className="py-4"
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleVerify}
                disabled={isVerifying || otp.length !== 6}
                className="w-full"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleSendOTP}
                disabled={isSending || resendTimer > 0}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend code in ${resendTimer}s`
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default OTPVerification
