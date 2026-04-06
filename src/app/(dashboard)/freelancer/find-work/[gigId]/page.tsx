"use client";

import { useState, useEffect, use, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, ArrowLeft, Calendar, Tag, Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from "@/lib/supabase/client";
import { applyForGig } from '@/lib/actions/applications';
import { Label } from '@/components/ui/label';

interface Gig {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: number | null;
  description: string;
  created_at: string;
  client: Client | null;
}

interface Client {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  average_rating: number | null;
}

function formatLocation(value: string) {
  return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatCategory(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function GigDetailPage({ params }: { params: Promise<{ gigId: string }> }) {
  const resolvedParams = use(params);
  const gigId = resolvedParams.gigId;
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  const loadGig = useCallback(async () => {
    try {
      const supabase = createClient();
      
      // Fetch gig details
      const { data: gigData, error: gigError } = await supabase
        .from('gigs')
        .select(`
          *,
          client:profiles!gigs_client_id_fkey(id, full_name, avatar_url, average_rating)
        `)
        .eq('id', gigId)
        .single();

      if (gigError) {
        console.error('Error loading gig:', gigError);
        setGig(null);
      } else {
        setGig(gigData);
        setClient(gigData?.client);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('verification_status')
          .eq('id', user.id)
          .single();
        setVerificationStatus(profile?.verification_status ?? null);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [gigId]);

  useEffect(() => {
    loadGig();
  }, [loadGig]);


  const handleApplySubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await applyForGig({ gigId, coverNote });
      if (result.error) {
        toast.error(String(result.error));
      } else {
        toast.success('Application submitted successfully!');
        setIsApplyModalOpen(false);
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="container mx-auto p-6">
        <Button asChild variant="outline" className="mb-6 cursor-pointer">
          <Link href="/freelancer/find-work">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gigs
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-zinc-500">Gig not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6 hover:bg-orange-50 transition-colors">
          <Link href="/freelancer/find-work" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Gigs</span>
          </Link>
        </Button>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Gig Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
              {/* Gradient Header */}
              <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{gig.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-orange-100">
                      <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 px-3 py-1">
                        {formatCategory(gig.category)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formatLocation(gig.location)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {gig.budget ? `ETB ${gig.budget.toLocaleString()}` : 'Negotiable'}
                    </div>
                    <div className="text-sm text-orange-100 mt-1">
                      Posted {new Date(gig.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{gig.description}</p>
                  </div>
                </div>

                {/* Apply Button */}
                <Button
                  onClick={() => {
                    if (verificationStatus !== 'verified') {
                      toast.error('You must be verified to apply for gigs.')
                      return
                    }
                    setIsApplyModalOpen(true)
                  }}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Apply for This Gig
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Client Info & Stats */}
          <div className="space-y-6">
            {/* Client Information Card */}
            {client && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <h3 className="text-lg font-semibold text-gray-900">About the Client</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={client.avatar_url || ''} />
                      <AvatarFallback className="text-xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 text-white">
                        {client.full_name?.charAt(0) || 'C'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{client.full_name}</h4>
                    {client.average_rating ? (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(client.average_rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 ml-1">{client.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-600 ml-1">{client.average_rating < 2 ? 'Newbie' : client.average_rating < 3 ? 'Rising Star' : client.average_rating < 4 ? 'Pro' : 'Master'}</span>
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">0 reviews so far</p>
                        <p className="text-xs text-gray-400">New client — no ratings yet.</p>
                      </div>
                    )}
                  </div>
                </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                        Verified Client
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <h3 className="text-lg font-semibold text-gray-900">Gig Details</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Tag className="h-4 w-4 text-gray-400" />
                    Category
                  </span>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">{formatCategory(gig.category)}</Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    Location
                  </span>
                  <span className="font-medium text-gray-900">{formatLocation(gig.location)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Badge className="h-4 w-4 rounded-full bg-green-100 text-green-600" />
                    Budget
                  </span>
                  <span className="font-bold text-green-600">
                    {gig.budget ? `ETB ${gig.budget.toLocaleString()}` : 'Negotiable'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Posted
                  </span>
                  <span className="font-medium text-gray-900">{new Date(gig.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-green-200 bg-green-50">
          <DialogHeader>
            <DialogTitle className="text-xl">Apply for {gig.title}</DialogTitle>
            <DialogDescription>
              Submit your proposal to stand out from other applicants.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="coverNote" className="text-sm font-medium">Cover Note</Label>
              <Textarea
                id="coverNote"
                placeholder="Write a compelling cover note explaining why you're the perfect fit for this gig..."
                className="min-h-[120px] resize-none"
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleApplySubmit} 
              disabled={isSubmitting} 
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
