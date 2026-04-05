import { create } from 'zustand';

export interface Transaction {
  id: string;
  type: 'bonus' | 'purchase' | 'spent' | 'earned' | 'refund';
  amount: number;
  description: string;
  date: string;
}

interface WalletState {
  coins: number;
  totalSpent: number;
  totalEarned: number;
  transactions: Transaction[];
  isLoading: boolean;
  
  // Actions
  addCoins: (amount: number, description: string) => void;
  spendCoins: (amount: number, description: string) => boolean;
  addEarnings: (amount: number, description: string) => void;
  setWallet: (coins: number, totalSpent: number, totalEarned: number) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  coins: 5, // Free 5 coins on signup (mock)
  totalSpent: 0,
  totalEarned: 0,
  transactions: [
    {
      id: '1',
      type: 'bonus',
      amount: 5,
      description: 'Welcome bonus - 5 free coins',
      date: new Date().toISOString().split('T')[0],
    },
  ],
  isLoading: false,

  addCoins: (amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'purchase',
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      coins: state.coins + amount,
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  spendCoins: (amount: number, description: string): boolean => {
    const state = get();
    if (state.coins < amount) {
      return false;
    }
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'spent',
      amount: -amount,
      description,
      date: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      coins: state.coins - amount,
      totalSpent: state.totalSpent + amount,
      transactions: [newTransaction, ...state.transactions],
    }));
    return true;
  },

  addEarnings: (amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'earned',
      amount,
      description,
      date: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      totalEarned: state.totalEarned + amount,
      transactions: [newTransaction, ...state.transactions],
    }));
  },

  setWallet: (coins: number, totalSpent: number, totalEarned: number) => {
    set({ coins, totalSpent, totalEarned });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  reset: () => {
    set({
      coins: 5,
      totalSpent: 0,
      totalEarned: 0,
      transactions: [
        {
          id: '1',
          type: 'bonus',
          amount: 5,
          description: 'Welcome bonus - 5 free coins',
          date: new Date().toISOString().split('T')[0],
        },
      ],
    });
  },
}));
