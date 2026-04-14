"use client";

import { useState } from "react";
import { CompareForm } from "@/components/CompareForm";
import { ResponseCard } from "@/components/ResponseCard";
import { ModelRanking } from "@/components/ModelRanking";
import { ComparisonRecord } from "@/lib/types";

export default function Home() {
  const [currentResult, setCurrentResult] = useState<ComparisonRecord | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      <header className="space-y-2 mt-4 mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          AI Model Comparison
        </h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-lg">
          Query multiple frontier models simultaneously. Compare outputs side-by-side to detect hallucinations and evaluate reasoning.
        </p>
      </header>

      <section>
        <CompareForm onSuccess={(record) => setCurrentResult(record)} />
      </section>

      {currentResult && (
        <section className="space-y-6 pt-8 mt-8 border-t border-gray-200 dark:border-gray-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              Results
            </h2>
            <div className="text-xs font-mono text-gray-400">
              ID: {currentResult.id.split('-')[0]}
            </div>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-inner">
            <h3 className="text-xs font-semibold uppercase text-gray-500 mb-2">Prompt</h3>
            <p className="text-gray-800 dark:text-gray-300 italic font-medium">&quot;{currentResult.question}&quot;</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {currentResult.responses.map((response, idx) => (
              <ResponseCard key={idx} response={response} />
            ))}
          </div>

          {/* Model Ranking & Scores */}
          <ModelRanking responses={currentResult.responses} />
        </section>
      )}

    </div>
  );
}
