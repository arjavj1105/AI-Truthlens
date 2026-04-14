export type Provider = "openai" | "gemini" | "groq";

export interface ModelResponse {
  model: Provider;
  answer: string;
  status: "success" | "error";
  timestamp: string; // ISO string
  latencyMs: number;
  error: string | null;
}

export interface ComparisonRecord {
  id: string;
  question: string;
  selectedModels: Provider[];
  responses: ModelResponse[];
  createdAt: string; // ISO timestamp
}

export interface ComparePayload {
  question: string;
  models: Provider[];
}
