import { Provider, ModelResponse } from "./types";

/**
 * Static metadata for each model — things that don't change per-request.
 */
export interface ModelMeta {
  provider: Provider;
  label: string;
  maxContext: string;
  costLevel: string;
  bestFor: string;
}

export const MODEL_META: Record<Provider, ModelMeta> = {
  qwen: {
    provider: "qwen",
    label: "Qwen 2.5 7B",
    maxContext: "128K tokens",
    costLevel: "Free (HF)",
    bestFor: "Multilingual tasks & structured output",
  },
  llama: {
    provider: "llama",
    label: "Llama 3.1 8B",
    maxContext: "128K tokens",
    costLevel: "Free (HF)",
    bestFor: "General knowledge & instruction following",
  },
  deepseek: {
    provider: "deepseek",
    label: "DeepSeek V3",
    maxContext: "128K tokens",
    costLevel: "Free (HF)",
    bestFor: "Deep reasoning & code generation",
  },
  gemini: {
    provider: "gemini",
    label: "Gemini 2.0 Flash",
    maxContext: "1M tokens",
    costLevel: "Paid (OR)",
    bestFor: "Multimodal & general advanced reasoning",
  },
  gpt4: {
    provider: "gpt4",
    label: "GPT-4o Mini",
    maxContext: "128K tokens",
    costLevel: "Paid (OR)",
    bestFor: "Fast instruction following & logic",
  },
};

/**
 * Per-output scores computed after each comparison.
 */
export interface ModelScore {
  provider: Provider;
  label: string;
  speedScore: number;        // 0–10
  reasoningScore: number;    // 0–10
  overallScore: number;      // 0–10
  rank: number;              // 1, 2, 3 …
  meta: ModelMeta;
  latencyMs: number;
}

/**
 * Compute a speed score (0–10) relative to the other responses.
 * Fastest model gets 10, others scale proportionally.
 */
function computeSpeedScore(latencyMs: number, allLatencies: number[]): number {
  const minLatency = Math.min(...allLatencies);
  const maxLatency = Math.max(...allLatencies);

  if (maxLatency === minLatency) return 10; // All identical

  // Invert: lower latency → higher score
  const normalised = 1 - (latencyMs - minLatency) / (maxLatency - minLatency);
  return Math.round(normalised * 8 + 2); // Range 2–10
}

/**
 * Heuristic reasoning / quality score (0–10) based on observable
 * properties of the answer text.
 *
 *  • Length & substance   – very short or empty answers score low
 *  • Sentence structure   – presence of full sentences
 *  • Explanation depth    – conjunctions, reasoning markers ("because", "therefore")
 *  • Formatting quality   – use of paragraphs, lists, or code blocks
 */
function computeReasoningScore(response: ModelResponse): number {
  if (response.status === "error" || !response.answer) return 0;

  const text = response.answer.trim();
  let score = 0;

  // 1. Length tiers (max 3 pts)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 100) score += 3;
  else if (wordCount >= 40) score += 2;
  else if (wordCount >= 10) score += 1;

  // 2. Sentence completeness – ends with punctuation (max 1 pt)
  if (/[.!?]$/.test(text)) score += 1;

  // 3. Has multiple sentences (max 1 pt)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  if (sentences.length >= 2) score += 1;

  // 4. Reasoning markers (max 2 pts)
  const reasoningWords = [
    "because", "therefore", "however", "although",
    "since", "thus", "hence", "furthermore",
    "for example", "in addition", "as a result",
  ];
  const lowerText = text.toLowerCase();
  const markerCount = reasoningWords.filter((w) => lowerText.includes(w)).length;
  score += Math.min(markerCount, 2);

  // 5. Structured formatting – lists, paragraphs, code blocks (max 2 pts)
  if (/\n[-*•]\s/.test(text) || /\n\d+[.)]\s/.test(text)) score += 1;   // list
  if (/```/.test(text) || text.split("\n\n").length >= 2) score += 1;     // formatting

  // 6. Not just a single number / trivial answer (penalty)
  if (wordCount <= 3) score = Math.max(score - 1, 1);

  return Math.min(score, 10);
}

/**
 * Score and rank all responses from a single comparison.
 */
export function scoreResponses(responses: ModelResponse[]): ModelScore[] {
  const successResponses = responses.filter((r) => r.status === "success");
  const allLatencies = successResponses.map((r) => r.latencyMs);

  const scored: ModelScore[] = responses.map((r) => {
    const speedScore =
      r.status === "success" ? computeSpeedScore(r.latencyMs, allLatencies) : 0;
    const reasoningScore = computeReasoningScore(r);
    const overallScore =
      r.status === "success"
        ? Math.round(speedScore * 0.35 + reasoningScore * 0.65)
        : 0;

    const meta = MODEL_META[r.model] ?? {
      provider: r.model,
      label: r.model,
      maxContext: "N/A",
      costLevel: "Unknown",
      bestFor: "General use",
    };

    return {
      provider: r.model,
      label: meta.label,
      speedScore,
      reasoningScore,
      overallScore,
      rank: 0, // will be set below
      meta,
      latencyMs: r.latencyMs,
    };
  });

  // Sort by overall score descending, then assign ranks
  scored.sort((a, b) => b.overallScore - a.overallScore);
  scored.forEach((s, i) => {
    s.rank = i + 1;
  });

  return scored;
}
