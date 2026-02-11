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
  addTransaction: (tx: Transaction) => void;
  approveTransaction: (id: string) => void;
}

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  isLoading: false,
  expandedId: null,
  isWatching: false, // Default to false to show the "Start" state

  setExpandedId: (id) => set({ expandedId: id }),
  
  toggleWatching: () => {
    const isNowWatching = !get().isWatching;
    set({ isWatching: isNowWatching });
    
    if (isNowWatching) {
      api.socket.startEmitting();
    } else {
      api.socket.stopEmitting();
    }
  },

  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions] 
  })),

  approveTransaction: (id) => set((state) => ({
    transactions: state.transactions.map((t) => 
      t.id === id 
        ? { ...t, status: 'APPLIED' as const } 
        : t
    )
  })),

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const data = await api.transactions.list();
      set({ transactions: data });
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    set({ isLoading: false });

    // Setup subscription
    api.socket.subscribe((newTx) => {
      if (get().isWatching) {
        get().addTransaction(newTx);
      }
    });
  },
});