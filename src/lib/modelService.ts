import { ModelResponse, Provider } from "./types";

const TIMEOUT_MS = 45000;
const MAX_RETRIES = 3;
const HF_BASE_URL = "https://router.huggingface.co/v1/chat/completions";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Model IDs mapped to each provider */
const MODEL_MAP: Record<Provider, string> = {
  qwen: "Qwen/Qwen2.5-7B-Instruct",
  llama: "meta-llama/Llama-3.1-8B-Instruct",
  deepseek: "deepseek-ai/DeepSeek-V3",
  gemini: "google/gemini-2.0-flash-001",
  gpt4: "openai/gpt-4o-mini",
};

/** Providers routed through OpenRouter */
const OPENROUTER_PROVIDERS = new Set<Provider>(["gemini", "gpt4"]);

// ─── Fetch with Timeout ───────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

// ─── Exponential Backoff with Circuit Breaker ─────────────────────────────────

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = MAX_RETRIES,
  backoffMs = 800
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url, options);

      // 429 Rate Limited — retryable with backoff
      if (res.status === 429 && attempt < retries) {
        const retryAfter = res.headers.get("retry-after");
        const waitMs = retryAfter
          ? Math.min(parseInt(retryAfter, 10) * 1000, 10000)
          : backoffMs * Math.pow(2, attempt + 1);
        console.warn(`[${attempt + 1}/${retries}] 429 rate-limited, retrying in ${waitMs}ms…`);
        await sleep(waitMs);
        continue;
      }

      // Circuit break on other 4xx (client errors) — no point retrying
      if (res.status >= 400 && res.status < 500) return res;

      // Retry on 5xx (server errors)
      if (res.status >= 500 && attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await sleep(backoffMs * Math.pow(2, attempt));
      }
    }
  }

  throw lastError;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Error Diagnostics Builder ────────────────────────────────────────────────

function buildDiagnosticError(
  error: unknown,
  provider: Provider,
  startMs: number,
  httpStatus?: number
): ModelResponse {
  const isTimeout = error instanceof Error && error.name === "AbortError";
  const rawMsg = error instanceof Error ? error.message : String(error);

  const diagnosticJson = JSON.stringify({
    code: isTimeout ? "TIMEOUT" : httpStatus ? `HTTP_${httpStatus}` : "PROVIDER_ERROR",
    http_status: httpStatus ?? null,
    message: rawMsg,
    latency_at_crash_ms: Date.now() - startMs,
    provider,
    timestamp: new Date().toISOString(),
  });

  return {
    model: provider,
    answer: "",
    status: "error",
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startMs,
    error: diagnosticJson,
  };
}

// ─── Hugging Face Caller ──────────────────────────────────────────────────────

async function callHuggingFace(
  modelId: string,
  provider: Provider,
  prompt: string
): Promise<ModelResponse> {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  const apiKey = process.env.HF_TOKEN;
  if (!apiKey) {
    return buildDiagnosticError(new Error("HF_TOKEN env var is not set."), provider, start);
  }

  let httpStatus: number | undefined;
  try {
    const res = await fetchWithRetry(HF_BASE_URL, {
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

    httpStatus = res.status;
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errorText = await res.text();
      return buildDiagnosticError(
        new Error(`Provider returned: ${errorText}`),
        provider,
        start,
        res.status
      );
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? "No response content.";

    return { model: provider, answer: answer.trim(), status: "success", timestamp, latencyMs, error: null };
  } catch (error) {
    return buildDiagnosticError(error, provider, start, httpStatus);
  }
}

// ─── OpenRouter Caller ────────────────────────────────────────────────────────

async function callOpenRouter(
  modelId: string,
  provider: Provider,
  prompt: string
): Promise<ModelResponse> {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return buildDiagnosticError(new Error("OPENROUTER_API_KEY env var is not set."), provider, start);
  }

  let httpStatus: number | undefined;
  try {
    const res = await fetchWithRetry(OPENROUTER_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://truthlens.ai",
        "X-Title": "AI TruthLens",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    httpStatus = res.status;
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const errorText = await res.text();
      return buildDiagnosticError(
        new Error(`Provider returned: ${errorText}`),
        provider,
        start,
        res.status
      );
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content ?? "No response content.";

    return { model: provider, answer: answer.trim(), status: "success", timestamp, latencyMs, error: null };
  } catch (error) {
    return buildDiagnosticError(error, provider, start, httpStatus);
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function compareModels(
  prompt: string,
  providers: Provider[]
): Promise<ModelResponse[]> {
  return Promise.all(
    providers.map((p) => {
      const modelId = MODEL_MAP[p];
      return OPENROUTER_PROVIDERS.has(p)
        ? callOpenRouter(modelId, p, prompt)
        : callHuggingFace(modelId, p, prompt);
    })
  );
}
