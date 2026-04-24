"use client";

import { useRef } from "react";
import { CompareForm } from "@/components/CompareForm";
import { ResponseCard } from "@/components/ResponseCard";
import { ModelRanking } from "@/components/ModelRanking";
import VideoBackground from "@/components/VideoBackground";
import { motion, AnimatePresence } from "framer-motion";
import { useTruthLensStore } from "@/lib/store";
import { ComparisonRecord } from "@/lib/types";
import { Activity, ChevronDown } from "lucide-react";

export default function Home() {
  const { currentRecord, setCurrentRecord, appendToLedger } = useTruthLensStore();
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleSuccess(record: ComparisonRecord) {
    setCurrentRecord(record);

    // Append to analytics ledger
    appendToLedger(
      record.responses.map((r) => ({
        provider: r.model,
        latencyMs: r.latencyMs,
        success: r.status === "success",
        timestamp: r.timestamp,
      }))
    );

    // Smooth scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 space-y-24">

        {/* ── Phase 1: Cinematic Hero Entry ── */}
        <section className="flex flex-col items-center justify-center min-h-[72vh] text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-5 max-w-4xl"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-[9px] font-mono text-primary uppercase tracking-[0.25em]">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>Diagnostic Sovereignty Layer v2.1 · All Systems Nominal</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tighter text-white leading-none">
              TRUTH THROUGH
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-300 to-primary/60">
                COMPARISON
              </span>
            </h1>

            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-body leading-relaxed">
              Enterprise-grade Mission Control for LLM validation.
              Zero-blind-trust diagnostics across frontier models — in parallel.
            </p>
          </motion.div>

          {/* ── Command Center Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.35, duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-4xl"
          >
            <div className="glass-card p-0 overflow-hidden border-white/5 relative group">
              {/* Glow edge on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                   style={{ boxShadow: "inset 0 0 40px rgba(94, 210, 156, 0.04)" }} />

              {/* Window chrome */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    {["bg-red-500/30", "bg-amber-500/30", "bg-primary/30"].map((c, i) => (
                      <div key={i} className={`w-2.5 h-2.5 rounded-full border ${c.replace("/30", "/50")}`}
                           style={{ background: c.includes("primary") ? "rgba(94,210,156,0.15)" : undefined }} />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                    TRUTHLENS::COMMAND_CENTER
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-[9px] font-mono text-primary uppercase tracking-widest">
                    SECURE_LINK_ACTIVE
                  </span>
                </div>
              </div>

              <div className="p-8">
                <CompareForm onSuccess={handleSuccess} />
              </div>
            </div>
          </motion.div>

          {/* Scroll hint */}
          {currentRecord && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-1 text-gray-700"
            >
              <span className="text-[9px] font-mono uppercase tracking-widest">Analysis Ready</span>
              <ChevronDown className="w-4 h-4 animate-bounce" />
            </motion.div>
          )}
        </section>

        {/* ── Phase 2: Analysis Matrix ── */}
        <AnimatePresence mode="wait">
          {currentRecord && (
            <motion.section
              key={currentRecord.id}
              ref={resultsRef}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-14"
            >
              {/* Section header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pl-4 border-l-2 border-primary/40">
                <div>
                  <div className="text-[9px] font-mono text-primary uppercase tracking-[0.25em] mb-1">
                    Comparison Output
                  </div>
                  <h2 className="text-4xl font-display font-extrabold text-white tracking-tight">
                    Analysis Matrix
                  </h2>
                </div>
                <div className="flex items-center gap-6 font-mono text-[9px] text-gray-600">
                  <div>
                    <div className="uppercase tracking-widest mb-0.5">QUERY_ID</div>
                    <div className="text-gray-400">{currentRecord.id.slice(0, 12)}...</div>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div>
                    <div className="uppercase tracking-widest mb-0.5">TIMESTAMP</div>
                    <div className="text-gray-400">{new Date(currentRecord.createdAt).toLocaleTimeString()}</div>
                  </div>
                  <div className="w-[1px] h-8 bg-white/10" />
                  <div>
                    <div className="uppercase tracking-widest mb-0.5">MODELS</div>
                    <div className="text-gray-400">{currentRecord.selectedModels.length}</div>
                  </div>
                </div>
              </div>

              {/* Prompt recap */}
              <div className="glass-card border-white/5 px-6 py-5">
                <div className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-2">Input Prompt</div>
                <p className="text-gray-300 font-body text-sm italic leading-relaxed">
                  &quot;{currentRecord.question}&quot;
                </p>
              </div>

              {/* Response cards grid */}
              <div className={`grid gap-6 ${
                currentRecord.responses.length === 1 ? "grid-cols-1 max-w-2xl mx-auto" :
                currentRecord.responses.length === 2 ? "grid-cols-1 lg:grid-cols-2" :
                "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
              }`}>
                {currentRecord.responses.map((response, idx) => (
                  <ResponseCard key={idx} response={response} />
                ))}
              </div>

              {/* Phase 3: Benchmarking Dashboard */}
              <ModelRanking responses={currentRecord.responses} question={currentRecord.question} />
            </motion.section>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
