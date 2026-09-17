import React, { useState } from "react";
import { Folder, BookOpen, Sparkles } from "lucide-react";
import { useJournal } from "../context/JournalContext";

const PRESET_CATEGORIES = [
  "Work",
  "Family",
  "Health",
  "Relationships",
  "Finance",
  "Hobbies",
  "Personal Growth",
  "Other",
];

export default function Categories() {
  const { entries, loading } = useJournal();
  const [selectedCat, setSelectedCat] = useState<string>("Work");

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-neutral-500">Organizing categories...</p>
      </div>
    );
  }

  const categoryEntries = entries.filter((e) => {
    const cat = e.category || "Other";
    return cat.toLowerCase() === selectedCat.toLowerCase();
  });

  const avgCategoryScore =
    categoryEntries.length > 0
      ? Math.round(
          categoryEntries.reduce((acc, curr) => acc + (curr.score || 50), 0) /
            categoryEntries.length
        )
      : null;

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2.5">
          <Folder className="w-6 h-6 text-amber-600" aria-hidden="true" />
          <span>Category Focus</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Explore your personal reflections organized across thematic areas of your life.
        </p>
      </header>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Reflection Categories">
        {PRESET_CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat;
          const count = entries.filter(
            (e) => (e.category || "Other").toLowerCase() === cat.toLowerCase()
          ).length;

          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => setSelectedCat(cat)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 ${
                isSelected
                  ? "bg-neutral-900 text-white shadow-xs"
                  : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <span>{cat}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  isSelected ? "bg-neutral-800 text-neutral-200" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Header */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900">{selectedCat} Reflections</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {categoryEntries.length} {categoryEntries.length === 1 ? "reflection" : "reflections"} recorded in this dimension
          </p>
        </div>

        {avgCategoryScore !== null && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-right">
            <span className="text-[11px] font-semibold text-amber-800 block">
              Dimension Average Score
            </span>
            <span className="text-lg font-extrabold text-amber-950">
              {avgCategoryScore} / 100
            </span>
          </div>
        )}
      </div>

      {/* Reflections in this category */}
      {categoryEntries.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200 p-8">
          <BookOpen className="w-8 h-8 text-neutral-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-semibold text-neutral-800">
            No reflections categorized under "{selectedCat}" yet
          </p>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            When you write about {selectedCat.toLowerCase()} topics in your reflections, the AI companion automatically links them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryEntries.map((entry) => (
            <article
              key={entry.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                  {entry.mood}
                </span>
                <span className="font-semibold text-neutral-700">
                  Mood Score: {entry.score}
                </span>
              </div>
              <p className="text-sm text-neutral-900 leading-relaxed font-normal whitespace-pre-wrap">
                {entry.text}
              </p>
              {entry.aiResponse && (
                <div className="mt-3.5 pt-3 border-t border-neutral-100 bg-neutral-50/70 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <p className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                    <span>AI Reflection</span>
                  </p>
                  <p className="text-xs text-neutral-700 leading-relaxed">{entry.aiResponse}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
