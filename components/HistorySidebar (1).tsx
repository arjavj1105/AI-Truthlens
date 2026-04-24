"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComparisonRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { History, PlusCircle, Loader2, BarChart2, Clock } from "lucide-react";
import { useTruthLensStore, deriveProviderStats } from "@/lib/store";
import { MODEL_META } from "@/lib/scoring";

export function HistorySidebar() {
  const [history, setHistory] = useState<ComparisonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const { analyticsLedger } = useTruthLensStore();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (data.success) setHistory(data.history || []);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [pathname]);

  const knownProviders = ["qwen", "llama", "deepseek", "gemini", "gpt4"] as const;

  return (
    <aside className="flex flex-col h-full bg-background-obsidian border-r border-white/5">
      {/* ── Header ── */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 bg-primary/20 border border-primary/30 rounded flex items-center justify-center">
            <span className="text-primary font-bold text-[10px]">T</span>
          </div>
          <span className="font-display font-bold text-sm text-white tracking-tight">
            AI <span className="text-primary">TRUTHLENS</span>
          </span>
        </div>
        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.2em] pl-7">
          DIAGNOSTIC_LAYER::v2.1
        </p>
      </div>

      {/* ── New Comparison ── */}
      <div className="px-4 py-4 border-b border-white/5">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 py-2.5 px-3 rounded-lg text-xs font-medium transition-all",
            pathname === "/"
              ? "bg-primary/10 border border-primary/20 text-primary"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5 border border-transparent"
          )}
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-mono uppercase tracking-wider text-[10px]">New Comparison</span>
        </Link>
      </div>

      {/* ── Live Analytics ── */}
      {analyticsLedger.length > 0 && (
        <div className="px-4 py-4 border-b border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
            <BarChart2 className="w-3 h-3" /> Session Analytics
          </div>
          <div className="space-y-2">
            {knownProviders.map((p) => {
              const stats = deriveProviderStats(analyticsLedger, p);
              if (!stats) return null;
              const label = MODEL_META[p]?.label ?? p;
              return (
                <div key={p} className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-gray-400 truncate">{label}</span>
                    <span className={cn(
                      "text-[8px] font-mono",
                      stats.successRate >= 80 ? "text-primary" : "text-amber-400"
                    )}>
                      {stats.successRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[8px] font-mono text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-2 h-2" />
                      {stats.avgLatency}ms avg
                    </span>
                    <span>{stats.totalRuns} runs</span>
                  </div>
                  {/* Mini progress bar for success rate */}
                  <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", stats.successRate >= 80 ? "bg-primary" : "bg-amber-400")}
                      style={{ width: `${stats.successRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── History ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
          <History className="w-3 h-3" /> Query Log
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600 px-1 py-2">
            <Loader2 className="w-3 h-3 animate-spin" /> Loading...
          </div>
        ) : history.length === 0 ? (
          <div className="text-[10px] font-mono text-gray-700 px-1 py-2 italic">
            NO_RECORDS_FOUND
          </div>
        ) : (
          <div className="space-y-1">
            {history.slice(0, 30).map((record) => (
              <Link
                key={record.id}
                href={`/history/${record.id}`}
                className={cn(
                  "block py-2.5 px-3 rounded-lg transition-all group",
                  pathname === `/history/${record.id}`
                    ? "bg-primary/10 border border-primary/20"
                    : "border border-transparent hover:border-white/5 hover:bg-white/[0.025]"
                )}
              >
                <div className={cn(
                  "truncate text-[11px] font-body leading-snug transition-colors",
                  pathname === `/history/${record.id}` ? "text-primary" : "text-gray-500 group-hover:text-gray-300"
                )}>
                  {record.question}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[8px] font-mono text-gray-700 uppercase">
                  <span>{record.selectedModels.slice(0, 2).join(" · ")}</span>
                  {record.selectedModels.length > 2 && (
                    <span>+{record.selectedModels.length - 2}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-white/5">
        <div className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">
          TRUTHLENS::MISSION_CONTROL
        </div>
      </div>
    </aside>
  );
}
