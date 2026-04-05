"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, ArrowLeft, Home, Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const tx_ref = searchParams.get("tx_ref");
  const paymentType = searchParams.get("type");
  const gigId = searchParams.get("gig");
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing");
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!tx_ref) {
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch(`/api/wallet/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tx_ref, status: 'success' })
        });

        const data = await response.json();
        
        if (data.success) {
          setVerified(true);
          setStatus("success");
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("success");
      }
    };

    verifyPayment();
  }, [tx_ref]);

  const getRedirectUrl = () => {
    if (paymentType === 'hire' && gigId) {
      return `/client/my-jobs/${gigId}`;
    }
    if (paymentType === 'coin') {
      return '/freelancer/dashboard';
    }
    return '/client/my-gigs';
  };

  const getTitle = () => {
    if (paymentType === 'coin') return 'Coins Purchased!';
    if (paymentType === 'hire') return 'Payment Successful!';
    return 'Payment Successful!';
  };

  const getDescription = () => {
    if (paymentType === 'coin') return 'Your coins have been added to your wallet.';
    if (paymentType === 'hire') return 'You have successfully hired the freelancer.';
    return 'Thank you for your payment. Your transaction was completed successfully.';
  };

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="w-20 h-20 text-amber-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment...</h1>
            <p className="text-gray-600">Please wait while we verify your payment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            {status === "success" ? (
              <CheckCircle className="w-20 h-20 text-green-500" />
            ) : (
              <XCircle className="w-20 h-20 text-red-500" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {getTitle()}
          </h1>
          
          <p className="text-gray-600 mb-6">
            {getDescription()}
          </p>

          {tx_ref && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-sm text-gray-500">Transaction Reference</p>
              <p className="font-mono text-sm font-medium text-gray-800">{tx_ref}</p>
            </div>
          )}

          {verified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-700">✓ Payment verified successfully</p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href={getRedirectUrl()}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {paymentType === 'coin' ? 'Go to Dashboard' : 'View My Jobs'}
            </Link>
            
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}