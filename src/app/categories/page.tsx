import Link from 'next/link'

const categories = [
  { name: 'Web Development', slug: 'web-development', count: 234 },
  { name: 'Mobile Development', slug: 'mobile-development', count: 156 },
  { name: 'Design & Creative', slug: 'design-creative', count: 189 },
  { name: 'Writing & Translation', slug: 'writing-translation', count: 98 },
  { name: 'Administrative', slug: 'administrative', count: 67 },
  { name: 'Marketing', slug: 'marketing', count: 145 },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Browse Categories</h1>
        <p className="text-zinc-600 mb-8">Find freelancers by skill category</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/freelancer/find-work?category=${cat.slug}`}
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-zinc-100"
            >
              <h3 className="font-semibold text-zinc-900">{cat.name}</h3>
              <p className="text-sm text-zinc-500 mt-1">{cat.count} freelancers</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
