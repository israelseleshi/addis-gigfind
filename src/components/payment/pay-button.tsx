"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PayButtonProps {
  gig: {
    id: string;
    title: string;
    budget: number;
  };
  user?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  } | null;
}

export function PayButton({ gig, user }: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/payments/chapa/initialize", {
        amount: gig.budget,
        email: user?.email || "test@example.com",
        first_name: user?.first_name || "Test",
        last_name: user?.last_name || "User",
        phone_number: user?.phone_number || "0900123456",
        gig_id: gig.id,
        title: gig.title,
      });

      if (res.data.success && res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
      } else {
        toast.error(res.data.error || "Payment initialization failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.error || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700 text-white font-medium"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Pay {gig.budget.toLocaleString()} ETB
        </>
      )}
    </Button>
  );
}
