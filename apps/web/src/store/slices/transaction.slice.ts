import { StateCreator } from 'zustand';
import { Transaction } from '@/types/app.types';
import { api, connectToSimulationStream } from '@/services/api.service';
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
  subscribeToUpdates: () => (() => void);
}

let unsubscribeFromStream: (() => void) | null = null;

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  isLoading: false,
  isFetchingNextPage: false,
  hasMore: true,
  page: 1,
  expandedId: null,
  hoveredChainId: null,
  isWatching: false,

  setExpandedId: (id) => set({ expandedId: id }),
  setHoveredChain: (id) => set({ hoveredChainId: id }),
  
  toggleWatching: () => {
    const isNowWatching = !get().isWatching;
    set({ isWatching: isNowWatching });
    
    if (isNowWatching) {
      // Start listening to SSE updates when monitoring begins
      const unsubscribe = get().subscribeToUpdates();
      unsubscribeFromStream = unsubscribe;
    } else {
      // Stop listening when monitoring pauses
      if (unsubscribeFromStream) {
        unsubscribeFromStream();
        unsubscribeFromStream = null;
      }
    }
  },

  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions] 
  })),

  applyTransactionChanges: async (id) => {
    try {
      // Trigger backend simulation - backend handles the state transitions
      const { data, error } = await api.api.transactions[id].status.patch({
        status: 'APPLYING'
      });

      if (error) throw error;

      // Initial update: transaction is now APPLYING
      if (data) {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? data : t
          )
        }));
      }
      // Note: Further updates (APPLIED) will come via SSE stream
    } catch (err) {
      console.error('Failed to apply transaction', err);
    }
  },

  subscribeToUpdates: () => {
    // Connect to SSE and update transactions when backend pushes updates
    const unsubscribe = connectToSimulationStream((event) => {
      set((state) => ({
        transactions: state.transactions.map((t) => 
          t.id === event.transactionId 
            ? { ...t, status: event.status }
            : t
        )
      }));
    });

    return unsubscribe;
  },

  fetchTransactions: async (params) => {
    set({ isLoading: true, page: 1, hasMore: true });
    try {
      const $query: Record<string, string> = {
        page: '1',
        limit: '15'
      };
      
      if (params?.search) $query.search = params.search;
      if (params?.status) $query.status = params.status;

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