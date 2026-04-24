"use client";

import { ModelResponse, Provider } from "@/lib/types";
import { ModelScore, scoreResponses, MODEL_META } from "@/lib/scoring";
import { Trophy, Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PentagonComparison, ModelPentagonData, COLORS } from "./PentagonChart";

interface ModelRankingProps {
  responses: ModelResponse[];
}

// ─── Compute 5-Pillar Pentagon scores from a ModelResponse ───────────────────

function computePillars(response: ModelResponse, allLatencies: number[]) {
  const isOk = response.status === "success" && !!response.answer;
  const text = response.answer ?? "";

  // 1. Inference Speed (0–10): fastest = 10
  const minLat = Math.min(...allLatencies);
  const maxLat = Math.max(...allLatencies);
  const speedScore = isOk
    ? Math.round(((maxLat - response.latencyMs) / Math.max(maxLat - minLat, 1)) * 8 + 2)
    : 0;

  // 2. Factuality Reliability: heuristic — penalise hedging language
  const hedging = ["i'm not sure", "i don't know", "cannot verify", "may be incorrect", "as an ai"];
  const hedgeCount = hedging.filter((h) => text.toLowerCase().includes(h)).length;
  const factuality = isOk ? Math.max(10 - hedgeCount * 2, 2) : 0;

  // 3. Logical Reasoning: reasoning markers depth
  const markers = ["because", "therefore", "however", "since", "thus", "hence", "although", "given that"];
  const markerHits = markers.filter((m) => text.toLowerCase().includes(m)).length;
  const logic = isOk ? Math.min(2 + markerHits * 1.5, 10) : 0;

  // 4. Token Efficiency: high content per latency ratio
  const wordCount = text.trim().split(/\s+/).length;
  const tokensPerSec = response.latencyMs > 0 ? (wordCount * 1.3) / (response.latencyMs / 1000) : 0;
  const tokenEff = isOk ? Math.min(Math.round(tokensPerSec / 4), 10) : 0;

  // 5. Language Breadth: structure, lists, code blocks
  const hasLists = /\n[-*•]\s/.test(text) || /\n\d+[.)]\s/.test(text);
  const hasCode = /```/.test(text);
  const hasParagraphs = text.split("\n\n").length >= 2;
  const breadth = isOk ? Math.min(2 + (hasLists ? 2 : 0) + (hasCode ? 3 : 0) + (hasParagraphs ? 2 : 0) + Math.min(Math.floor(wordCount / 50), 1), 10) : 0;

  return [
    { label: "Speed", value: speedScore },
    { label: "Factuality", value: Math.round(factuality) },
    { label: "Logic", value: Math.round(logic) },
    { label: "Token Eff.", value: tokenEff },
    { label: "Language", value: breadth },
  ];
}

function ScoreBar({ score, max = 10 }: { score: number; max?: number }) {
  const pct = (score / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-[3px] bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn(
            "h-full rounded-full",
            pct >= 75 ? "bg-primary" : pct >= 50 ? "bg-amber-400" : "bg-red-400"
          )}
        />
      </div>
      <span className="text-[10px] font-mono w-5 text-right text-gray-500">{score}</span>
    </div>
  );
}

export function ModelRanking({ responses }: ModelRankingProps) {
  const scores: ModelScore[] = scoreResponses(responses);
  const allLatencies = responses.filter(r => r.status === "success").map(r => r.latencyMs);

  // Build pentagon data for each model
  const pentagonModels: ModelPentagonData[] = responses.map((r, idx) => ({
    provider: r.model,
    label: MODEL_META[r.model]?.label ?? r.model,
    color: COLORS[idx % COLORS.length],
    pillars: computePillars(r, allLatencies),
  }));

  return (
    <div className="space-y-8">
      {/* ── Reliability Matrix Table ── */}
      <div className="glass-card overflow-hidden border-white/5">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-3">
            <Trophy className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider">
              Reliability Matrix
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-gray-600 uppercase tracking-widest">
            <Activity className="w-3 h-3" />
            NORMALIZED_SIGMA_V2
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-[9px] font-mono uppercase tracking-widest text-gray-600">
                <th className="px-6 py-4 text-left font-normal">Rank</th>
                <th className="px-6 py-4 text-left font-normal">Agent</th>
                <th className="px-6 py-4 text-left font-normal">Context</th>
                <th className="px-6 py-4 text-left font-normal">Logic</th>
                <th className="px-6 py-4 text-left font-normal">Velocity</th>
                <th className="px-6 py-4 text-left font-normal">Cost</th>
                <th className="px-6 py-4 text-left font-normal">Best For</th>
                <th className="px-6 py-4 text-right font-normal">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, idx) => (
                <motion.tr
                  key={s.provider}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={cn(
                    "border-b border-white/[0.04] transition-colors hover:bg-white/[0.015]",
                    s.rank === 1 && "bg-primary/[0.02]"
                  )}
                >
                  <td className="px-6 py-5">
                    <div className={cn(
                      "w-7 h-7 rounded border flex items-center justify-center font-mono text-xs",
                      s.rank === 1 ? "border-primary/40 text-primary bg-primary/10" : "border-white/8 text-gray-600"
                    )}>
                      {s.rank === 1 ? "▲" : `0${s.rank}`}
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: COLORS[idx % COLORS.length] }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{s.label}</div>
                        <div className="text-[9px] font-mono text-gray-600 uppercase">
                          {s.provider}::v1
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <span className="text-[9px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {s.meta.maxContext}
                    </span>
                  </td>

                  <td className="px-6 py-5 min-w-[120px]"><ScoreBar score={s.reasoningScore} /></td>
                  <td className="px-6 py-5 min-w-[120px]"><ScoreBar score={s.speedScore} /></td>

                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[9px] font-mono px-2 py-0.5 rounded border",
                      s.meta.costLevel.includes("Free")
                        ? "bg-primary/5 border-primary/20 text-primary"
                        : "bg-amber-500/5 border-amber-500/20 text-amber-400"
                    )}>
                      {s.meta.costLevel}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="text-[9px] font-mono text-gray-500 max-w-[140px] leading-relaxed">
                      {s.meta.bestFor}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {s.rank === 1 && <Zap className="w-3 h-3 text-primary" />}
                      <span className={cn(
                        "font-mono font-bold text-base",
                        s.overallScore >= 7 ? "text-primary" :
                        s.overallScore >= 4 ? "text-amber-400" : "text-red-400"
                      )}>
                        {s.overallScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 bg-black/30 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-6 text-[8px] font-mono text-gray-700 uppercase">
            <span>Logic Weight: 65%</span>
            <span>•</span>
            <span>Velocity Weight: 35%</span>
          </div>
          <div className="text-[8px] font-mono text-gray-700 italic">HEURISTIC_ENGINE_v2.1</div>
        </div>
      </div>

      {/* ── Pentagon Analytic Engine ── */}
      <PentagonComparison models={pentagonModels} />
    </div>
  );
}
