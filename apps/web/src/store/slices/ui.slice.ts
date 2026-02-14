import { StateCreator } from 'zustand';
import { RootState } from '../root.store';

const SIDEBAR_STORAGE_KEY = 'relay-sidebar-collapsed';

export interface UiSlice {
  isCmdOpen: boolean;
  isSidebarCollapsed: boolean;
  hiddenReasoningIds: string[];
  setCmdOpen: (open: boolean) => void;
  toggleCmd: () => void;
  toggleSidebar: () => void;
  toggleReasoning: (id: string) => void;
}

const getInitialSidebarState = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
};

export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set, get) => ({
  isCmdOpen: false,
  isSidebarCollapsed: getInitialSidebarState(),
  hiddenReasoningIds: [],
  setCmdOpen: (open) => set({ isCmdOpen: open }),
  toggleCmd: () => set((state) => ({ isCmdOpen: !state.isCmdOpen })),
  toggleSidebar: () => {
    const newState = !get().isSidebarCollapsed;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
    set({ isSidebarCollapsed: newState });
  },
  toggleReasoning: (id) => set((state) => ({
    hiddenReasoningIds: state.hiddenReasoningIds.includes(id)
      ? state.hiddenReasoningIds.filter(i => i !== id)
      : [...state.hiddenReasoningIds, id]
  })),
});
