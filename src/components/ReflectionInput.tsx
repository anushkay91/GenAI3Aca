import React, { useState } from "react";
import { User } from "firebase/auth";
import { Send, Loader2, RotateCcw, CheckCircle2, AlertCircle } from "lucide-react";
import { sendReflectionRequest } from "../services/apiClient";
import { useJournal } from "../context/JournalContext";
import { JournalHistoryItem } from "../types/journal";

interface ReflectionInputProps {
  user: User;
}

export const ReflectionInput: React.FC<ReflectionInputProps> = ({ user }) => {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { entries, addEntry } = useJournal();

  const handleClearDraft = () => {
    if (!prompt.trim()) return;
    if (window.confirm ? true : true) {
      setPrompt("");
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || loading) return;

    if (trimmedPrompt.length > 4000) {
      setErrorMessage("Reflection draft exceeds the maximum 4000 character limit.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessToast(null);

    try {
      // Build safe history context (last 5 entries)
      const historyContext: JournalHistoryItem[] = entries
        .slice(0, 5)
        .map((entry) => ({
          text: entry.text,
          aiResponse: entry.aiResponse,
          mood: entry.mood,
          score: entry.score,
          category: entry.category,
        }))
        .reverse();

      // Authenticated API request
      const reflection = await sendReflectionRequest(user, trimmedPrompt, historyContext);

      // Persist to Firestore via JournalContext
      await addEntry({
        text: trimmedPrompt,
        aiResponse: reflection.response,
        mood: reflection.mood,
        score: reflection.score,
        category: reflection.category,
      });

      // Clear draft only after success
      setPrompt("");
      setSuccessToast("Your reflection was saved with AI companion insight.");
      setTimeout(() => setSuccessToast(null), 5000);
    } catch (err: any) {
      console.error("Submission failed:", err);
      setErrorMessage(
        err?.message || "Failed to generate reflection. Your draft has been safely preserved."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xs mb-8">
      {/* Notifications */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3 text-red-900 text-sm"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-semibold">Unable to complete reflection</p>
              <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-800 text-white rounded-lg text-xs font-semibold hover:bg-red-900 transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-900 text-sm font-medium"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{successToast}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="journal-draft-input" className="block text-sm font-bold text-neutral-900">
            Write New Reflection
          </label>
          {prompt.trim() && !loading && (
            <button
              type="button"
              onClick={handleClearDraft}
              className="text-xs text-neutral-500 hover:text-neutral-800 transition"
            >
              Clear draft
            </button>
          )}
        </div>

        <textarea
          id="journal-draft-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          disabled={loading}
          aria-describedby="char-count-desc"
          placeholder="What is present for you today? Express your thoughts, questions, accomplishments, or challenges..."
          className="w-full p-4 text-neutral-900 placeholder:text-neutral-400 border border-neutral-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm resize-y leading-relaxed transition"
        />

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div id="char-count-desc" className="text-xs text-neutral-500">
            <span>
              {prompt.length} / 4000 characters
            </span>
            {prompt.length > 3500 && (
              <span className="text-amber-700 ml-2 font-medium">
                ({4000 - prompt.length} remaining)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-800 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Reflecting...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Save & Reflect</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
