import { StateCreator } from 'zustand';
import { Transaction, TransactionStatus, TransactionFile, FileApplyStatus } from '@/types/app.types';
import { client, connectToSimulationStream, FileStatusEvent, SimulationEvent } from '@/services/api.service';
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
  applyTransactionChanges: (id: string, scenario?: 'fast-success' | 'simulated-failure' | 'long-running' | 'partial-failure') => Promise<void>;
  executeBulkAction: (action: TransactionStatus) => Promise<void>;
  reapplyFile: (transactionId: string, filePath: string) => Promise<void>;
  reapplyAllFailed: (transactionId: string) => Promise<void>;
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
    if (!unsubscribeFromStream) {
      const unsubscribe = get().subscribeToUpdates();
      unsubscribeFromStream = unsubscribe;
      get().fetchTransactions();
    }
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
      const { error } = await client.PATCH('/api/transactions/{id}/status', {
        params: { path: { id } },
        body: { status: 'APPLYING', scenario }
      });

      if (error) throw error;
    } catch (err) {
      console.error('Failed to apply transaction', err);
    }
  },

  executeBulkAction: async (action) => {
    const { selectedIds, clearSelection } = get();
    if (!selectedIds.length) return;

    try {
      const { error } = await client.POST('/api/transactions/bulk', {
        body: { ids: selectedIds, action }
      });

      if (error) throw error;
      clearSelection();
    } catch (err) {
      console.error('Failed to execute bulk action', err);
    }
  },

  reapplyFile: async (transactionId, filePath) => {
    try {
      const { error } = await client.POST('/api/transactions/{id}/files/reapply', {
        params: { path: { id: transactionId } },
        body: { filePath }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to reapply file', err);
    }
  },

  reapplyAllFailed: async (transactionId) => {
    try {
      const { error } = await client.POST('/api/transactions/{id}/reapply-failed', {
        params: { path: { id: transactionId } }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Failed to reapply all failed files', err);
    }
  },

  subscribeToUpdates: () => {
    const handleTransactionEvent = (event: SimulationEvent) => {
      set((state) => ({
        transactions: state.transactions.map((t) => 
          t.id === event.transactionId 
            ? { ...t, status: event.status }
            : t
        )
      }));
    };

    const handleFileEvent = (event: FileStatusEvent) => {
      set((state) => ({
        transactions: state.transactions.map((t) => {
          if (t.id !== event.transactionId) return t;
          
          const updateFileApplyStatus = (files: TransactionFile[]): TransactionFile[] => {
            return files.map(f => 
              f.path === event.filePath 
                ? { ...f, applyStatus: event.applyStatus as FileApplyStatus, errorMessage: event.errorMessage }
                : f
            );
          };

          const updatedBlocks = t.blocks?.map(block => {
            if (block.type === 'file' && block.file?.path === event.filePath) {
              return {
                ...block,
                file: { 
                  ...block.file, 
                  applyStatus: event.applyStatus as FileApplyStatus,
                  errorMessage: event.errorMessage 
                }
              };
            }
            return block;
          });

          return {
            ...t,
            files: updateFileApplyStatus(t.files || []),
            blocks: updatedBlocks
          };
        })
      }));
    };

    const unsubscribe = connectToSimulationStream(
      handleTransactionEvent,
      handleFileEvent,
      (isConnected) => {
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
      const queryParams: Record<string, string | number> = {
        page: 1,
        limit: 15,
      };
      if (params?.search) queryParams.search = params.search;
      if (params?.status) queryParams.status = params.status;

      const { data, error } = await client.GET('/api/transactions', {
        params: { query: queryParams }
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
      const { data, error } = await client.GET('/api/transactions', {
        params: { query: { search: query, limit: 5, page: 1 } }
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
      const { data, error } = await client.GET('/api/transactions', {
        params: { query: { page: nextPage, limit: 15 } }
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
