"use client";

import { Provider } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ModelSelectorProps {
  selectedModels: Provider[];
  onChange: (models: Provider[]) => void;
}

const AVAILABLE_MODELS: { id: Provider; label: string; description: string; provider: string }[] = [
  { id: "qwen", label: "Qwen 2.5 7B", description: "Alibaba's efficient instruction-tuned model", provider: "Hugging Face" },
  { id: "llama", label: "Llama 3.1 8B", description: "Meta's popular open-source instruction model", provider: "Hugging Face" },
  { id: "deepseek", label: "DeepSeek V3", description: "DeepSeek's powerful reasoning model", provider: "Hugging Face" },
  { id: "gemini", label: "Gemini 2.0 Flash", description: "Google's fast and capable multimodal model", provider: "OpenRouter" },
  { id: "gpt4", label: "GPT-4o Mini", description: "OpenAI's efficient small model", provider: "OpenRouter" },
];

export function ModelSelector({ selectedModels, onChange }: ModelSelectorProps) {
  const toggleModel = (id: Provider) => {
    if (selectedModels.includes(id)) {
      onChange(selectedModels.filter(m => m !== id));
    } else {
      onChange([...selectedModels, id]);
    }
  };

  const providers = ["Hugging Face", "OpenRouter"];

  return (
    <div className="space-y-10">
      {providers.map((providerName) => (
        <div key={providerName} className="space-y-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">
              {providerName} AGENTS
            </h3>
            <div className="flex-1 h-[1px] bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_MODELS.filter(m => m.provider === providerName).map((model) => {
              const isSelected = selectedModels.includes(model.id);
              return (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => toggleModel(model.id)}
                  className={cn(
                    "relative group p-4 rounded-xl border transition-all duration-300 overflow-hidden text-left",
                    isSelected
                      ? "border-primary/50 bg-primary/5 neon-glow"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10"
                  )}
                >
                  {/* Laser Scan Animation on Selection */}
                  {isSelected && (
                    <div className="absolute inset-x-0 top-0 h-full pointer-events-none z-0">
                      <div className="laser-line" />
                    </div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className={cn(
                        "text-xs font-display font-bold transition-colors",
                        isSelected ? "text-primary" : "text-gray-400 group-hover:text-gray-200"
                      )}>
                        {model.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-primary"
                        />
                      )}
                    </div>
                    <p className="text-[10px] font-body text-gray-500 leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  {/* Tech Detail Overlay */}
                  <div className="absolute bottom-1 right-1 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-[8px] font-mono uppercase tracking-tighter">PROVIDER::{model.id}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      
      {selectedModels.length > 0 && selectedModels.length < 2 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[10px] font-mono text-amber-500/80 uppercase tracking-widest text-center"
        >
          [WARNING]: Select minimum of 2 agents for delta analysis.
        </motion.p>
      )}
    </div>
  );
}
