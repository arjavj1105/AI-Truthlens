"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Send, Loader2, Clock, CheckCircle2, AlertCircle, LayoutGrid, ChevronRight } from "lucide-react";
import { Provider, ComparisonRecord, ModelResponse } from "@/lib/types";
import { cn } from "@/lib/utils";
import CodeNestHeader from "./CodeNestHeader";

const AVAILABLE_MODELS: { id: Provider; label: string; description: string }[] = [
  { id: "qwen", label: "Qwen 2.5 7B", description: "Alibaba's efficient LLM" },
  { id: "llama", label: "Llama 3.1 8B", description: "Meta's open-source model" },
  { id: "deepseek", label: "DeepSeek V3", description: "Powerful reasoning model" },
];

const CodeNestPlayground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [question, setQuestion] = useState("");
  const [selectedModels, setSelectedModels] = useState<Provider[]>(["qwen", "llama"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<ComparisonRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const hlsUrl = "https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8";
    if (video && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(console.error));
      return () => hls.destroy();
    }
  }, []);

  const toggleModel = (id: Provider) => {
    setSelectedModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || selectedModels.length < 2) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, models: selectedModels }),
      });
      const data = await res.json();
      if (data.success) setResults(data.record);
      else throw new Error(data.error);
    } catch (err: any) {
      setError(err.message || "Execution failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#070b0a] text-white font-sans overflow-x-hidden pb-20">
      {/* Background elements */}
      <div className="fixed inset-0 z-0">
        <video ref={videoRef} className="h-full w-full object-cover opacity-20" muted loop playsInline />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b0a] via-transparent to-[#070b0a]" />
        <div className="absolute inset-0 hidden md:block">
          <div className="absolute left-1/4 top-0 h-full w-[1px] bg-white/5" />
          <div className="absolute left-1/2 top-0 h-full w-[1px] bg-white/5" />
          <div className="absolute left-3/4 top-0 h-full w-[1px] bg-white/5" />
        </div>
      </div>

      <CodeNestHeader />

      <main className="relative z-10 pt-32 px-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <span className="font-plus-jakarta font-bold text-[11px] tracking-widest text-[#5ed29c] uppercase flex items-center gap-2 mb-4">
            <LayoutGrid size={14} />
            Validation Playground
          </span>
          <h1 className="text-4xl md:text-5xl font-inter font-extrabold tracking-tight uppercase leading-none">
            AI Model <span className="text-[#5ed29c]">Comparison.</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Input Form */}
          <div className="lg:col-span-5 space-y-8">
            <div 
              className="p-8 rounded-[32px] border border-white/5"
              style={{ background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(12px)" }}
            >
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Your Question</label>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#5ed29c]/50 transition-all min-h-[140px] resize-none placeholder:text-white/20"
                    placeholder="Enter a prompt to compare model responses..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-4">Select Models (Min 2)</label>
                  <div className="grid grid-cols-1 gap-3">
                    {AVAILABLE_MODELS.map((model) => {
                      const isSelected = selectedModels.includes(model.id);
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => toggleModel(model.id)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 text-left",
                            isSelected ? "border-[#5ed29c] bg-[#5ed29c]/10" : "border-white/5 bg-white/5 hover:border-white/20"
                          )}
                        >
                          <div>
                            <p className={cn("text-sm font-semibold", isSelected ? "text-[#5ed29c]" : "text-white")}>{model.label}</p>
                            <p className="text-[10px] text-white/40">{model.description}</p>
                          </div>
                          {isSelected && <div className="w-5 h-5 rounded-full bg-[#5ed29c] flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-[#070b0a]" /></div>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{error}</div>}

                <button
                  type="submit"
                  disabled={isSubmitting || selectedModels.length < 2 || !question.trim()}
                  className="w-full bg-[#5ed29c] text-[#070b0a] font-bold py-4 rounded-full flex items-center justify-center gap-3 uppercase tracking-wider text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Compare Models"}
                  {!isSubmitting && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-7">
            {results ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Analysis Results</h2>
                  <span className="text-[10px] font-mono text-white/40">QUERY ID: {results.id.split('-')[0]}</span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {results.responses.map((resp, idx) => (
                    <div 
                      key={idx}
                      className="rounded-[24px] border border-white/5 overflow-hidden"
                      style={{ background: "rgba(255, 255, 255, 0.02)", backdropFilter: "blur(12px)" }}
                    >
                      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <span className="capitalize font-bold text-[#5ed29c]">{resp.model}</span>
                          <span className="text-[10px] py-0.5 px-2 rounded-full bg-[#5ed29c]/10 text-[#5ed29c] border border-[#5ed29c]/20">SUCCESS</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-white/30 font-mono">
                          <Clock size={12} /> {resp.latencyMs}ms
                        </div>
                      </div>
                      <div className="p-6 text-sm text-white/70 whitespace-pre-wrap leading-relaxed">
                        {resp.answer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center rounded-[40px] border border-dashed border-white/10 opacity-40">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <LayoutGrid className="text-white/20" size={32} />
                </div>
                <h3 className="text-lg font-medium mb-2">Awaiting Comparison</h3>
                <p className="text-sm max-w-xs mx-auto">Select at least two models and enter a question to start generating side-by-side reliability analysis.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CodeNestPlayground;
