import React, { useState, useMemo } from "react";
import { Sparkles, Trash2, Search, Filter, Calendar } from "lucide-react";
import { useJournal } from "../context/JournalContext";
import { DeleteModal } from "./DeleteModal";

export default function JournalTimeline() {
  const { entries, loading, deleteEntry } = useJournal();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((e) => {
      if (e.category) set.add(e.category);
    });
    return ["All", ...Array.from(set)];
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        !searchTerm.trim() ||
        entry.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.aiResponse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.mood && entry.mood.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat =
        selectedCategory === "All" || entry.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [entries, searchTerm, selectedCategory]);

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
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (val instanceof Date) {
      return val.toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Recent";
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Reflections Timeline
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Browse, search, and review your historical personal reflections and companion insights.
        </p>
      </header>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <label htmlFor="timeline-search" className="sr-only">
            Search reflections
          </label>
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            id="timeline-search"
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keywords or emotions..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
          <span className="text-xs text-neutral-500 font-medium shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter reflections by category"
            className="text-xs border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-neutral-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-neutral-900"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-neutral-200">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Loading timeline...</p>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 rounded-2xl bg-neutral-50 p-6">
          <Calendar className="w-8 h-8 text-neutral-400 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-semibold text-neutral-800">No reflections matched your search</p>
          <p className="text-xs text-neutral-500 mt-1">Try clearing your search query or selecting another category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry, idx) => (
            <article
              key={entry.id}
              className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-2xs transition hover:border-neutral-300"
            >
              <div className="flex justify-between items-start text-xs text-neutral-500 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-neutral-700 uppercase tracking-wider text-[11px]">
                    Reflection #{entries.length - idx}
                  </span>
                  {entry.mood && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                      {entry.mood}
                    </span>
                  )}
                  {entry.category && (
                    <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                      {entry.category}
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-neutral-600">
                    Score: {entry.score}/100
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <time className="text-neutral-500">{formatDate(entry.createdAt)}</time>
                  <button
                    type="button"
                    onClick={() => setEntryToDelete(entry.id)}
                    aria-label={`Delete reflection from ${formatDate(entry.createdAt)}`}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-neutral-100 transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-neutral-900 text-sm leading-relaxed whitespace-pre-wrap font-normal">
                {entry.text}
              </p>

              {entry.aiResponse && (
                <div className="mt-4 pt-3.5 border-t border-neutral-100 bg-neutral-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <p className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                    <span>AI Companion Reflection</span>
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

      <DeleteModal
        isOpen={Boolean(entryToDelete)}
        onClose={() => setEntryToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
