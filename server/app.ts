import express from "express";
import helmet from "helmet";
import { apiRouter } from "./routes/api";

export function createExpressApp() {
  const app = express();

  // Trust proxy for correct rate-limiting behind Cloud Run / reverse proxies
  app.set("trust proxy", 1);

  // Basic security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let Vite and Firebase Auth popups operate smoothly
      crossOriginEmbedderPolicy: false,
    })
  );

  // Request body parsing with strict size limit
  app.use(express.json({ limit: "1mb" }));

  // API router mounted first
  app.use("/api", apiRouter);

  return app;
}
