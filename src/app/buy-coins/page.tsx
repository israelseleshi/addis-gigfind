"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CoinPackageCard } from "@/components/payment/coin-package-card";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, CreditCard, HelpCircle, Coins, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COIN_PACKAGES = [
  {
    id: "starter",
    coins: 10,
    price: 100,
    label: "Starter Pack",
    popular: false,
  },
  {
    id: "pro",
    coins: 25,
    price: 200,
    label: "Pro Pack",
    popular: true,
  },
  {
    id: "business",
    coins: 50,
    price: 350,
    label: "Business Pack",
    popular: false,
  },
];

export default function BuyCoinsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login?redirect=/buy-coins');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'freelancer') {
        toast.error('Only freelancers can buy coins');
        router.push('/');
        return;
      }

      setUser(user);
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router, supabase]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  const handleBuy = async (pkg: typeof COIN_PACKAGES[0]) => {
    setLoading(pkg.id);
    
    try {
      const response = await fetch('/api/wallet/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkg.id })
      });
      
      const data = await response.json();
      
      if (data.success && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast.error(data.error || 'Failed to initialize payment');
        setLoading(null);
      }
    } catch (error) {
      toast.error('Payment initialization failed');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/freelancer/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Buy Coins</h1>
                <p className="text-sm text-gray-500">Get coins to apply for gigs</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Secure Payment via Chapa
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* How it works */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-800 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Coins className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-gray-800">1. Buy Coins</h3>
              <p className="text-sm text-gray-500 mt-1">Choose a coin package that fits your needs</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">2. Apply to Gigs</h3>
              <p className="text-sm text-gray-500 mt-1">Spend coins to apply for gigs you want</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-800">3. Get Hired</h3>
              <p className="text-sm text-gray-500 mt-1">If hired, you&apos;ll get paid for your work</p>
            </div>
          </div>
        </div>

        {/* Coin Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {COIN_PACKAGES.map((pkg) => (
            <CoinPackageCard
              key={pkg.id}
              pkg={pkg}
              onBuy={handleBuy}
              loading={loading === pkg.id}
            />
          ))}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Accepted Payment Methods
          </h3>
          <div className="flex flex-wrap gap-4">
            {["TeleBirr", "CBE Birr", "Awash Bank", "Visa/MasterCard"].map((method) => (
              <div key={method} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium text-gray-700">
                {method}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 text-sm text-gray-500">
            <HelpCircle className="w-4 h-4 mt-0.5" />
            <p>All payments are processed securely through Chapa. Your payment information is never stored on our servers.</p>
          </div>
        </div>
      </div>
    </div>
  );
}