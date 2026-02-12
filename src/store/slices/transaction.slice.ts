import { StateCreator } from 'zustand';
import { Transaction, Prompt } from '@/types/app.types';
import { api } from '@/services/api.service';
import { RootState } from '../root.store';

export interface TransactionSlice {
  transactions: Transaction[];
  prompts: Prompt[]; // Store prompts for lookup
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  page: number;
  expandedId: string | null;
  hoveredChainId: string | null;
  isWatching: boolean;
  setExpandedId: (id: string | null) => void;
  setHoveredChain: (id: string | null) => void;
  toggleWatching: () => void;
  fetchTransactions: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  applyTransactionChanges: (id: string) => Promise<void>;
}

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  prompts: [],
  isLoading: false,
  isFetchingNextPage: false,
  hasMore: true,
  page: 1,
  expandedId: null,
  hoveredChainId: null,
  isWatching: false, // Default to false to show the "Start" state

  setExpandedId: (id) => set({ expandedId: id }),
  setHoveredChain: (id) => set({ hoveredChainId: id }),
  
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

  applyTransactionChanges: async (id) => {
    // 1. Transition to APPLYING
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === id ? { ...t, status: 'APPLYING' as const } : t
      )
    }));

    // 2. Simulate disk I/O / worker latency
    await new Promise(resolve => setTimeout(resolve, 1800));

    // 3. Finalize to APPLIED
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === id ? { ...t, status: 'APPLIED' as const } : t
      )
    }));
  },

  fetchTransactions: async () => {
    set({ isLoading: true, page: 1, hasMore: true });
    try {
      // Pass pagination params to API
      const data = await api.transactions.list({ page: 1, limit: 15 });
      const prompts = await api.transactions.prompts.list();
      set({ transactions: data, prompts, hasMore: data.length === 15 });
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    set({ isLoading: false });

    // Setup subscription (once)
    if (!(window as any).__apiSubscribed) {
      api.socket.subscribe((newTx) => {
        if (get().isWatching) {
          get().addTransaction(newTx);
        }
      });
      (window as any).__apiSubscribed = true;
    }
  },

  fetchNextPage: async () => {
    const { page, hasMore, isFetchingNextPage, transactions } = get();
    if (!hasMore || isFetchingNextPage) return;

    set({ isFetchingNextPage: true });
    try {
      const nextPage = page + 1;
      const data = await api.transactions.list({ page: nextPage, limit: 15 });
      
      if (data.length > 0) {
        set({ 
          transactions: [...transactions, ...data], 
          page: nextPage,
          hasMore: data.length === 15
        });
      } else {
        set({ hasMore: false });
      }
    } catch (error) {
      console.error('Failed to fetch next page', error);
    }
    set({ isFetchingNextPage: false });
  },
});