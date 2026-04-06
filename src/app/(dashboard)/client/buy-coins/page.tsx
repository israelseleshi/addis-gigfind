"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CoinPackageCard } from "@/components/payment/coin-package-card";
import { toast } from "sonner";
import { ShieldCheck, CreditCard, HelpCircle, Coins } from "lucide-react";

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

export default function ClientBuyCoinsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Client buy-coins: user:', user?.id);
      
      if (!user) {
        router.push('/login?redirect=/client/buy-coins');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      console.log('Client buy-coins: profile:', profile, 'error:', profileError);

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        router.push('/');
        return;
      }

      if (profile?.role !== 'client') {
        console.log('Profile role check failed:', profile?.role);
        router.push('/');
        return;
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router, supabase]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Buy Coins</h1>
          <p className="text-sm text-gray-500">Get coins to access premium features</p>
        </div>
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <ShieldCheck className="w-4 h-4" />
          Secure Payment via Chapa
        </div>
      </div>

      {/* How it works */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 p-4 rounded-lg text-center">
          <Coins className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-800">1. Buy Coins</h3>
          <p className="text-sm text-gray-500">Choose a package</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg text-center">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">2. Access Premium</h3>
          <p className="text-sm text-gray-500">Use coins for features</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg text-center">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800">3. Get Results</h3>
          <p className="text-sm text-gray-500">Grow your business</p>
        </div>
      </div>

      {/* Coin Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <p>All payments are processed securely through Chapa.</p>
        </div>
      </div>
    </div>
  );
}