import { create } from 'zustand';

type DashboardState = {
  metrics: Record<string, unknown>;
  notifications: string[];
  setMetrics: (metrics: Record<string, unknown>) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  metrics: {},
  notifications: [],
  setMetrics: (metrics) => set({ metrics })
}));
