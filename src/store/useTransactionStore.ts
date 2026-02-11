import { create } from 'zustand';
import { Transaction } from '@/types';
import { api } from '@/services/api';

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  expandedId: string | null;
  isWatching: boolean;
  
  // Actions
  setExpandedId: (id: string | null) => void;
  toggleWatching: () => void;
  fetchTransactions: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,
  expandedId: 'tx-8f92a1', // Default open
  isWatching: true,

  setExpandedId: (id) => set({ expandedId: id }),
  
  toggleWatching: () => set((state) => ({ isWatching: !state.isWatching })),

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const data = await api.transactions.list();
      set({ transactions: data });
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      set({ isLoading: false });
    }
  }
}));