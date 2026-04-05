"use client";

import { useWalletBalance } from "@/hooks/use-wallet";
import { Coins, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export function WalletCard() {
  const { coins, totalSpent, totalEarned, loading } = useWalletBalance();

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-white/80 flex items-center gap-2">
          <Coins className="w-4 h-4" />
          Coin Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold mb-4">{coins} Coins</div>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
            <TrendingDown className="w-4 h-4 text-red-200" />
            <div>
              <p className="text-white/70 text-xs">Spent</p>
              <p className="font-semibold">{totalSpent} ETB</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
            <TrendingUp className="w-4 h-4 text-green-200" />
            <div>
              <p className="text-white/70 text-xs">Earned</p>
              <p className="font-semibold">{totalEarned.toLocaleString()} ETB</p>
            </div>
          </div>
        </div>
        <Link
          href="/freelancer/buy-coins"
          className="w-full block text-center bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Buy More Coins
        </Link>
      </CardContent>
    </Card>
  );
}