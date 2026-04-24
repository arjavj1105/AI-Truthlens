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
  relevanceScore: number;    // 0–10
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

// ─── Stop words to ignore when extracting keywords ────────────────────────────

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "shall", "should",
  "may", "might", "must", "can", "could", "need", "dare", "ought",
  "i", "me", "my", "we", "our", "you", "your", "he", "him", "his", "she", "her",
  "it", "its", "they", "them", "their", "this", "that", "these", "those",
  "am", "if", "or", "and", "but", "not", "no", "nor", "so", "very",
  "to", "of", "in", "for", "on", "with", "at", "by", "from", "up", "about",
  "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then", "once",
  "here", "there", "when", "where", "why", "how", "all", "each", "every",
  "both", "few", "more", "most", "other", "some", "such", "only", "own",
  "same", "than", "too", "just", "also", "now", "what", "which", "who",
  "whom", "also", "make", "get", "go", "come", "take",
]);

/**
 * Extract meaningful keywords from a text string.
 * Removes stop words, short tokens, and deduplicates.
 */
function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return [...new Set(words)];
}

/**
 * Extract key noun-phrases / compound concepts from the prompt.
 * E.g. "rag architecture" → ["rag", "architecture", "rag architecture"]
 */
function extractPromptPhrases(prompt: string): string[] {
  const lower = prompt.toLowerCase().replace(/[^\w\s-]/g, " ");
  const words = extractKeywords(prompt);

  // Also extract bigrams for compound concepts like "rag architecture"
  const tokens = lower.split(/\s+/).filter((w) => w.length > 1);
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    if (!STOP_WORDS.has(tokens[i]) || !STOP_WORDS.has(tokens[i + 1])) {
      bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
  }

  return [...words, ...bigrams];
}

/**
 * Compute relevance score (0–10) by measuring how well the answer
 * addresses the user's actual question.
 *
 * Uses multi-signal approach:
 *  1. Keyword overlap – what % of prompt keywords appear in the answer
 *  2. Semantic topic coherence – do the answer's top terms match the prompt domain
 *  3. Cross-model consensus – answers that agree with the majority are more likely relevant
 */
function computeRelevanceScore(
  response: ModelResponse,
  prompt: string,
  allAnswers: string[]
): number {
  if (response.status === "error" || !response.answer) return 0;

  const answerLower = response.answer.toLowerCase();
  const promptKeywords = extractPromptPhrases(prompt);

  if (promptKeywords.length === 0) return 7; // can't evaluate, give neutral score

  // ── Signal 1: Direct keyword overlap (max 4 pts) ──
  const matchedKeywords = promptKeywords.filter((kw) => answerLower.includes(kw));
  const keywordOverlap = matchedKeywords.length / promptKeywords.length;
  const keywordScore = Math.round(keywordOverlap * 4);

  // ── Signal 2: Topic coherence — answer keywords vs prompt domain (max 3 pts) ──
  // Extract top-frequency words from the answer and see if they relate to the prompt
  const answerKeywords = extractKeywords(response.answer);
  // Count how many of the answer's unique keywords are also in the prompt keyword set
  const promptKeywordSet = new Set(promptKeywords);
  const topicOverlap = answerKeywords.filter((aw) =>
    promptKeywordSet.has(aw) ||
    [...promptKeywordSet].some((pk) => pk.includes(aw) || aw.includes(pk))
  ).length;
  const topicRatio = answerKeywords.length > 0 ? topicOverlap / Math.min(answerKeywords.length, 20) : 0;
  const topicScore = Math.round(Math.min(topicRatio * 6, 3));

  // ── Signal 3: Cross-model consensus (max 3 pts) ──
  // If other models' answers share significant vocabulary with each other but NOT with this one,
  // this answer is likely off-topic
  const otherAnswers = allAnswers.filter((a) => a !== response.answer && a.length > 0);
  let consensusScore = 3; // default: neutral if no comparison possible

  if (otherAnswers.length >= 1) {
    // Extract shared vocabulary across other answers
    const otherKeywordSets = otherAnswers.map((a) => new Set(extractKeywords(a)));
    // Find terms that appear in at least half of the other answers (consensus terms)
    const allOtherTerms = new Set(otherKeywordSets.flatMap((s) => [...s]));
    const consensusTerms = [...allOtherTerms].filter((term) => {
      const appearsIn = otherKeywordSets.filter((s) => s.has(term)).length;
      return appearsIn >= Math.max(1, Math.ceil(otherKeywordSets.length / 2));
    });

    if (consensusTerms.length >= 3) {
      // How many consensus terms appear in this answer?
      const thisHasConsensus = consensusTerms.filter((t) => answerLower.includes(t)).length;
      const consensusRatio = thisHasConsensus / consensusTerms.length;
      consensusScore = Math.round(consensusRatio * 3);
    }
  }

  return Math.min(keywordScore + topicScore + consensusScore, 10);
}

/**
 * Score and rank all responses from a single comparison.
 * Now accepts the original prompt for relevance scoring.
 *
 * Overall formula:
 *  25% Speed + 35% Reasoning Quality + 40% Relevance
 */
export function scoreResponses(responses: ModelResponse[], prompt?: string): ModelScore[] {
  const successResponses = responses.filter((r) => r.status === "success");
  const allLatencies = successResponses.map((r) => r.latencyMs);
  const allAnswers = successResponses.map((r) => r.answer);
  const questionText = prompt ?? "";

  const scored: ModelScore[] = responses.map((r) => {
    const speedScore =
      r.status === "success" ? computeSpeedScore(r.latencyMs, allLatencies) : 0;
    const reasoningScore = computeReasoningScore(r);
    const relevanceScore = computeRelevanceScore(r, questionText, allAnswers);

    // Weighted composite: Speed 25%, Reasoning 35%, Relevance 40%
    const overallScore =
      r.status === "success"
        ? parseFloat((speedScore * 0.25 + reasoningScore * 0.35 + relevanceScore * 0.40).toFixed(1))
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
      relevanceScore,
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
