import { StateCreator } from 'zustand';
import { Prompt, PromptStatus } from '@/types/app.types';
import { api } from '@/services/api.service';
import { RootState } from '../root.store';

export interface PromptSlice {
  prompts: Prompt[];
  fetchPrompts: () => Promise<void>;
  updatePromptStatus: (id: string, status: PromptStatus) => void;
}

export const createPromptSlice: StateCreator<RootState, [], [], PromptSlice> = (set) => ({
  prompts: [],
  fetchPrompts: async () => {
    try {
      // Eden Treaty: GET /api/prompts
      const { data, error } = await api.api.prompts.get();
      if (error) throw error;
      if (data) set({ prompts: data });
    } catch (error) {
      console.error('Failed to fetch prompts', error);
    }
  },
  updatePromptStatus: (id, status) => set((state) => ({
    prompts: state.prompts.map(p => p.id === id ? { ...p, status } : p)
  })),
});