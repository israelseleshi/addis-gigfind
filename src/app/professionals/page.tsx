import Link from 'next/link'

export default function ProfessionalsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Browse Professionals</h1>
        <p className="text-zinc-600 mb-8">Find skilled freelancers for your projects</p>
        <Link href="/freelancer/find-work" className="inline-flex items-center justify-center rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 transition-colors">
          Browse All Freelancers
        </Link>
      </div>
    </div>
  )
}
