"use client";

import { useState } from "react";
import { Provider, ComparisonRecord } from "@/lib/types";
import { ModelSelector } from "./ModelSelector";
import { Send, Loader2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompareFormProps {
  onSuccess: (record: ComparisonRecord) => void;
}

export function CompareForm({ onSuccess }: CompareFormProps) {
  const [question, setQuestion] = useState("");
  const [selectedModels, setSelectedModels] = useState<Provider[]>(["qwen", "llama"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    if (selectedModels.length < 2) {
      setError("Please select at least 2 models.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, models: selectedModels })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to compare models.");
      }

      onSuccess(data.record);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      
      <div className="relative group">
        <div className="flex items-center justify-between mb-3 px-1">
          <label htmlFor="question" className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1 h-1 bg-primary rounded-full" />
            Input Prompt
          </label>
          <span className="text-[10px] font-mono text-gray-600">UTF-8 ENCODING</span>
        </div>
        
        <div className="relative">
          <textarea
            id="question"
            rows={4}
            className={cn(
              "w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 text-gray-200 placeholder:text-gray-700 focus:outline-none transition-all resize-none font-body",
              "group-hover:border-white/10"
            )}
            placeholder="System awaiting query parameters..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isSubmitting}
          />
          {/* Pulsing Active Border */}
          <div className={cn(
            "absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-500 rounded-full",
            question.length > 0 ? "w-full opacity-100 neon-glow" : "w-0 opacity-0"
          )} />
        </div>
      </div>

      <ModelSelector
        selectedModels={selectedModels}
        onChange={setSelectedModels}
      />

      {error && (
        <div className="text-red-400 text-xs font-mono bg-red-500/5 p-4 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-1">
          <span className="text-red-500 mr-2">[ERROR]:</span> {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <div className="hidden sm:flex items-center space-x-6 text-[10px] font-mono text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            MODELS_LOADED: {selectedModels.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            EST_LATENCY: ~1.2s
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || selectedModels.length < 2 || !question.trim()}
          className={cn(
            "relative group flex items-center gap-3 bg-primary text-background-obsidian px-8 py-4 rounded-xl font-display font-bold uppercase text-xs tracking-widest transition-all",
            "hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 disabled:cursor-not-allowed",
            "overflow-hidden"
          )}
        >
          {/* Data Pulse Ripple Effect */}
          <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
          
          <span className="relative z-10 flex items-center gap-3">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                Initialize Comparison
              </>
            )}
          </span>
        </button>
      </div>

    </form>
  );
}
