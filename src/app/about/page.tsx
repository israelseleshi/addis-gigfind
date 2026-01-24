import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us - Addis GigFind',
  description: 'Learn more about Addis GigFind and our mission to connect clients with skilled professionals in Addis Ababa.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-800">About Us</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Connecting clients with skilled professionals across Addis Ababa.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Our Mission</h2>
            <p className="mt-4 text-slate-600">
              Addis GigFind is dedicated to bridging the gap between clients seeking quality services 
              and skilled professionals looking for opportunities. We believe in making it easier 
              for people to find trusted help in their local community.
            </p>
            <p className="mt-4 text-slate-600">
              Whether you need a plumber, tutor, web designer, or any other service professional, 
              our platform connects you with verified experts ready to get the job done.
            </p>
          </div>
          <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-800 mb-4">Why Choose Us?</h3>
            <ul className="space-y-3 text-slate-600">
              <li>• Verified professionals in your area</li>
              <li>• Transparent pricing and budget tracking</li>
              <li>• Secure payment agreements</li>
              <li>• Local support for Addis Ababa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
