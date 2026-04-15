"use client";

import { useState } from "react";
import { Provider, ComparisonRecord } from "@/lib/types";
import { ModelSelector } from "./ModelSelector";
import { Send, Loader2 } from "lucide-react";

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
      // Optional: Clear question after successful send? Or keep context. Let's keep context for now.
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
      
      <div>
        <label htmlFor="question" className="block text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2">
          Your Question
        </label>
        <textarea
          id="question"
          rows={4}
          className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none shadow-inner"
          placeholder="e.g. Can you explain the difference between a process and a thread?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <ModelSelector
        selectedModels={selectedModels}
        onChange={setSelectedModels}
      />

      {error && (
        <div className="text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/10 p-3 rounded-lg border border-red-200 dark:border-red-900/30">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || selectedModels.length < 2 || !question.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-sm disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running Query...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Compare Models
            </>
          )}
        </button>
      </div>

    </form>
  );
}
