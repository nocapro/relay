import { StateCreator } from 'zustand';
import { RootState } from '../root.store';

export interface UiSlice {
  isCmdOpen: boolean;
  setCmdOpen: (open: boolean) => void;
  toggleCmd: () => void;
}

export const createUiSlice: StateCreator<RootState, [], [], UiSlice> = (set) => ({
  isCmdOpen: false,
  setCmdOpen: (open) => set({ isCmdOpen: open }),
  toggleCmd: () => set((state) => ({ isCmdOpen: !state.isCmdOpen })),
});
