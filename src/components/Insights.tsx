import React from "react";
import { BarChart3, Heart, Layers, CalendarCheck, ShieldCheck } from "lucide-react";
import { useJournal } from "../context/JournalContext";

export default function Insights() {
  const { entries, stats, loading } = useJournal();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-neutral-500">Calculating your reflection metrics...</p>
      </div>
    );
  }

  // Calculate mood counts
  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
  });

  const sortedMoods = Object.entries(moodCounts).sort((a, b) => Number(b[1]) - Number(a[1]));
  const sortedCategories = (Object.entries(stats.categoryCounts) as [string, number][]).sort(
    (a, b) => Number(b[1]) - Number(a[1])
  );

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-amber-600" aria-hidden="true" />
          <span>Reflective Insights & Patterns</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Objective, self-reported summaries of your journaling habits and recurring themes.
        </p>
      </header>

      {/* Non-clinical disclaimer note */}
      <div className="mb-8 p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-start gap-3 text-xs text-neutral-600">
        <ShieldCheck className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Non-Diagnostic Notice:</strong> These insights represent high-level thematic patterns derived from your personal entries. They are designed to support mindful reflection and are not psychological, psychiatric, or therapeutic evaluations.
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl bg-white p-8">
          <p className="text-neutral-800 font-semibold">No reflections recorded yet</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Write entries in the Dashboard to begin revealing your personal writing rhythms and themes.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                <CalendarCheck className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>Total Volume</span>
              </div>
              <p className="text-3xl font-extrabold text-neutral-900">{stats.totalEntries}</p>
              <p className="text-xs text-neutral-500 mt-1">Reflections committed</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                <Heart className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Average Wellbeing Score</span>
              </div>
              <p className="text-3xl font-extrabold text-neutral-900">{stats.averageScore} <span className="text-sm font-normal text-neutral-400">/ 100</span></p>
              <p className="text-xs text-neutral-500 mt-1">Across all recorded entries</p>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4 text-blue-600" aria-hidden="true" />
                <span>Primary Life Focus</span>
              </div>
              <p className="text-2xl font-extrabold text-neutral-900 truncate">
                {sortedCategories[0] ? sortedCategories[0][0] : "General"}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {sortedCategories[0] ? `${sortedCategories[0][1]} reflections recorded` : "—"}
              </p>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thematic Categories */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
              <h2 className="text-base font-bold text-neutral-900 mb-1">
                Reflections by Life Dimension
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Distribution of your thoughts across different life domains.
              </p>

              <div className="space-y-3.5">
                {sortedCategories.map(([category, count]) => {
                  const countNum = Number(count);
                  const percentage = entries.length > 0 ? Math.round((countNum / entries.length) * 100) : 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-xs font-medium text-neutral-700 mb-1">
                        <span>{category}</span>
                        <span className="text-neutral-500">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Emotional Tones */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs">
              <h2 className="text-base font-bold text-neutral-900 mb-1">
                Frequent Emotional Tones
              </h2>
              <p className="text-xs text-neutral-500 mb-5">
                Recurring emotional tones identified in your reflections.
              </p>

              <div className="flex flex-wrap gap-2">
                {sortedMoods.map(([mood, count]) => (
                  <div
                    key={mood}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-semibold text-neutral-800"
                  >
                    <span>{mood}</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700 text-[10px]">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
