"use client";

import { Provider } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModels: Provider[];
  onChange: (models: Provider[]) => void;
}

const AVAILABLE_MODELS: { id: Provider; label: string; description: string }[] = [
  { id: "openai", label: "OpenAI GPT-4o-mini", description: "Fast, everyday model by OpenAI" },
  { id: "gemini", label: "Google Gemini 1.5 Flash", description: "Google's fast multimodal model" },
  { id: "groq", label: "Groq LLaMA-3.1 8B", description: "Meta's LLaMA via Groq's high-speed inference" },
];

export function ModelSelector({ selectedModels, onChange }: ModelSelectorProps) {
  const toggleModel = (id: Provider) => {
    if (selectedModels.includes(id)) {
      onChange(selectedModels.filter(m => m !== id));
    } else {
      onChange([...selectedModels, id]);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Select Models (Min 2)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          return (
            <button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all duration-200",
                isSelected
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "font-medium",
                  isSelected ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-gray-100"
                )}>
                  {model.label}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {model.description}
              </p>
            </button>
          );
        })}
      </div>
      {selectedModels.length > 0 && selectedModels.length < 2 && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
          Please select at least one more model for comparison.
        </p>
      )}
    </div>
  );
}
