"use client";

import { useState, useEffect, useCallback } from "react";

interface WalletData {
  coin_balance: number;
  total_coins_spent: number;
  total_earned_etb: number;
  created_at?: string;
  updated_at?: string;
}

interface UseWalletReturn {
  wallet: WalletData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/wallet/get');
      const data = await response.json();
      
      if (data.success) {
        setWallet(data.wallet);
      } else {
        setError(data.error || 'Failed to fetch wallet');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { wallet, loading, error, refresh: fetchWallet };
}

export function useWalletBalance() {
  const { wallet, loading, error, refresh } = useWallet();
  return {
    coins: wallet?.coin_balance ?? 0,
    totalSpent: wallet?.total_coins_spent ?? 0,
    totalEarned: wallet?.total_earned_etb ?? 0,
    loading,
    error,
    refresh
  };
}