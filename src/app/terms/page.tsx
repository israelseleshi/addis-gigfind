export default function TermsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">Terms of Service</h1>
        <div className="prose prose-zinc max-w-none">
          <p className="text-zinc-600">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">1. Acceptance of Terms</h2>
          <p className="text-zinc-600">By accessing and using Addis GigFind, you accept and agree to be bound by the terms and provisions of this agreement.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">2. Use of Service</h2>
          <p className="text-zinc-600">Addis GigFind provides a platform connecting clients with freelancers. Users agree to use the service only for lawful purposes.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">3. User Responsibilities</h2>
          <p className="text-zinc-600">Users are responsible for maintaining the confidentiality of their account credentials and for all activities under their account.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">4. Payment Terms</h2>
          <p className="text-zinc-600">Payment terms are agreed upon between clients and freelancers. Addis GigFind facilitates transactions but is not responsible for disputes between parties.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">5. Limitation of Liability</h2>
          <p className="text-zinc-600">Addis GigFind shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.</p>
        </div>
      </div>
    </div>
  )
}
