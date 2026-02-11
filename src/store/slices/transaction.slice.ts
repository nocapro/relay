import { StateCreator } from 'zustand';
import { Transaction } from '@/types/app.types';
import { api } from '@/services/api.service';
import { RootState } from '../root.store';

export interface TransactionSlice {
  transactions: Transaction[];
  isLoading: boolean;
  expandedId: string | null;
  isWatching: boolean;
  setExpandedId: (id: string | null) => void;
  toggleWatching: () => void;
  fetchTransactions: () => Promise<void>;
}

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set) => ({
  transactions: [],
  isLoading: false,
  expandedId: 'tx-8f92a1',
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
  },
});