import { StateCreator } from 'zustand';
import { AppTab } from '@/types/app.types';
import { RootState } from '../root.store';

export interface UiSlice {
  activeTab: AppTab;
  isCmdOpen: boolean;
  setActiveTab: (tab: AppTab) => void;
  setCmdOpen: (open: boolean) => void;
  toggleCmd: () => void;
}

export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set) => ({
  activeTab: 'dashboard',
  isCmdOpen: false,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCmdOpen: (open) => set({ isCmdOpen: open }),
  toggleCmd: () => set((state) => ({ isCmdOpen: !state.isCmdOpen })),
});