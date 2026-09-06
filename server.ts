import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Resilient Model Fallback Ladder
const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

async function generateContentWithFallback(prompt: string, apiKey: string): Promise<string> {
  const { GoogleGenAI, Type } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey });

  let lastError: any = null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                response: { type: Type.STRING },
                mood: { type: Type.STRING },
                score: { type: Type.INTEGER },
                category: { type: Type.STRING }
              },
              required: ["response", "mood", "score", "category"]
            }
        }
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini Fallback] Model ${modelName} failed:`, err?.message || err);
      lastError = err;
      // Recoverable error check: 503 UNAVAILABLE, 404 NOT_FOUND, 500 INTERNAL
      const status = err?.status || err?.code || (err?.error && err?.error?.code);
      
      // Quota exhausted, don't waste time trying others
      if (status === 429 || status === "RESOURCE_EXHAUSTED") {
        throw err;
      }
      
      if (
        status === 503 ||
        status === 404 ||
        status === 500 ||
        status === "UNAVAILABLE"
      ) {
        continue;
      }
      continue;
    }
  }
  throw lastError || new Error("All Gemini models in fallback ladder failed.");
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. Top-Level Request Deserialization (Ordering Guarantee)
  app.use(express.json({ limit: "1mb" }));
  
  // Debugging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API routes
  const apiRouter = express.Router();
  apiRouter.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      port: PORT,
      env: process.env.NODE_ENV || "development",
      time: new Date().toISOString(),
    });
  });

  apiRouter.post("/chat", async (req, res) => {
    // 2. Defensive Payload Ingestion (Null-Safe Destructuring)
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required and must be non-empty" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Server Error] GEMINI_API_KEY is not defined");
      return res.status(500).json({ error: "Server configuration error: GEMINI_API_KEY missing" });
    }

    // Prepare system prompt with history
    const historyContext = history.length > 0 
      ? `Here are the user's last ${history.length} journal entries for context:\n${history.map((e: any) => `Entry: "${e.text}" | AI Response: "${e.aiResponse}"`).join('\n')}\n`
      : "";

    const systemPrompt = `You are an empathetic, analytical journaling assistant and psychological profiler. Your primary goal is to read the user's journal entry, provide a supportive and insightful reflection, and precisely analyze their emotional state to plot on a mood tracker graph.

You MUST return your answer as a raw, valid JSON object. Do not use markdown blocks (e.g., \`\`\`json). Do not add any conversational text outside the JSON.

Use this exact JSON structure:
{
  "response": "A thoughtful, conversational, and empathetic response. Ask one gentle follow-up question if appropriate.",
  "mood": "One word summary of dominant emotion",
  "score": 50, // Integer score 1-100 based on the rubric below
  "category": "Work/Family/Health/Relationships/Finance/Hobbies"
}

### Rubric for 'score' (1-100):
1 - 20: Severe distress, depression, extreme anger, grief, or panic.
21 - 40: Anxious, stressed, frustrated, overwhelmed, or sad.
41 - 59: Neutral, bored, tired, "just okay", or mixed feelings.
60 - 79: Calm, content, productive, peaceful, or mildly happy.
80 - 100: Euphoric, highly energetic, extremely joyful, deeply grateful, or ecstatic.

Only output valid JSON.`;

    try {
      const responseText = await generateContentWithFallback(`${systemPrompt}\nUser: ${prompt}`, apiKey);
      const parsed = JSON.parse(responseText);
      
      // Enforce schema
      return res.json({
        response: String(parsed.response || "No reflection generated."),
        mood: String(parsed.mood || "Neutral"),
        score: parseInt(String(parsed.score), 10) || 50,
        category: String(parsed.category || "Other")
      });
    } catch (error: any) {
      console.error("[Gemini Error]", error);
      return res.status(500).json({
        error: "Failed to generate reflection",
        details: error?.message || "All models failed or invalid JSON returned",
      });
    }
  });

  app.use("/api", apiRouter);

  // Vite middleware for development vs static bundle for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
  });
}

startServer();
