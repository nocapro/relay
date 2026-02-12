import { create } from 'zustand';
import { createUiSlice, UiSlice } from './slices/ui.slice';
import { createTransactionSlice, TransactionSlice } from './slices/transaction.slice';

export type RootState = UiSlice & TransactionSlice;

export const useStore = create<RootState>()((...a) => ({
  ...createUiSlice(...a),
  ...createTransactionSlice(...a),
}));

// Export specialized selectors for cleaner global usage
export const useUiActions = () => useStore((state) => ({
  setCmdOpen: state.setCmdOpen,
  toggleCmd: state.toggleCmd,
}));

export const useTransactionActions = () => useStore((state) => ({
  setExpandedId: state.setExpandedId,
  toggleWatching: state.toggleWatching,
  fetchTransactions: state.fetchTransactions,
}));
