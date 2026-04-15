"use client";

import { ModelResponse } from "@/lib/types";
import { ModelScore, scoreResponses } from "@/lib/scoring";
import { Trophy, Zap, Brain, Layers, DollarSign, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelRankingProps {
  responses: ModelResponse[];
}

function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const percentage = (score / max) * 100;
  const color =
    percentage >= 75
      ? "bg-emerald-500"
      : percentage >= 50
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-700", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 dark:text-gray-300 w-5 text-right tabular-nums">
        {score}
      </span>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const styles: Record<number, string> = {
    1: "bg-amber-400/20 text-amber-600 dark:text-amber-400 border-amber-400/40",
    2: "bg-gray-300/20 text-gray-500 dark:text-gray-400 border-gray-400/40",
    3: "bg-orange-300/20 text-orange-600 dark:text-orange-400 border-orange-400/40",
  };

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm border-2",
        styles[rank] ?? "bg-gray-100 text-gray-400 border-gray-300"
      )}
    >
      {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
    </div>
  );
}

export function ModelRanking({ responses }: ModelRankingProps) {
  const scores: ModelScore[] = scoreResponses(responses);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-amber-500" />
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          Model Ranking &amp; Scores
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <th className="px-4 py-3 text-left font-semibold">Rank</th>
              <th className="px-4 py-3 text-left font-semibold">Model</th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Layers className="w-3 h-3" /> Context
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Brain className="w-3 h-3" /> Reasoning
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" /> Speed
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="w-3 h-3" /> Cost
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" /> Best For
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold">Overall</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr
                key={s.provider}
                className={cn(
                  "border-b border-gray-50 dark:border-gray-800/50 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30",
                  s.rank === 1 &&
                    "bg-amber-50/30 dark:bg-amber-900/10"
                )}
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <RankBadge rank={s.rank} />
                </td>

                {/* Model Name + Latency */}
                <td className="px-4 py-4">
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {s.label}
                  </div>
                  <div className="text-xs text-gray-400 font-mono mt-0.5">
                    {s.latencyMs}ms
                  </div>
                </td>

                {/* Max Context */}
                <td className="px-4 py-4 text-center">
                  <span className="text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md">
                    {s.meta.maxContext}
                  </span>
                </td>

                {/* Reasoning Score */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <ScoreBar score={s.reasoningScore} />
                  </div>
                </td>

                {/* Speed Score */}
                <td className="px-4 py-4">
                  <div className="flex justify-center">
                    <ScoreBar score={s.speedScore} />
                  </div>
                </td>

                {/* Cost Level */}
                <td className="px-4 py-4 text-center">
                  <span className="text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md">
                    {s.meta.costLevel}
                  </span>
                </td>

                {/* Best For */}
                <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-400 max-w-[180px]">
                  {s.meta.bestFor}
                </td>

                {/* Overall */}
                <td className="px-4 py-4 text-center">
                  <div
                    className={cn(
                      "inline-flex items-center justify-center w-10 h-10 rounded-xl font-extrabold text-lg",
                      s.overallScore >= 7
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : s.overallScore >= 4
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    )}
                  >
                    {s.overallScore}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Legend */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-xs text-gray-400 dark:text-gray-500 flex flex-wrap gap-4">
        <span>Reasoning: heuristic quality analysis (depth, structure, clarity)</span>
        <span>•</span>
        <span>Speed: relative latency ranking</span>
        <span>•</span>
        <span>Overall = 65% Reasoning + 35% Speed</span>
      </div>
    </div>
  );
}
