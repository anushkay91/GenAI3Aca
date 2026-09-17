import "dotenv/config";
import path from "path";
import express from "express";
import { createServer as createViteServer } from "vite";
import { createExpressApp } from "./server/app";

async function startServer() {
  const app = createExpressApp();
  const PORT = Number(process.env.PORT) || 3000;

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
    console.log(`[Server] ReflectJournal running on http://0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
  });
}

startServer();
