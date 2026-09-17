import React, { useState } from "react";
import { User } from "firebase/auth";
import { Sparkles, Trash2, BookOpen, Heart, Activity } from "lucide-react";
import { useJournal } from "../context/JournalContext";
import { DisclaimerBanner } from "./common/DisclaimerBanner";
import { ReflectionInput } from "./ReflectionInput";
import { MoodOverview } from "./MoodOverview";
import { DeleteModal } from "./DeleteModal";

export default function Dashboard({ user }: { user: User }) {
  const { entries, loading, stats, deleteEntry } = useJournal();
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEntry(entryToDelete);
      setEntryToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return "Just now";
    if (typeof val.toDate === "function") {
      return val.toDate().toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (val instanceof Date) {
      return val.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Recent";
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Landmark */}
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-amber-600" aria-hidden="true" />
          <span>Dashboard</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Welcome back, <span className="font-semibold text-neutral-800">{user.displayName || user.email?.split("@")[0] || "Reflector"}</span>. This is your safe space for quiet reflection.
        </p>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">Total Reflections</p>
              <p className="text-xl font-bold text-neutral-900">{stats.totalEntries}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">Average Mood Score</p>
              <p className="text-xl font-bold text-neutral-900">
                {stats.totalEntries > 0 ? `${stats.averageScore} / 100` : "—"}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-medium">Primary Emotion</p>
              <p className="text-xl font-bold text-neutral-900 capitalize">
                {stats.totalEntries > 0 ? stats.dominantMood : "—"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Non-clinical disclaimer banner */}
      <DisclaimerBanner />

      {/* New Reflection Composer */}
      <ReflectionInput user={user} />

      {/* Mood Analytics & Trend */}
      <MoodOverview />

      {/* Recent Reflections Timeline Preview */}
      <section aria-labelledby="recent-reflections-heading" className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recent-reflections-heading" className="text-lg font-bold text-neutral-900">
            Recent Reflections
          </h2>
          <span className="text-xs font-semibold text-neutral-600 bg-neutral-100 px-3 py-1 rounded-full">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-neutral-500">Loading your reflections securely...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/50 p-6">
            <p className="text-neutral-700 font-medium text-sm">No reflections written yet.</p>
            <p className="text-neutral-500 text-xs mt-1 max-w-sm mx-auto">
              Draft your first thought above. Your companion will respond with gentle, supportive perspectives.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.slice(0, 5).map((entry, index) => (
              <article
                key={entry.id}
                id={`entry-${entry.id}`}
                className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs transition hover:border-neutral-300"
              >
                <div className="flex justify-between items-start text-xs text-neutral-500 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold tracking-wider text-neutral-700 uppercase">
                      Reflection #{entries.length - index}
                    </span>
                    {entry.mood && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                        {entry.mood}
                      </span>
                    )}
                    {entry.category && (
                      <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                        {entry.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <time dateTime={entry.createdAt?.toDate ? entry.createdAt.toDate().toISOString() : undefined}>
                      {formatDate(entry.createdAt)}
                    </time>
                    <button
                      type="button"
                      onClick={() => setEntryToDelete(entry.id)}
                      aria-label={`Delete reflection from ${formatDate(entry.createdAt)}`}
                      className="p-1.5 text-neutral-400 hover:text-red-600 rounded-md hover:bg-neutral-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-neutral-900 text-sm font-normal leading-relaxed whitespace-pre-wrap">
                  {entry.text}
                </p>

                {/* AI Companion Reflection Box */}
                {entry.aiResponse && (
                  <div className="mt-4 pt-3.5 border-t border-neutral-100 bg-neutral-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl">
                    <p className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                      <span>Supportive AI Companion Reflection</span>
                    </p>
                    <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">
                      {entry.aiResponse}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Accessible Delete Dialog */}
      <DeleteModal
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
