import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());
  
  // Debugging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });

  // API routes
  const apiRouter = express.Router();
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  apiRouter.post("/chat", async (req, res) => {
    console.log("Received request to /api/chat");
    const { prompt, history } = req.body;
    console.log("Prompt:", prompt);
    if (!prompt) {
      console.log("Prompt missing");
      return res.status(400).json({ error: "Prompt required" });
    }

    try {
      if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not defined");
        return res.status(500).json({ error: "Server configuration error" });
      }
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let promptContent = prompt;
      if (history && Array.isArray(history) && history.length > 0) {
        const historyText = history.map((entry: any, i: number) => `Entry ${i+1}:\nUser: ${entry.text}\nMood: ${entry.mood}\nScore: ${entry.score}`).join('\n\n');
        promptContent = `You are a personal journaling assistant. You have access to the user's past journal entries and moods. Use this context to provide personalized analytical decisions, reflections, and insights on their current entry.\n\n### PAST HISTORY ###\n${historyText}\n\n### NEW ENTRY ###\n${prompt}`;
      }

      const models = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"];
      let result;
      
      for (const modelName of models) {
        try {
          result = await ai.models.generateContent({
            model: modelName,
            contents: promptContent,
            config: {
               responseMimeType: "application/json",
               responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    response: { type: Type.STRING, description: "Your response to the journal entry." },
                    mood: { type: Type.STRING, description: "A single word summarizing the mood of the entry." },
                    score: { type: Type.INTEGER, description: "A score from 1 to 100 representing the sentiment, 100 being highly positive." }
                  },
                  required: ["response", "mood", "score"]
               }
            }
          });
          break;
        } catch (e) {
          console.warn(`Model ${modelName} failed:`, e);
          continue;
        }
      }

      if (!result || !result.text) throw new Error("All models failed or no text returned");
      
      const parsed = JSON.parse(result.text);
      res.json(parsed);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  app.use("/api", apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
