import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ComparisonRecord, Provider } from "./types";

interface AnalyticsEntry {
  provider: Provider;
  latencyMs: number;
  success: boolean;
  timestamp: string;
}

interface TruthLensStore {
  // Current session
  currentRecord: ComparisonRecord | null;
  setCurrentRecord: (record: ComparisonRecord) => void;
  clearCurrentRecord: () => void;

  // Local analytics ledger (last 50 runs)
  analyticsLedger: AnalyticsEntry[];
  appendToLedger: (entries: AnalyticsEntry[]) => void;

  // UI state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useTruthLensStore = create<TruthLensStore>()(
  persist(
    (set) => ({
      currentRecord: null,
      setCurrentRecord: (record) => set({ currentRecord: record }),
      clearCurrentRecord: () => set({ currentRecord: null }),

      analyticsLedger: [],
      appendToLedger: (entries) =>
        set((state) => ({
          analyticsLedger: [
            ...entries,
            ...state.analyticsLedger,
          ].slice(0, 200), // cap at 200 entries
        })),

      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "truthlens-store",
      partialize: (state) => ({
        analyticsLedger: state.analyticsLedger,
      }),
    }
  )
);

// ─── Derived Selectors ────────────────────────────────────────────────────────

export function deriveProviderStats(ledger: AnalyticsEntry[], provider: Provider) {
  const entries = ledger.filter((e) => e.provider === provider);
  if (entries.length === 0) return null;

  const successes = entries.filter((e) => e.success);
  const latencies = successes.map((e) => e.latencyMs);

  const avgLatency = latencies.length
    ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
    : 0;

  const medianLatency = latencies.length
    ? latencies.sort((a, b) => a - b)[Math.floor(latencies.length / 2)]
    : 0;

  const successRate = Math.round((successes.length / entries.length) * 100);

  // RPM-equivalent: runs in the last 60 seconds (simulated as runs per session)
  const rpm = entries.length;

  return { avgLatency, medianLatency, successRate, rpm, totalRuns: entries.length };
}
