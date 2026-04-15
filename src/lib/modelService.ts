import { ModelResponse, Provider } from "./types";

const TIMEOUT_MS = 30000;
const HF_BASE_URL = "https://router.huggingface.co/v1/chat/completions";

/** Model IDs mapped to each provider */
const MODEL_MAP: Record<Provider, string> = {
  qwen: "Qwen/Qwen2.5-7B-Instruct",
  llama: "meta-llama/Llama-3.1-8B-Instruct",
  deepseek: "deepseek-ai/DeepSeek-V3",
};

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Call a model via the Hugging Face Router (OpenAI-compatible chat completions endpoint).
 */
async function callHuggingFace(
  modelId: string,
  provider: Provider,
  prompt: string
): Promise<ModelResponse> {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  try {
    const apiKey = process.env.HF_TOKEN;
    if (!apiKey) {
      throw new Error("HF_TOKEN is missing. Please add it to your .env file.");
    }

    const res = await fetchWithTimeout(HF_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 512,
      }),
    });

    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HF API error (${res.status}): ${errorText}`);
    }

    // OpenAI-compatible response shape
    const data = await res.json();
    const answer =
      data.choices?.[0]?.message?.content ?? "No response content.";

    return {
      model: provider,
      answer: answer.trim(),
      status: "success",
      timestamp,
      latencyMs,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const isTimeout =
      error instanceof Error && error.name === "AbortError";

    return {
      model: provider,
      answer: "",
      status: "error",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: isTimeout ? "Timeout exceeded" : errorMessage,
    };
  }
}

/**
 * Compare a prompt across selected models in parallel.
 */
export async function compareModels(
  prompt: string,
  providers: Provider[]
): Promise<ModelResponse[]> {
  const promises = providers.map((p) =>
    callHuggingFace(MODEL_MAP[p], p, prompt)
  );

  return Promise.all(promises);
}
