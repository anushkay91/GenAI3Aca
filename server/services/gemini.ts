import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION, buildReflectionPrompt } from "../prompts/reflectionPrompt";
import { ChatResponse, ChatResponseSchema } from "../schemas/chat";
import { JournalHistoryItem } from "../../src/types/journal";

// Resilient Model Ladder based on supported non-deprecated Gemini models
const DEFAULT_PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODELS = [
  DEFAULT_PRIMARY_MODEL,
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
].filter((m, i, arr) => arr.indexOf(m) === i);

interface GenerateOptions {
  timeoutMs?: number;
}

export async function generateReflection(
  prompt: string,
  history: JournalHistoryItem[] = [],
  options: GenerateOptions = {}
): Promise<ChatResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured on the server");
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents = buildReflectionPrompt(prompt, history);
  const timeoutMs = options.timeoutMs || 25000;

  let lastError: any = null;

  for (const model of FALLBACK_MODELS) {
    try {
      // Execute with timeout guarantee
      const apiCall = ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: { type: Type.STRING },
              mood: { type: Type.STRING },
              score: { type: Type.INTEGER },
              category: { type: Type.STRING },
            },
            required: ["response", "mood", "score", "category"],
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Reflection generation timed out after ${timeoutMs}ms`)), timeoutMs);
      });

      const response = await Promise.race([apiCall, timeoutPromise]);
      const text = response?.text;

      if (!text) {
        throw new Error("Empty response received from Gemini model");
      }

      let parsedJson: any;
      try {
        parsedJson = JSON.parse(text);
      } catch (e) {
        throw new Error("Gemini returned invalid JSON string");
      }

      // Hardened runtime validation using Zod
      const parseResult = ChatResponseSchema.safeParse(parsedJson);
      if (parseResult.success) {
        return parseResult.data;
      } else {
        console.warn(`[Gemini Validation] Output did not match schema on model ${model}:`, parseResult.error.format());
        // Coerce if close
        const scoreVal = Number(parsedJson.score);
        const score = !isNaN(scoreVal) && scoreVal >= 1 && scoreVal <= 100 ? Math.round(scoreVal) : 50;
        const fallbackObj: ChatResponse = {
          response: typeof parsedJson.response === "string" && parsedJson.response.trim()
            ? parsedJson.response.trim()
            : "Thank you for taking time to reflect. Writing down your thoughts is a powerful step in processing your day.",
          mood: typeof parsedJson.mood === "string" && parsedJson.mood.trim()
            ? parsedJson.mood.trim().slice(0, 50)
            : "Reflective",
          score,
          category: typeof parsedJson.category === "string" && parsedJson.category.trim()
            ? parsedJson.category.trim().slice(0, 50)
            : "Personal Growth",
        };
        return fallbackObj;
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Attempt failed with model '${model}':`, err?.message || err);
      lastError = err;

      // Unrecoverable rate limit / quota
      const status = err?.status || err?.code;
      if (status === 429 || status === "RESOURCE_EXHAUSTED") {
        throw new Error("The AI reflection service is currently busy. Please wait a moment and try again.");
      }
    }
  }

  throw new Error(
    lastError?.message?.includes("timed out")
      ? "AI reflection generation timed out. Please try again."
      : "Unable to generate reflection at this time. Your draft has been preserved."
  );
}
