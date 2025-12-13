'use client';

import { useState } from 'react';
import { Search, MapPin, DollarSign, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Mock gig data
const MOCK_GIGS = [
  {
    id: 1,
    title: 'Website Redesign for Local Business',
    category: 'Web Design',
    location: 'Bole',
    budget: '5000 - 10000',
    currency: 'Birr',
    postedTime: '2 hours ago',
    description: 'Need a modern website redesign for our e-commerce store',
    isNew: true,
  },
  {
    id: 2,
    title: 'Plumbing Repair - Bathroom Renovation',
    category: 'Plumbing',
    location: 'Kazanchis',
    budget: '2000 - 3500',
    currency: 'Birr',
    postedTime: '4 hours ago',
    description: 'Complete bathroom plumbing work including pipe installation',
    isNew: false,
  },
  {
    id: 3,
    title: 'English Tutoring for High School Students',
    category: 'Tutoring',
    location: 'Bole',
    budget: '500 - 800',
    currency: 'Birr',
    postedTime: '1 day ago',
    description: 'Need experienced English teacher for exam preparation',
    isNew: false,
  },
  {
    id: 4,
    title: 'Electrical Installation - Office Setup',
    category: 'Electrical',
    location: 'Nifas Silk',
    budget: '3000 - 5000',
    currency: 'Birr',
    postedTime: '6 hours ago',
    description: 'Office electrical wiring and installation project',
    isNew: true,
  },
  {
    id: 5,
    title: 'Mobile App Development',
    category: 'Software Development',
    location: 'Bole',
    budget: '15000 - 25000',
    currency: 'Birr',
    postedTime: '3 days ago',
    description: 'Build a custom mobile app for inventory management',
    isNew: false,
  },
  {
    id: 6,
    title: 'Graphic Design - Logo Creation',
    category: 'Design',
    location: 'Kazanchis',
    budget: '1500 - 3000',
    currency: 'Birr',
    postedTime: '5 hours ago',
    description: 'Professional logo design for startup company',
    isNew: true,
  },
];

const CATEGORIES = [
  'All Categories',
  'Plumbing',
  'Tutoring',
  'Web Design',
  'Electrical',
  'Software Development',
  'Design',
  'Carpentry',
  'Cleaning',
];

const LOCATIONS = [
  'All Locations',
  'Bole',
  'Kazanchis',
  'Nifas Silk',
  'Addis Ketema',
  'Gulele',
  'Yeka',
  'Arada',
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');

  // Filter gigs based on search criteria
  const filteredGigs = MOCK_GIGS.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All Categories' ||
      gig.category === selectedCategory;
    const matchesLocation =
      selectedLocation === 'All Locations' ||
      gig.location === selectedLocation;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-800">Find Work</h1>
          <p className="mt-2 text-slate-600">
            Browse available gigs and find your next opportunity
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search gigs by title or description..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600">
            Showing {filteredGigs.length} gig{filteredGigs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Gigs Grid */}
        {filteredGigs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGigs.map((gig) => (
              <Card
                key={gig.id}
                className="overflow-hidden transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="line-clamp-2 text-lg font-semibold text-slate-800">
                        {gig.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {gig.category}
                      </p>
                    </div>
                    {gig.isNew && (
                      <Badge className="shrink-0 bg-amber-500 text-white hover:bg-amber-600">
                        New
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="line-clamp-2 text-sm text-slate-600">
                    {gig.description}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {gig.location}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <DollarSign className="h-4 w-4 text-amber-500" />
                      {gig.budget} {gig.currency}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-4 w-4" />
                      {gig.postedTime}
                    </div>
                  </div>

                  {/* Apply Button - Blurred */}
                  <Button
                    disabled
                    className="mt-4 w-full bg-slate-300 text-slate-500 hover:bg-slate-300"
                  >
                    Apply Now
                  </Button>
                  <p className="text-center text-xs text-slate-500">
                    Login required to apply
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white py-12 text-center">
            <Search className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No gigs found
            </h3>
            <p className="mt-2 text-slate-600">
              Try adjusting your search filters or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
