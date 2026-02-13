import { StateCreator } from 'zustand';
import { Transaction } from '@/types/app.types';
import { api } from '@/services/api.service';
import { RootState } from '../root.store';

export interface TransactionSlice {
  transactions: Transaction[];
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
  fetchTransactions: (params?: { search?: string; status?: string }) => Promise<void>;
  searchTransactions: (query: string) => Promise<Transaction[]>;
  fetchNextPage: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  applyTransactionChanges: (id: string) => Promise<void>;
}

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
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
    // Real websocket implementation would go here
  },

  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions] 
  })),

  applyTransactionChanges: async (id) => {
    // 1. Optimistic Update: Transition to APPLYING
    set((state) => ({
      transactions: state.transactions.map((t) => 
        t.id === id ? { ...t, status: 'APPLYING' as const } : t
      )
    }));

    try {
      // 2. Call API (backend handles latency simulation)
      const { data, error } = await api.api.transactions[id].status.patch({
        status: 'APPLIED'
      });

      if (error) throw error;

      // 3. Finalize with server response
      if (data) {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? data : t
          )
        }));
      }
    } catch (err) {
      console.error('Failed to apply transaction', err);
      // Revert on error
      set((state) => ({
        transactions: state.transactions.map((t) => 
          t.id === id ? { ...t, status: 'PENDING' as const } : t
        )
      }));
    }
  },

  fetchTransactions: async (params) => {
    set({ isLoading: true, page: 1, hasMore: true });
    try {
      // Build query object carefully to avoid sending "undefined" as a string
      const $query: Record<string, string> = {
        page: '1',
        limit: '15'
      };
      
      if (params?.search) $query.search = params.search;
      if (params?.status) $query.status = params.status;

      // Eden Treaty: GET /api/transactions
      const { data, error } = await api.api.transactions.get({ $query });
      
      if (error) throw error;

      if (data) {
        set({ transactions: data, hasMore: data.length === 15 });
      }
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    }
    set({ isLoading: false });
  },

  searchTransactions: async (query: string) => {
    try {
      const { data, error } = await api.api.transactions.get({
        $query: { search: query, limit: '5' }
      });
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to search transactions', error);
      return [];
    }
  },

  fetchNextPage: async () => {
    const { page, hasMore, isFetchingNextPage, transactions } = get();
    if (!hasMore || isFetchingNextPage) return;

    set({ isFetchingNextPage: true });
    try {
      const nextPage = page + 1;
      const { data, error } = await api.api.transactions.get({
        $query: { page: nextPage.toString(), limit: '15' }
      });
      
      if (error) throw error;

      if (data && data.length > 0) {
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