import { StateCreator } from 'zustand';
import { Transaction, TransactionStatus, TransactionFile, FileApplyStatus } from '@/types/app.types';
import { client, connectToSimulationStream, FileStatusEvent, SimulationEvent, apiCall } from '@/services/api.service';
import { RootState } from '../root.store';

function updateTransactionFile(
  transaction: Transaction,
  filePath: string,
  updates: { applyStatus: FileApplyStatus; errorMessage?: string | null }
): Transaction {
  const updateFiles = (files: TransactionFile[]): TransactionFile[] =>
    files.map(f => f.path === filePath ? { ...f, ...updates } : f);

  return {
    ...transaction,
    files: updateFiles(transaction.files || []),
    blocks: transaction.blocks?.map(block =>
      block.type === 'file' && block.file?.path === filePath
        ? { ...block, file: { ...block.file, ...updates } }
        : block
    )
  };
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

export interface TransactionSlice {
  transactions: Transaction[];
  selectedIds: string[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasMore: boolean;
  page: number;
  expandedId: string | null;
  hoveredChainId: string | null;
  connectionState: ConnectionState;
  setExpandedId: (id: string | null) => void;
  setHoveredChain: (id: string | null) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  init: () => (() => void);
  fetchTransactions: (params?: { search?: string; status?: string }) => Promise<void>;
  searchTransactions: (query: string) => Promise<Transaction[]>;
  fetchNextPage: () => Promise<void>;
  addTransaction: (tx: Transaction) => void;
  applyTransactionChanges: (id: string) => Promise<void>;
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
  connectionState: 'connecting',

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

  applyTransactionChanges: async (id) => {
    await apiCall(
      client.PATCH('/api/transactions/{id}/status', {
        params: { path: { id } },
        body: { status: 'APPLYING' }
      }),
      (err) => console.error('Failed to apply transaction', err)
    );
  },

  executeBulkAction: async (action) => {
    const { selectedIds, clearSelection } = get();
    if (!selectedIds.length) return;

    const result = await apiCall(
      client.POST('/api/transactions/bulk', {
        body: { ids: selectedIds, action }
      }),
      (err) => console.error('Failed to execute bulk action', err)
    );
    if (result) clearSelection();
  },

  reapplyFile: async (transactionId, filePath) => {
    await apiCall(
      client.POST('/api/transactions/{id}/files/reapply', {
        params: { path: { id: transactionId } },
        body: { filePath }
      }),
      (err) => console.error('Failed to reapply file', err)
    );
  },

  reapplyAllFailed: async (transactionId) => {
    await apiCall(
      client.POST('/api/transactions/{id}/reapply-failed', {
        params: { path: { id: transactionId } }
      }),
      (err) => console.error('Failed to reapply all failed files', err)
    );
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
        transactions: state.transactions.map((t) =>
          t.id === event.transactionId
            ? updateTransactionFile(t, event.filePath, {
                applyStatus: event.applyStatus as FileApplyStatus,
                errorMessage: event.errorMessage
              })
            : t
        )
      }));
    };

    const unsubscribe = connectToSimulationStream(
      handleTransactionEvent,
      handleFileEvent,
      (connectionState) => {
        set({ connectionState });
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
    const queryParams: Record<string, string | number> = {
      page: 1,
      limit: 15,
    };
    if (params?.search) queryParams.search = params.search;
    if (params?.status) queryParams.status = params.status;

    const data = await apiCall(
      client.GET('/api/transactions', {
        params: { query: queryParams }
      }),
      (err) => console.error('Failed to fetch transactions', err)
    );
    
    if (data) {
      set({ transactions: data, hasMore: data.length === 15 });
    }
    set({ isLoading: false });
  },

  searchTransactions: async (query: string) => {
    const data = await apiCall(
      client.GET('/api/transactions', {
        params: { query: { search: query, limit: 5, page: 1 } }
      }),
      (err) => console.error('Failed to search transactions', err)
    );
    return data || [];
  },

  fetchNextPage: async () => {
    const { page, hasMore, isFetchingNextPage, transactions } = get();
    if (!hasMore || isFetchingNextPage) return;

    set({ isFetchingNextPage: true });
    const nextPage = page + 1;
    const data = await apiCall(
      client.GET('/api/transactions', {
        params: { query: { page: nextPage, limit: 15 } }
      }),
      (err) => console.error('Failed to fetch next page', err)
    );

    if (data && data.length > 0) {
      set({ 
        transactions: [...transactions, ...data], 
        page: nextPage,
        hasMore: data.length === 15
      });
    } else {
      set({ hasMore: false });
    }
    set({ isFetchingNextPage: false });
  },
});
