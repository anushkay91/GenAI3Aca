import { z } from "zod";

export const JournalHistoryItemSchema = z.object({
  text: z.string().min(1).max(2000),
  aiResponse: z.string().max(2000).default(""),
  mood: z.string().max(50).optional(),
  score: z.number().int().min(1).max(100).optional(),
  category: z.string().max(50).optional(),
});

export const ChatRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, { message: "Reflection draft cannot be empty" })
    .max(4000, { message: "Reflection draft exceeds maximum limit of 4000 characters" }),
  history: z.array(JournalHistoryItemSchema).max(10).optional().default([]),
});

export const ChatResponseSchema = z.object({
  response: z.string().min(1),
  mood: z.string().min(1).max(50),
  score: z.number().int().min(1).max(100),
  category: z.string().min(1).max(50),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
