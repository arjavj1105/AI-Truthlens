"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComparisonRecord } from "@/lib/types";
import { cn } from "@/lib/utils";
import { History, LayoutTemplate, MoreHorizontal } from "lucide-react";

export function HistorySidebar() {
  const [history, setHistory] = useState<ComparisonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        const data = await res.json();
        if (data.success) {
          setHistory(data.history || []);
        }
      } catch (err) {
        console.error("Failed to load history sidebar", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [pathname]); // Refresh history when navigation changes

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col h-full sticky top-0 max-h-screen overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950 z-10">
        <h1 className="font-bold text-xl flex items-center gap-2 text-gray-900 dark:text-gray-100">
          <LayoutTemplate className="w-6 h-6 text-blue-600" />
          TruthLens
        </h1>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide font-medium">Validation Playground</p>
      </div>

      <div className="p-3">
        <Link 
          href="/" 
          className={cn(
            "flex items-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors",
            pathname === "/" 
              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
          )}
        >
          <div className="w-5 flex justify-center text-lg">+</div>
          New Comparison
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3 flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          History
        </h2>
        
        {loading ? (
          <div className="text-sm text-gray-500 px-3 flex items-center gap-2 py-2">
             <MoreHorizontal className="w-4 h-4 animate-pulse" /> Loading...
          </div>
        ) : history.length === 0 ? (
          <div className="text-sm text-gray-500 px-3 py-2 italic font-medium opacity-70">
            No past queries found.
          </div>
        ) : (
          <div className="space-y-0.5">
            {history.map((record) => (
              <Link
                key={record.id}
                href={`/history/${record.id}`}
                className={cn(
                  "block py-2 px-3 rounded-lg text-sm transition-colors group",
                  pathname === `/history/${record.id}`
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
                )}
              >
                <div className="truncate font-medium group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                  {record.question}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] uppercase font-semibold opacity-70">
                  {record.selectedModels.slice(0, 2).join(', ')}
                  {record.selectedModels.length > 2 && ` +${record.selectedModels.length - 2}`}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
