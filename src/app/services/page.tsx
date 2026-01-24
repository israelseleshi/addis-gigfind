import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Services - Addis GigFind',
  description: 'Discover the range of services available on Addis GigFind platform.',
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-800">Our Services</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl">
            Find skilled professionals for all your service needs.
          </p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Service Categories */}
          {[
            { name: 'Home Services', description: 'Plumbing, electrical, cleaning, and more' },
            { name: 'Technology', description: 'Web development, software, and IT services' },
            { name: 'Education', description: 'Tutoring, language lessons, and training' },
            { name: 'Design & Creative', description: 'Graphic design, photography, and creative work' },
            { name: 'Professional Services', description: 'Consulting, accounting, and business services' },
            { name: 'Skilled Trades', description: 'Carpentry, masonry, and construction work' },
          ].map((service, index) => (
            <div
              key={index}
              className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
              <p className="mt-2 text-slate-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white">Ready to get started?</h2>
          <p className="mt-4 text-blue-100">
            Browse our available professionals or post a job today.
          </p>
        </div>
      </div>
    </div>
  )
}
