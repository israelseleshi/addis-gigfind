import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Mock Data - In a real app, you'd fetch this data
const gigs = [
  { id: 1, title: "Urgent Plumbing for Leaky Pipe", category: "Plumbing", location: "Bole", budget: "2,000 ETB", posted: "2h ago", description: "We have a leaky pipe under the kitchen sink that needs urgent attention. The ideal candidate should have experience with residential plumbing and be available to start immediately." },
  { id: 2, title: "Graphic Designer for Startup Logo", category: "Design", location: "Kazanchis", budget: "5,500 ETB", posted: "8h ago", description: "Our new startup needs a modern and memorable logo. We're looking for a creative designer with a strong portfolio in branding and identity design." },
  { id: 3, title: "Part-time English Tutor for University Student", category: "Tutoring", location: "4 Kilo", budget: "3,000 ETB / month", posted: "1d ago", description: "Seeking an experienced English tutor to help a university student improve their academic writing and conversational skills. Sessions will be twice a week." },
  { id: 4, title: "House Wiring and Electrical Setup", category: "Electrical", location: "CMC", budget: "8,000 ETB", posted: "3d ago", description: "We are renovating our house and need a certified electrician to handle the complete wiring and setup of electrical outlets and fixtures." },
  { id: 5, title: "Content Writer for Tech Blog", category: "Writing", location: "Piassa", budget: "1,500 ETB per article", posted: "5d ago", description: "Our tech blog is looking for a skilled writer to produce high-quality articles on topics like software development, AI, and cybersecurity." },
  { id: 6, title: "Social Media Manager for a Cafe", category: "Design", location: "Bole", budget: "6,000 ETB / month", posted: "1w ago", description: "A popular cafe in Bole is looking for a social media manager to handle their Instagram and Facebook accounts, create engaging content, and run ad campaigns." },
  { id: 7, title: "Private Chef for a Dinner Party", category: "Tutoring", location: "Kazanchis", budget: "4,000 ETB", posted: "2w ago", description: "We are hosting a dinner party for 10 guests and need a private chef to prepare a three-course meal. The menu can be discussed and finalized with the chef." },
  { id: 8, title: "Website Developer for a Small Business", category: "Electrical", location: "4 Kilo", budget: "15,000 ETB", posted: "3w ago", description: "A small retail business needs a simple e-commerce website to sell their products online. The ideal candidate should have experience with Shopify or WooCommerce." },
  { id: 9, title: "Data Entry Specialist", category: "Writing", location: "CMC", budget: "2,500 ETB", posted: "1mo ago", description: "We are looking for a detail-oriented data entry specialist to input customer information into our database. Accuracy and speed are essential for this role." },
  { id: 10, title: "Mobile App UI/UX Designer", category: "Design", location: "Piassa", budget: "12,000 ETB", posted: "1mo ago", description: "We are developing a new mobile app and need an experienced UI/UX designer to create an intuitive and visually appealing interface. A strong portfolio is a must." },
  { id: 11, title: "Translator (Amharic to English)", category: "Writing", location: "Bole", budget: "500 ETB / page", posted: "2mo ago", description: "We need a professional translator to translate legal documents from Amharic to English. The candidate must be fluent in both languages and have experience with legal terminology." },
  { id: 12, title: "Handyman for Furniture Assembly", category: "Plumbing", location: "Kazanchis", budget: "1,000 ETB", posted: "2mo ago", description: "We have purchased new furniture for our office and need a handyman to assemble desks, chairs, and shelves. All tools and instructions will be provided." },
  { id: 13, title: "Event Photographer", category: "Design", location: "4 Kilo", budget: "7,000 ETB", posted: "3mo ago", description: "We are hosting a corporate event and need a professional photographer to capture the key moments. The event will be for 4 hours, and we expect high-quality edited photos." },
  { id: 14, title: "Virtual Assistant for a Busy Executive", category: "Writing", location: "CMC", budget: "10,000 ETB / month", posted: "3mo ago", description: "A busy executive is looking for a virtual assistant to manage their schedule, handle emails, and perform administrative tasks. The ideal candidate should be highly organized and proactive." },
];

export default function GigDetailPage({ params }: { params: { id: string } }) {
  const gig = gigs.find(g => g.id === parseInt(params.id));

  if (!gig) {
    return <p>Gig not found.</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button asChild variant="outline" className="mb-6 cursor-pointer">
        <Link href="/freelancer/find-work">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gigs
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl">{gig.title}</CardTitle>
              <CardDescription className="mt-2">{gig.category} &middot; {gig.location}</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{gig.budget}</p>
              <p className="text-sm text-gray-500">Posted {gig.posted}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-line">{gig.description}</p>
          <Button className="w-full mt-6 cursor-pointer">Apply Now</Button>
        </CardContent>
      </Card>
    </div>
  );
}
