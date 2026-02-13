import { create } from 'zustand';
import { createUiSlice, UiSlice } from './slices/ui.slice';
import { createTransactionSlice, TransactionSlice } from './slices/transaction.slice';
import { createPromptSlice, PromptSlice } from './slices/prompt.slice';

export type RootState = UiSlice & TransactionSlice & PromptSlice;

export const useStore = create<RootState>()((...a) => ({
  ...createUiSlice(...a),
  ...createTransactionSlice(...a),
  ...createPromptSlice(...a),
}));

// Export specialized selectors for cleaner global usage
export const useUiActions = () => useStore((state) => ({
  setCmdOpen: state.setCmdOpen,
  toggleCmd: state.toggleCmd,
}));

export const useTransactionActions = () => useStore((state) => ({
  setExpandedId: state.setExpandedId,
  setHoveredChain: state.setHoveredChain,
  init: state.init,
  fetchTransactions: state.fetchTransactions,
}));
