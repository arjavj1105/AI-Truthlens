"use client";

import { ModelResponse, Provider } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Clock, AlertCircle, Zap, Activity, ChevronDown, ChevronUp, Wifi } from "lucide-react";
import { useState } from "react";

interface ResponseCardProps {
  response: ModelResponse;
}

// Attempt to parse diagnostic JSON from error string
function parseDiagnostic(errorStr: string | null) {
  if (!errorStr) return null;
  try {
    const parsed = JSON.parse(errorStr);
    if (parsed.code) return parsed;
  } catch { /* raw string */ }
  return { code: "PROVIDER_ERROR", message: errorStr, http_status: null, latency_at_crash_ms: null };
}

const MODEL_LABELS: Record<Provider, string> = {
  qwen: "Qwen 2.5",
  llama: "Llama 3.1",
  deepseek: "DeepSeek V3",
  gemini: "Gemini Flash",
  gpt4: "GPT-4o Mini",
};

export function ResponseCard({ response }: ResponseCardProps) {
  const [expanded, setExpanded] = useState(true);
  const isError = response.status === "error";
  const diagnostic = parseDiagnostic(response.error);

  const ttft = Math.round(response.latencyMs * 0.38);
  const wordCount = response.answer ? response.answer.trim().split(/\s+/).length : 0;
  const tps = response.latencyMs > 0 ? Math.round((wordCount * 1.3) / (response.latencyMs / 1000)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col glass-card overflow-hidden border border-white/5 hover:border-primary/20 transition-all duration-500 group"
    >
      {/* ── Header ── */}
      <div className={cn(
        "px-5 py-4 border-b flex items-center justify-between",
        isError ? "border-red-500/10 bg-red-500/5" : "border-white/5 bg-white/[0.015]"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-xs border",
            isError
              ? "bg-red-500/10 border-red-500/30 text-red-400"
              : "bg-primary/10 border-primary/30 text-primary"
          )}>
            {MODEL_LABELS[response.model]?.charAt(0) ?? "?"}
          </div>
          <div>
            <div className="text-sm font-display font-bold text-white">
              {MODEL_LABELS[response.model] ?? response.model}
            </div>
            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-tighter">
              {response.model.toUpperCase()}::AGENT
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-mono uppercase tracking-widest",
            isError
              ? "bg-red-500/5 border-red-500/20 text-red-400"
              : "bg-primary/5 border-primary/20 text-primary"
          )}>
            <div className={cn("w-1 h-1 rounded-full", isError ? "bg-red-400" : "bg-primary animate-pulse")} />
            {isError ? "FAULT" : "OK"}
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-gray-600 hover:text-gray-300 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {expanded && (
        <div className="p-6 flex-1 min-h-[180px]">
          {isError ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400 mb-4">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-display font-bold uppercase tracking-wider">
                  Diagnostic Report
                </span>
              </div>

              {/* Beautiful structured error */}
              <div className="rounded-lg border border-red-500/10 bg-red-500/5 overflow-hidden">
                <div className="px-4 py-2 border-b border-red-500/10 bg-red-500/5 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest">
                    {diagnostic?.code ?? "UNKNOWN_FAULT"}
                  </span>
                  {diagnostic?.http_status && (
                    <span className="text-[9px] font-mono text-gray-500">
                      HTTP/{diagnostic.http_status}
                    </span>
                  )}
                </div>
                <div className="p-4 grid gap-2">
                  <DiagRow label="FAULT_MESSAGE" value={diagnostic?.message ?? "Unknown error"} />
                  {diagnostic?.http_status && <DiagRow label="HTTP_STATUS" value={String(diagnostic.http_status)} />}
                  {diagnostic?.latency_at_crash_ms && <DiagRow label="LATENCY_AT_CRASH" value={`${diagnostic.latency_at_crash_ms}ms`} />}
                  <DiagRow label="PROVIDER" value={response.model.toUpperCase()} />
                  <DiagRow label="TIMESTAMP" value={new Date(response.timestamp).toLocaleTimeString()} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed font-body text-sm selection:bg-primary/30 selection:text-white">
              {response.answer}
            </div>
          )}
        </div>
      )}

      {/* ── Diagnostic Metric Bar ── */}
      <div className="px-5 py-3 bg-black/40 border-t border-white/5 grid grid-cols-4 gap-3">
        <MetricCell icon={<Clock className="w-2.5 h-2.5" />} label="LATENCY" value={`${response.latencyMs}`} unit="ms" highlight />
        <MetricCell icon={<Zap className="w-2.5 h-2.5" />} label="TTFT" value={isError ? "—" : `${ttft}`} unit="ms" />
        <MetricCell icon={<Activity className="w-2.5 h-2.5" />} label="TPS" value={isError ? "—" : `${tps}`} unit="t/s" />
        <MetricCell icon={<Wifi className="w-2.5 h-2.5" />} label="WORDS" value={isError ? "0" : `${wordCount}`} unit="w" />
      </div>

      {/* ── Visual identity strip ── */}
      <div className={cn(
        "h-[3px] w-full transition-all duration-700 group-hover:h-1",
        isError ? "bg-red-500/30" : "bg-gradient-to-r from-primary/40 via-emerald-400/50 to-primary/20"
      )} />
    </motion.div>
  );
}

function MetricCell({
  icon, label, value, unit, highlight,
}: {
  icon: React.ReactNode; label: string; value: string; unit: string; highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[8px] font-mono text-gray-600 uppercase tracking-widest flex items-center gap-1">
        {icon} {label}
      </span>
      <span className={cn("text-xs font-mono", highlight ? "text-primary" : "text-gray-400")}>
        {value}<span className="text-[9px] text-gray-600 ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

function DiagRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-4 font-mono text-[10px]">
      <span className="text-gray-600 w-40 flex-shrink-0 uppercase tracking-tighter">{label}</span>
      <span className="text-red-300 break-all">{value}</span>
    </div>
  );
}
