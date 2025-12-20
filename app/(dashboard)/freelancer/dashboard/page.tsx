import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Star, Briefcase, DollarSign } from 'lucide-react';

// Mock Data
const freelancer = {
  verificationStatus: "Verified",
  jobsWon: 12,
  totalEarnings: 45000,
  averageRating: 4.8,
};

const recommendedGigs = [
  {
    id: 1,
    title: "Tutor for Grade 12 Mathematics",
    category: "Education",
    budget: "1,500 ETB",
    location: "Bole, Addis Ababa",
  },
  {
    id: 2,
    title: "Logo Design for a New Cafe",
    category: "Graphic Design",
    budget: "3,000 ETB",
    location: "Kazanchis, Addis Ababa",
  },
  {
    id: 3,
    title: "Plumbing Work for a Residential House",
    category: "Skilled Labor",
    budget: "5,000 ETB",
    location: "CMC, Addis Ababa",
  },
];

export default function FreelancerDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Verification & Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Verification Status */}
        <Card className="shadow-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Verification Status</CardTitle>
          </CardHeader>
          <CardContent>
            {freelancer.verificationStatus === "Verified" ? (
              <Badge variant="default" className="bg-green-500 text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="w-4 h-4 mr-2" />
                Pending
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="shadow-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Jobs Won</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Briefcase className="w-6 h-6 mr-4 text-blue-500" />
            <span className="text-3xl font-bold">{freelancer.jobsWon}</span>
          </CardContent>
        </Card>

        <Card className="shadow-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <DollarSign className="w-6 h-6 mr-4 text-green-500" />
            <span className="text-3xl font-bold">{freelancer.totalEarnings.toLocaleString()} ETB</span>
          </CardContent>
        </Card>

        <Card className="shadow-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center">
            <Star className="w-6 h-6 mr-4 text-yellow-500" />
            <span className="text-3xl font-bold">{freelancer.averageRating}</span>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Gigs Section */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedGigs.map((gig) => (
            <Card className="shadow-md" key={gig.id}>
              <CardHeader>
                <CardTitle className="text-xl">{gig.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500">{gig.category}</p>
                <p className="text-lg font-semibold">{gig.budget}</p>
                <p className="text-sm text-gray-500">{gig.location}</p>
                <Button className="w-full mt-4 cursor-pointer">Apply Now</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
