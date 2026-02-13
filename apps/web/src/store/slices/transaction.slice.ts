import { StateCreator } from 'zustand';
import { Transaction, TransactionStatus } from '@/types/app.types';
import { api, connectToSimulationStream } from '@/services/api.service';
import { RootState } from '../root.store';

export interface TransactionSlice {
  transactions: Transaction[];
  selectedIds: string[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  page: number;
  expandedId: string | null;
  hoveredChainId: string | null;
  isConnected: boolean;
  setExpandedId: (id: string | null) => void;
  setHoveredChain: (id: string | null) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  init: () => (() => void);
  fetchTransactions: (params?: { search?: string; status?: string }) => Promise<void>;
  searchTransactions: (query: string) => Promise<Transaction[]>;
  fetchNextPage: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  applyTransactionChanges: (id: string, scenario?: 'fast-success' | 'simulated-failure' | 'long-running') => Promise<void>;
  executeBulkAction: (action: TransactionStatus) => Promise<void>;
  subscribeToUpdates: () => (() => void);
}

let unsubscribeFromStream: (() => void) | null = null;

export const createTransactionSlice: StateCreator<RootState, [], [], TransactionSlice> = (set, get) => ({
  transactions: [],
  selectedIds: [],
  isLoading: false,
  isFetchingNextPage: false,
  hasMore: true,
  page: 1,
  expandedId: null,
  hoveredChainId: null,
  isConnected: false,

  setExpandedId: (id) => set({ expandedId: id }),
  setHoveredChain: (id) => set({ hoveredChainId: id }),

  toggleSelection: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(pid => pid !== id)
      : [...state.selectedIds, id]
  })),

  clearSelection: () => set({ selectedIds: [] }),
  
  init: () => {
    // Initialize SSE connection on app load (idempotent)
    if (!unsubscribeFromStream) {
      const unsubscribe = get().subscribeToUpdates();
      unsubscribeFromStream = unsubscribe;
      
      // Also fetch initial data immediately
      get().fetchTransactions();
    }
    // Return cleanup function for root unmount
    return () => {
      if (unsubscribeFromStream) {
        unsubscribeFromStream();
        unsubscribeFromStream = null;
      }
    };
  },

  addTransaction: (tx) => set((state) => ({ 
    transactions: [tx, ...state.transactions] 
  })),

  applyTransactionChanges: async (id, scenario) => {
    try {
      // Trigger backend simulation - rely exclusively on SSE to update local state
      // This prevents race conditions between PATCH response and SSE events
      const { error } = await api.api.transactions[id].status.patch({
        status: 'APPLYING',
        scenario
      });

      if (error) throw error;
      // State updates (APPLYING -> APPLIED/FAILED) will arrive via SSE stream
    } catch (err) {
      console.error('Failed to apply transaction', err);
    }
  },

  executeBulkAction: async (action) => {
    const { selectedIds, clearSelection } = get();
    if (!selectedIds.length) return;

    try {
      const { error } = await api.api.transactions.bulk.post({
        ids: selectedIds,
        action
      });

      if (error) throw error;
      clearSelection();
    } catch (err) {
      console.error('Failed to execute bulk action', err);
    }
  },

  subscribeToUpdates: () => {
    // Connect to SSE and update transactions when backend pushes updates
    const unsubscribe = connectToSimulationStream(
      (event) => {
        // Merge incoming event data into existing transaction list
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === event.transactionId 
              ? { ...t, status: event.status }
              : t
          )
        }));
      },
      (isConnected) => {
        // Track connection state for UI feedback
        set({ isConnected });
      },
      (_error, isNetworkError) => {
        if (isNetworkError) {
          console.error('Network connection lost, attempting to reconnect...');
        } else {
          console.warn('SSE server timeout or error');
        }
      }
    );

    return unsubscribe;
  },

  fetchTransactions: async (params) => {
    set({ isLoading: true, page: 1, hasMore: true });
    try {
      const { data, error } = await api.api.transactions.get({
        $query: {
          page: 1,
          limit: 15,
          ...(params?.search && { search: params.search }),
          ...(params?.status && { status: params.status })
        }
      });
      
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
        $query: { search: query, limit: 5, page: 1 }
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
        $query: { page: nextPage, limit: 15 }
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