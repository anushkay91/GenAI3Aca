/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createExpressApp } from "../../server/app";

// Mock Gemini service
vi.mock("../../server/services/gemini", () => ({
  generateReflection: vi.fn(async (prompt: string) => {
    if (prompt.includes("simulate-failure")) {
      throw new Error("Simulated model failure");
    }
    return {
      response: "This is a supportive reflection on your writing.",
      mood: "Calm",
      score: 72,
      category: "Personal Growth",
    };
  }),
}));

describe("Backend API Integration Tests", () => {
  let app: any;

  beforeEach(async () => {
    process.env.NODE_ENV = "test";
    app = await createExpressApp();
  });

  describe("GET /api/health", () => {
    it("returns 200 with service operational status", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("service", "ReflectJournal Backend API");
    });
  });

  describe("POST /api/chat - Authentication Security", () => {
    it("rejects requests missing Authorization header with 401", async () => {
      const res = await request(app)
        .post("/api/chat")
        .send({ prompt: "Today was a good day." });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Authentication required");
    });

    it("rejects requests with malformed Authorization header with 401", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("Authorization", "InvalidHeaderFormat")
        .send({ prompt: "Today was a good day." });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Authentication required");
    });
  });

  describe("POST /api/chat - Input Validation with Zod", () => {
    it("rejects empty prompt with 400", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("x-test-mock-user", "user-123")
        .send({ prompt: "   " });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid request payload");
      expect(res.body.message).toContain("empty");
    });

    it("rejects missing prompt field with 400", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("x-test-mock-user", "user-123")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid request payload");
    });

    it("rejects oversized prompt (>4000 characters) with 400", async () => {
      const longPrompt = "a".repeat(4001);
      const res = await request(app)
        .post("/api/chat")
        .set("x-test-mock-user", "user-123")
        .send({ prompt: longPrompt });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid request payload");
      expect(res.body.message).toContain("maximum limit");
    });
  });

  describe("POST /api/chat - Success Flow & Reflection Generation", () => {
    it("returns validated reflection response for authenticated valid request", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("x-test-mock-user", "user-123")
        .send({
          prompt: "I completed a major milestone at work today and felt deeply relieved.",
          history: [
            {
              text: "Feeling stressed about the upcoming deadline.",
              aiResponse: "Take things step by step.",
              mood: "Anxious",
              score: 35,
              category: "Work",
            },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        response: "This is a supportive reflection on your writing.",
        mood: "Calm",
        score: 72,
        category: "Personal Growth",
      });
    });

    it("returns safe 500 error when model fails without leaking stack traces", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("x-test-mock-user", "user-123")
        .send({ prompt: "simulate-failure" });

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Generation error");
      expect(res.body.message).not.toContain("stack");
    });
  });
});
