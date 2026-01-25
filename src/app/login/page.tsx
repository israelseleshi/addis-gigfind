import { LoginForm } from '@/components/auth/login-form'
import Link from 'next/link'
import { Footer } from '@/components/footer'

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="mx-auto grid w-[400px] gap-6">
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer at bottom */}
      <Footer />
    </div>
  )
}
