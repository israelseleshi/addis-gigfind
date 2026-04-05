"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoinPackage {
  id: string;
  coins: number;
  price: number;
  label: string;
  popular: boolean;
  features?: string[];
}

interface CoinPackageCardProps {
  pkg: CoinPackage;
  onBuy: (pkg: CoinPackage) => void;
  loading?: boolean;
}

export function CoinPackageCard({ pkg, onBuy, loading }: CoinPackageCardProps) {
  const savings = Math.round(((50 * pkg.coins - pkg.price * 100) / (50 * pkg.coins)) * 100);

  return (
    <div className={`relative bg-white rounded-2xl border-2 ${pkg.popular ? 'border-amber-500 shadow-lg' : 'border-gray-200'} p-6`}>
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Most Popular
        </div>
      )}
      
      <div className="text-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">{pkg.label}</h3>
        <div className="mt-2">
          <span className="text-4xl font-bold text-amber-600">{pkg.coins}</span>
          <span className="text-lg text-gray-500"> coins</span>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {pkg.price} ETB
          <span className="text-sm font-normal text-gray-500"> / one-time</span>
        </p>
        {savings > 0 && (
          <p className="text-xs text-green-600 mt-1">Save {savings}% vs buying individually</p>
        )}
      </div>

      <div className="space-y-2 mb-6">
        {[
          `Apply to ${pkg.coins} gigs`,
          "Instant delivery",
          "Valid for 30 days",
        ].map((feature, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
            <Check className="w-4 h-4 text-green-500" />
            {feature}
          </div>
        ))}
      </div>

      <Button
        onClick={() => onBuy(pkg)}
        disabled={loading}
        className={`w-full ${pkg.popular ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gray-900 hover:bg-gray-800'} text-white`}
        size="lg"
      >
        {loading ? "Processing..." : `Buy ${pkg.coins} Coins for ${pkg.price} ETB`}
      </Button>
    </div>
  );
}
