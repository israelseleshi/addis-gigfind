export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-6">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <p className="text-zinc-600 mb-4">Have questions or need help? Reach out to us.</p>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-zinc-900">Email</h3>
                <p className="text-zinc-600">support@addisgigfind.com</p>
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900">Location</h3>
                <p className="text-zinc-600">Addis Ababa, Ethiopia</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-zinc-100">
            <h2 className="font-semibold text-zinc-900 mb-4">Send us a message</h2>
            <p className="text-sm text-zinc-500">Contact form coming soon. For now, email us directly.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
