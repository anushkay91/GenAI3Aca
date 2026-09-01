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
    const { prompt } = req.body;
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
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const models = ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash"];
      let result;
      
      for (const modelName of models) {
        try {
          result = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
          });
          break;
        } catch (e) {
          console.warn(`Model ${modelName} failed:`, e);
          continue;
        }
      }

      if (!result) throw new Error("All models failed");
      
      res.json({ response: result.text });
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
