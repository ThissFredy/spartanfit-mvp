import type { ChatMessageRecord } from "./chat.service";

interface GeminiCandidatePart {
  text?: string;
}

interface GeminiCandidateContent {
  parts?: GeminiCandidatePart[];
}

interface GeminiCandidate {
  content?: GeminiCandidateContent;
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

interface GeminiModel {
  name: string;
  supportedGenerationMethods?: string[];
}

interface GeminiModelsResponse {
  models?: GeminiModel[];
}

interface GeminiEmbeddingResponse {
  embedding?: { values?: number[] };
  embeddings?: Array<{ values?: number[] }>;
}

interface GeminiReplyResult {
  text: string | null;
  model: string;
}

interface GeminiEmbeddingResult {
  vector: number[] | null;
  model: string;
}

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

function buildPrompt(input: {
  userMessage: string;
  recentMessages: ChatMessageRecord[];
  knowledgeContext?: string;
  userStats?: Record<string, unknown>;
}) {
  const contextMessages = input.recentMessages
    .slice(-8)
    .map((message) => `${message.role === "user" ? "Usuario" : "Coach"}: ${message.content}`)
    .join("\n");

  return [
    "Eres SpartanFit IA, un coach profesional de fitness y nutrición en español.",
    "Responde de forma clara, accionable y segura.",
    "Solo responde temas de entrenamiento, salud física y nutrición deportiva.",
    "Si preguntan fuera de ese alcance, indícalo con respeto y redirige al entrenamiento.",
    "No inventes datos personales ni diagnósticos médicos.",
    "Tienes acceso al bloque 'ESTADÍSTICAS DEL USUARIO'. Úsalo de forma prioritaria cuando el usuario pregunte por su progreso o datos personales.",
    "Si un campo viene con null, indícalo explícitamente y pide completarlo en perfil, pero no digas que no tienes acceso total.",
    "Si existe 'perfil.pesoKg' o 'registroCorporalReciente.pesoKg', responde con ese valor cuando pregunten por peso.",
    "Si detectas riesgo de lesión o salud, recomienda consulta profesional.",
    "Mantén respuestas entre 3 y 7 líneas, con pasos concretos.",
    input.knowledgeContext
      ? `CONTEXTO DE CONOCIMIENTO (RAG):\n${input.knowledgeContext}`
      : "",
    input.userStats
      ? `ESTADÍSTICAS DEL USUARIO:\n${JSON.stringify(input.userStats, null, 2)}`
      : "",
    contextMessages ? `Contexto reciente:\n${contextMessages}` : "",
    `Mensaje actual del usuario: ${input.userMessage}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function normalizeModelName(model: string) {
  return model.startsWith("models/") ? model.replace("models/", "") : model;
}

export class GeminiService {
  private static cacheByMethod: Record<"generateContent" | "embedContent", { models: string[]; cachedAt: number }> = {
    generateContent: { models: [], cachedAt: 0 },
    embedContent: { models: [], cachedAt: 0 },
  };

  static isConfigured() {
    const key = process.env.GEMINI_API_KEY?.trim();
    return Boolean(key && key.length > 20);
  }

  private static getConfiguredTextModelCandidates() {
    const envModel = process.env.GEMINI_MODEL?.trim();
    const candidates = [
      envModel,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-2.0-flash-lite",
      "gemini-1.5-flash",
    ].filter((model): model is string => Boolean(model));

    return [...new Set(candidates)];
  }

  private static getConfiguredEmbeddingModelCandidates() {
    const envModel = process.env.GEMINI_EMBEDDING_MODEL?.trim();
    const candidates = [
      envModel,
      "gemini-embedding-001",
      "text-embedding-004",
      "gemini-embedding-exp-03-07",
    ].filter((model): model is string => Boolean(model));

    return [...new Set(candidates)];
  }

  private static async fetchAvailableModelsByMethod(
    apiKey: string,
    method: "generateContent" | "embedContent",
  ): Promise<string[]> {
    const cache = this.cacheByMethod[method];
    const now = Date.now();

    if (cache.models.length > 0 && now - cache.cachedAt < MODEL_CACHE_TTL_MS) {
      return cache.models;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: "GET",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini list models failed ${response.status}`);
    }

    const data = (await response.json()) as GeminiModelsResponse;
    const models = (data.models || [])
      .filter((model) => model.supportedGenerationMethods?.includes(method))
      .map((model) => normalizeModelName(model.name));

    const unique = [...new Set(models)];
    this.cacheByMethod[method] = { models: unique, cachedAt: now };
    return unique;
  }

  private static async getTextModelCandidates(apiKey: string) {
    const preferred = this.getConfiguredTextModelCandidates();
    const available = await this.fetchAvailableModelsByMethod(apiKey, "generateContent");

    const prioritized = preferred.filter((model) => available.includes(model));
    const fallback = available.filter((model) => !prioritized.includes(model));

    return [...prioritized, ...fallback];
  }

  private static async getEmbeddingModelCandidates(apiKey: string) {
    const preferred = this.getConfiguredEmbeddingModelCandidates();
    const available = await this.fetchAvailableModelsByMethod(apiKey, "embedContent");

    const prioritized = preferred.filter((model) => available.includes(model));
    const fallback = available.filter((model) => !prioritized.includes(model));

    return [...prioritized, ...fallback];
  }

  static async getStatus() {
    const configured = GeminiService.isConfigured();
    if (!configured) {
      return {
        configured: false,
        modelCandidates: this.getConfiguredTextModelCandidates(),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY!.trim();
    try {
      const candidates = await this.getTextModelCandidates(apiKey);
      return {
        configured: true,
        modelCandidates: candidates,
      };
    } catch {
      return {
        configured: true,
        modelCandidates: this.getConfiguredTextModelCandidates(),
      };
    }
  }

  static async generateEmbedding(input: {
    text: string;
    outputDimensionality?: number;
  }): Promise<GeminiEmbeddingResult> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return { vector: null, model: "none" };
    }

    const models = await this.getEmbeddingModelCandidates(apiKey);
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const requestBody = {
          model: `models/${model}`,
          content: {
            parts: [{ text: input.text }],
          },
          ...(input.outputDimensionality
            ? {
                outputDimensionality: input.outputDimensionality,
              }
            : {}),
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const raw = await response.text();
          throw new Error(`Gemini embedding ${model} failed ${response.status}: ${raw.slice(0, 240)}`);
        }

        const data = (await response.json()) as GeminiEmbeddingResponse;
        const vector = data.embedding?.values || data.embeddings?.[0]?.values || null;

        if (Array.isArray(vector) && vector.length > 0) {
          return { vector, model };
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown Gemini embedding error");
      }
    }

    if (lastError) {
      console.error("Gemini embedding failed:", lastError.message);
    }

    return { vector: null, model: models[0] || "unknown" };
  }

  static async generateReply(input: {
    userMessage: string;
    recentMessages: ChatMessageRecord[];
    knowledgeContext?: string;
    userStats?: Record<string, unknown>;
  }): Promise<GeminiReplyResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { text: null, model: "none" };

    const models = await this.getTextModelCandidates(apiKey.trim());
    let lastError: Error | null = null;

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: buildPrompt(input) }],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                topP: 0.9,
                maxOutputTokens: 500,
              },
            }),
            cache: "no-store",
          },
        );

        if (!response.ok) {
          const raw = await response.text();
          throw new Error(`Gemini ${model} failed ${response.status}: ${raw.slice(0, 240)}`);
        }

        const data = (await response.json()) as GeminiResponse;
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (reply) {
          return { text: reply, model };
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown Gemini error");
      }
    }

    if (lastError) throw lastError;

    return { text: null, model: models[0] || "unknown" };
  }
}
