import { User } from "firebase/auth";
import { ChatResponsePayload, JournalHistoryItem } from "../types/journal";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Sends a journal prompt to the backend API with Firebase ID token authentication.
 * Never trusts client-side user IDs; uses verified server-side token identity.
 */
export async function sendReflectionRequest(
  user: User,
  prompt: string,
  history: JournalHistoryItem[] = []
): Promise<ChatResponsePayload> {
  const token = await user.getIdToken();

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      history,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Server responded with status ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return {
    response: String(data.response || "Reflection generated."),
    mood: String(data.mood || "Reflective"),
    score: typeof data.score === "number" ? data.score : 50,
    category: String(data.category || "Personal Growth"),
  };
}
