'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, DollarSign, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/footer';
import Link from 'next/link';

interface Gig {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: number;
  description: string;
  created_at: string;
  status: string;
}

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

function formatLocation(value: string) {
  return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatCategory(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchGigs();
  }, []);

  const fetchGigs = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setGigs(data || []);
      }
    } catch {
      setError('Failed to fetch gigs');
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = gigs.filter((gig) => {
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

  const isNew = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const hours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return hours < 24;
  };

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
              {mounted ? (
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
              ) : (
                <Select defaultValue="All Categories">
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
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Location
              </label>
              {mounted ? (
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
              ) : (
                <Select defaultValue="All Locations">
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
              )}
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
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 py-12 text-center">
            <p className="text-red-600">Error loading gigs: {error}</p>
          </div>
        ) : filteredGigs.length > 0 ? (
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
                        {formatCategory(gig.category)}
                      </p>
                    </div>
                    {isNew(gig.created_at) && (
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
                      {formatLocation(gig.location)}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <DollarSign className="h-4 w-4 text-amber-500" />
                      ETB {gig.budget.toLocaleString()}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-4 w-4" />
                      {timeAgo(gig.created_at)}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" asChild className="flex-1">
                      <Link href={`/search/${gig.id}`}>View Details</Link>
                    </Button>
                    <Button
                      disabled
                      className="flex-1 bg-slate-300 text-slate-500 hover:bg-slate-300"
                    >
                      Apply
                    </Button>
                  </div>
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
      <Footer />
    </div>
  );
}
