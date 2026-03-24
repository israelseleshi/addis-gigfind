export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">Privacy Policy</h1>
        <div className="prose prose-zinc max-w-none">
          <p className="text-zinc-600">Last updated: {new Date().toLocaleDateString()}</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">1. Information We Collect</h2>
          <p className="text-zinc-600">We collect information you provide directly to us, including name, email address, profile information, and any content you create on the platform.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">2. How We Use Your Information</h2>
          <p className="text-zinc-600">We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">3. Information Sharing</h2>
          <p className="text-zinc-600">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">4. Data Security</h2>
          <p className="text-zinc-600">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          <h2 className="text-xl font-semibold text-zinc-800 mt-6">5. Your Rights</h2>
          <p className="text-zinc-600">You have the right to access, correct, or delete your personal information. Contact us to exercise these rights.</p>
        </div>
      </div>
    </div>
  )
}
