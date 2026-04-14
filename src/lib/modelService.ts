import { ModelResponse, Provider } from "./types";

const TIMEOUT_MS = 15000;

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

async function callOpenAI(prompt: string): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const res = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const latencyMs = Date.now() - start;
    const timestamp = new Date().toISOString();

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OpenAI API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return {
      model: "openai",
      answer: data.choices?.[0]?.message?.content || "No response content.",
      status: "success",
      timestamp,
      latencyMs,
      error: null
    };

  } catch (error: any) {
    return {
      model: "openai",
      answer: "",
      status: "error",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: error.name === 'AbortError' ? 'Timeout exceeded' : error.message
    };
  }
}

async function callGemini(prompt: string): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const res = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    const latencyMs = Date.now() - start;
    const timestamp = new Date().toISOString();

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response content.";
    
    return {
      model: "gemini",
      answer,
      status: "success",
      timestamp,
      latencyMs,
      error: null
    };

  } catch (error: any) {
    return {
      model: "gemini",
      answer: "",
      status: "error",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: error.name === 'AbortError' ? 'Timeout exceeded' : error.message
    };
  }
}

async function callGroq(prompt: string): Promise<ModelResponse> {
  const start = Date.now();
  try {
    const res = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const latencyMs = Date.now() - start;
    const timestamp = new Date().toISOString();

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq API error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return {
      model: "groq",
      answer: data.choices?.[0]?.message?.content || "No response content.",
      status: "success",
      timestamp,
      latencyMs,
      error: null
    };

  } catch (error: any) {
    return {
      model: "groq",
      answer: "",
      status: "error",
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: error.name === 'AbortError' ? 'Timeout exceeded' : error.message
    };
  }
}

/**
 * Compare prompt across selected models in parallel
 */
export async function compareModels(prompt: string, providers: Provider[]): Promise<ModelResponse[]> {
  const promises: Promise<ModelResponse>[] = [];

  for (const p of providers) {
    if (p === "openai") promises.push(callOpenAI(prompt));
    if (p === "gemini") promises.push(callGemini(prompt));
    if (p === "groq") promises.push(callGroq(prompt));
  }

  // Promise.all is safe here because our individual functions catch their own errors
  // and return a localized error `ModelResponse` instead of unwinding
  return Promise.all(promises);
}
