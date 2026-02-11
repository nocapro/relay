import { create } from 'zustand';
import { AppTab } from '@/types';

interface AppState {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  isCmdOpen: boolean;
  setCmdOpen: (open: boolean) => void;
  toggleCmd: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isCmdOpen: false,
  setCmdOpen: (open) => set({ isCmdOpen: open }),
  toggleCmd: () => set((state) => ({ isCmdOpen: !state.isCmdOpen })),
}));