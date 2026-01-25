"use client";

import { useState, useEffect, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from "@/lib/supabase/client";

export default function GigDetailPage({ params }: { params: Promise<{ gigId: string }> }) {
  const resolvedParams = use(params);
  const gigId = resolvedParams.gigId;
  
  const [gig, setGig] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGig();
  }, [gigId]);

  const loadGig = async () => {
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
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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
    <div className="container mx-auto p-6">
      <Button asChild variant="outline" className="mb-6 cursor-pointer">
        <Link href="/freelancer/find-work">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Gigs
        </Link>
      </Button>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl">{gig.title}</CardTitle>
              <CardDescription className="mt-2">{gig.category} · {gig.location}</CardDescription>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {gig.budget ? `ETB ${gig.budget.toLocaleString()}` : 'Negotiable'}
              </p>
              <p className="text-sm text-gray-500">Posted {new Date(gig.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-700 whitespace-pre-line">{gig.description}</p>
          
          {/* Client Info */}
          {client && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {client.full_name?.charAt(0) || 'C'}
              </div>
              <div>
                <p className="font-medium">{client.full_name}</p>
                {client.average_rating && (
                  <p className="text-sm text-amber-500">★ {client.average_rating.toFixed(1)}</p>
                )}
              </div>
            </div>
          )}
          
          <Button onClick={() => setIsApplyModalOpen(true)} className="w-full cursor-pointer">Apply Now</Button>
        </CardContent>
      </Card>

      {/* Application Modal */}
      <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {gig.title}</DialogTitle>
            <DialogDescription>Submit your proposal for this gig.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Write a compelling cover note to attract the client..." className="min-h-[150px]" />
          <DialogFooter>
            <Button onClick={() => {
              toast.success('Application submitted successfully!');
              setIsApplyModalOpen(false);
            }} className="cursor-pointer">Submit Application</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
