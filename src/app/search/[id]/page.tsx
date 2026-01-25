'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, DollarSign, Clock, Calendar, ArrowLeft } from 'lucide-react';
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
  client_id: string;
}

function formatLocation(value: string) {
  return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatCategory(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
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

export default function GigDetailsPage() {
  const params = useParams();
  const gigId = params.id as string;
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Params:', params);
    if (gigId) {
      console.log('Fetching gig with ID:', gigId);
      fetchGig();
    } else {
      console.log('No gigId found in params');
      setError('Invalid gig ID');
      setLoading(false);
    }
  }, [gigId]);

  const fetchGig = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      console.log('Fetching gig with ID:', gigId);
      
      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('id', gigId)
        .single();

      console.log('Fetch result:', data, error);

      if (error) {
        setError(error.message);
      } else if (data) {
        setGig(data);
      } else {
        setError('Gig not found');
      }
    } catch (err) {
      console.error('Catch error:', err);
      setError('Failed to fetch gig details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error || 'Gig not found'}</p>
            <Button asChild>
              <Link href="/search">Back to Search</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/search">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Search
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl">{gig.title}</CardTitle>
                <p className="text-slate-600 mt-1">{formatCategory(gig.category)}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                gig.status === 'open' ? 'bg-green-100 text-green-700' :
                gig.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                gig.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                gig.status === 'completed' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {gig.status.replace('_', ' ')}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-slate-800 mb-2">Description</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{gig.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <MapPin className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Location</p>
                  <p className="font-medium">{formatLocation(gig.location)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="font-medium">ETB {gig.budget.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Clock className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Posted</p>
                  <p className="font-medium">{timeAgo(gig.created_at)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="font-medium">{formatDate(gig.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <Button className="flex-1 bg-amber-500 hover:bg-amber-600">
                Apply Now
              </Button>
              <Button variant="outline" className="flex-1">
                Contact Client
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
