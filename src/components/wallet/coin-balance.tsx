"use client";

import { useWalletBalance } from "@/hooks/use-wallet";
import { Coins, Loader2 } from "lucide-react";

interface CoinBalanceProps {
  showLabel?: boolean;
}

export function CoinBalance({ showLabel = true }: CoinBalanceProps) {
  const { coins, loading } = useWalletBalance();

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
        <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
      <Coins className="w-4 h-4 text-amber-600" />
      <span className="font-semibold text-amber-700">{coins}</span>
      {showLabel && <span className="text-xs text-amber-600">coins</span>}
    </div>
  );
}