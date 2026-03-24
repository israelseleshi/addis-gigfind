export default function HelpPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">Help Center</h1>
        <p className="text-zinc-600 mb-8">Get help with using Addis GigFind</p>
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-100">
            <h3 className="font-semibold text-zinc-900">Getting Started</h3>
            <p className="text-sm text-zinc-500 mt-1">Learn how to create an account and start using the platform.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-100">
            <h3 className="font-semibold text-zinc-900">For Clients</h3>
            <p className="text-sm text-zinc-500 mt-1">How to post gigs and hire freelancers.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-100">
            <h3 className="font-semibold text-zinc-900">For Freelancers</h3>
            <p className="text-sm text-zinc-500 mt-1">How to find work and manage applications.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
