import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="mx-auto w-[400px]">
        <ForgotPasswordForm />
        <div className="mt-4 text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
