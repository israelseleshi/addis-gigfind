import Link from 'next/link'

const faqs = [
  {
    q: 'How do I create an account?',
    a: 'Click "Get Started" on the homepage and choose whether you want to be a client or freelancer. Follow the registration steps.'
  },
  {
    q: 'How do I post a gig?',
    a: 'Log in as a client, go to your dashboard, and click "Post a Gig". Fill in the details and submit.'
  },
  {
    q: 'How do I apply for work?',
    a: 'Browse available gigs, click on one that interests you, and click "Apply". Write a compelling proposal.'
  },
  {
    q: 'How do payments work?',
    a: 'Payments are handled directly between clients and freelancers. Agree on terms before starting work.'
  },
]

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">FAQ</h1>
        <p className="text-zinc-600 mb-8">Frequently asked questions</p>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-zinc-100">
              <h3 className="font-semibold text-zinc-900">{faq.q}</h3>
              <p className="text-sm text-zinc-600 mt-2">{faq.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 p-6 bg-amber-50 rounded-xl border border-amber-100">
          <p className="text-sm text-amber-800">
            Still have questions? <Link href="/contact" className="underline font-medium">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
