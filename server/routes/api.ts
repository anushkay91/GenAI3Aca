import { Router, Response } from "express";
import { authenticateFirebaseUser, AuthenticatedRequest } from "../middleware/auth";
import { chatRateLimiter } from "../middleware/rateLimit";
import { ChatRequestSchema } from "../schemas/chat";
import { generateReflection } from "../services/gemini";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res: Response) => {
  res.json({
    status: "ok",
    service: "ReflectJournal Backend API",
    time: new Date().toISOString(),
  });
});

apiRouter.post(
  "/chat",
  authenticateFirebaseUser,
  chatRateLimiter,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    // 1. Zod input validation
    const parseResult = ChatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      res.status(400).json({
        error: "Invalid request payload",
        message: firstIssue ? firstIssue.message : "Request validation failed",
      });
      return;
    }

    const { prompt, history } = parseResult.data;

    try {
      // 2. Verified user is present on req.user
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Could not identify authenticated user.",
        });
        return;
      }

      // 3. Generate reflection with Gemini
      const reflection = await generateReflection(prompt, history);

      res.status(200).json(reflection);
    } catch (error: any) {
      console.error("[API /chat error]", error?.message || "Unknown error");

      const message = error?.message?.includes("busy") || error?.message?.includes("timed out")
        ? error.message
        : "Failed to generate AI reflection. Please check your network connection and try again.";

      res.status(500).json({
        error: "Generation error",
        message,
      });
    }
  }
);
