import { StateCreator } from 'zustand';
import { RootState } from '../root.store';

export type SimulationScenario = 'fast-success' | 'simulated-failure' | 'long-running' | 'partial-failure';

const SCENARIO_STORAGE_KEY = 'relay-dev-scenario';

export interface DevSlice {
  activeScenario: SimulationScenario | null;
  isDevToolbarOpen: boolean;
  setScenario: (scenario: SimulationScenario | null) => void;
  toggleDevToolbar: () => void;
  resetMockData: () => Promise<boolean>;
}

const getInitialScenario = (): SimulationScenario | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(SCENARIO_STORAGE_KEY);
  if (stored === 'fast-success' || stored === 'simulated-failure' || stored === 'long-running' || stored === 'partial-failure') {
    return stored;
  }
  return null;
};

export const createDevSlice: StateCreator<RootState, [], [], DevSlice> = (set) => ({
  activeScenario: getInitialScenario(),
  isDevToolbarOpen: false,

  setScenario: (scenario) => {
    if (scenario === null) {
      localStorage.removeItem(SCENARIO_STORAGE_KEY);
    } else {
      localStorage.setItem(SCENARIO_STORAGE_KEY, scenario);
    }
    set({ activeScenario: scenario });
  },

  toggleDevToolbar: () => set((state) => ({ isDevToolbarOpen: !state.isDevToolbarOpen })),

  resetMockData: async () => {
    try {
      const response = await fetch('/api/dev/reset', { method: 'POST' });
      return response.ok;
    } catch (err) {
      console.error('Failed to reset mock data', err);
      return false;
    }
  },
});
