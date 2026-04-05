"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, MapPin, DollarSign, Clock, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { PaymentModal } from "@/components/payment/payment-modal";
import { useWalletStore } from "@/stores/wallet-store";

interface Applicant {
  id: string;
  freelancer_id: string;
  status: string;
  cover_note: string;
  created_at: string;
  bid_amount?: number;
  freelancer?: {
    full_name: string;
    phone?: string;
  }[];
}

interface Gig {
  id: string;
  title: string;
  category: string;
  location: string;
  budget: number;
  description: string;
  status: string;
  created_at: string;
  client_id: string;
}

function formatLocation(value: string) {
  return value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatCategory(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ClientGigDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gigId = params.id as string;
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hiringFreelancer, setHiringFreelancer] = useState<Applicant | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  const { addEarnings } = useWalletStore();

  useEffect(() => {
    fetchGigAndApplicants();
  }, [gigId]);

  const fetchGigAndApplicants = async () => {
    try {
      const supabase = createClient();
      
      const { data: gigData, error: gigError } = await supabase
        .from('gigs')
        .select('*')
        .eq('id', gigId)
        .single();

      if (gigError || !gigData) {
        toast.error("Gig not found");
        router.push("/client/gigs");
        return;
      }

      setGig(gigData);

      const { data: applicantsData } = await supabase
        .from('applications')
        .select(`
          id,
          freelancer_id,
          status,
          cover_note,
          bid_amount,
          created_at,
          freelancer:profiles!applications_freelancer_id_fkey(full_name, phone)
        `)
        .eq('gig_id', gigId)
        .order('created_at', { ascending: false });

      setApplicants(applicantsData || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load gig details");
    } finally {
      setLoading(false);
    }
  };

  const handleHire = (applicant: Applicant) => {
    setHiringFreelancer(applicant);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = async () => {
    if (!hiringFreelancer || !gig) return;
    
    setPaymentLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      addEarnings(gig.budget, `Payment for gig: ${gig.title}`);
      toast.success(`Successfully hired freelancer! Payment of ${gig.budget.toLocaleString()} ETB processed.`);
      setShowPaymentModal(false);
      setHiringFreelancer(null);
      setPaymentLoading(false);
      
      // Refresh applicants
      fetchGigAndApplicants();
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!gig) {
    return null;
  }

  const platformFee = Math.round(gig.budget * 0.1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/client/gigs" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{gig.title}</h1>
                <p className="text-sm text-gray-500">Manage applicants and hire</p>
              </div>
            </div>
            <Badge className={gig.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
              {gig.status}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gig Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gig Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Category</span>
                    <span className="font-medium">{formatCategory(gig.category)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Location</span>
                    <span className="font-medium">{formatLocation(gig.location)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-gray-500">Budget</span>
                    <span className="font-semibold text-amber-600">{gig.budget.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">Posted</span>
                    <span className="font-medium">{new Date(gig.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600 whitespace-pre-line">{gig.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Applicants */}
            <Card>
              <CardHeader>
                <CardTitle>Applicants ({applicants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {applicants.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No applicants yet. Check back later.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applicants.map((applicant) => (
                      <div key={applicant.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {applicant.freelancer?.[0]?.full_name || "Freelancer"}
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">{applicant.cover_note}</p>
                              <p className="text-xs text-gray-400 mt-2">
                                Applied on {new Date(applicant.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={applicant.status === 'hired' ? 'default' : 'secondary'}>
                              {applicant.status}
                            </Badge>
                            {applicant.status !== 'hired' && gig.status === 'open' && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleHire(applicant)}
                              >
                                Hire & Pay
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800">Gig Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-semibold">{gig.budget.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee (10%):</span>
                  <span className="font-semibold">{platformFee.toLocaleString()} ETB</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-amber-600">{(gig.budget + platformFee).toLocaleString()} ETB</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 text-center">
                  Click &quot;Hire & Pay&quot; on an applicant to process payment and hire them.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        onConfirm={handlePaymentConfirm}
        gigTitle={gig?.title || ""}
        freelancerName={hiringFreelancer?.freelancer?.[0]?.full_name || "Freelancer"}
        amount={gig?.budget || 0}
        platformFee={platformFee}
        loading={paymentLoading}
      />
    </div>
  );
}
