import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { JournalEntry, UserStats } from "../types/journal";

interface JournalContextType {
  entries: JournalEntry[];
  loading: boolean;
  error: string | null;
  stats: UserStats;
  addEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => Promise<string>;
  deleteEntry: (entryId: string) => Promise<void>;
}

const JournalContext = createContext<JournalContextType | null>(null);

export const JournalProvider: React.FC<{ user: User; children: React.ReactNode }> = ({
  user,
  children,
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "users", user.uid, "entries"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text || "",
            aiResponse: data.aiResponse || "",
            mood: data.mood || "Reflective",
            score: typeof data.score === "number" ? data.score : 50,
            category: data.category || "Personal Growth",
            createdAt: data.createdAt,
          } as JournalEntry;
        });
        setEntries(loaded);
        setLoading(false);
      },
      (err) => {
        console.error("[Firestore] Snapshot listener error:", err);
        setError("Unable to sync your reflections from cloud storage.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user.uid]);

  const addEntry = async (entry: Omit<JournalEntry, "id" | "createdAt">): Promise<string> => {
    const payload = {
      text: entry.text,
      aiResponse: entry.aiResponse,
      mood: entry.mood,
      score: entry.score,
      category: entry.category,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "users", user.uid, "entries"), payload);
    return docRef.id;
  };

  const deleteEntry = async (entryId: string): Promise<void> => {
    await deleteDoc(doc(db, "users", user.uid, "entries", entryId));
  };

  const stats = useMemo<UserStats>(() => {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageScore: 50,
        dominantMood: "None",
        categoryCounts: {},
        scoreTrend: "insufficient_data",
      };
    }

    const total = entries.length;
    const totalScore = entries.reduce((acc, curr) => acc + (curr.score || 50), 0);
    const averageScore = Math.round(totalScore / total);

    // Mood frequency
    const moodFreq: Record<string, number> = {};
    const categoryFreq: Record<string, number> = {};

    entries.forEach((e) => {
      if (e.mood) {
        moodFreq[e.mood] = (moodFreq[e.mood] || 0) + 1;
      }
      if (e.category) {
        categoryFreq[e.category] = (categoryFreq[e.category] || 0) + 1;
      }
    });

    let dominantMood = "Reflective";
    let highestCount = 0;
    for (const [mood, count] of Object.entries(moodFreq)) {
      if (count > highestCount) {
        highestCount = count;
        dominantMood = mood;
      }
    }

    // Trend calculation (compare average of recent 3 vs older)
    let scoreTrend: UserStats["scoreTrend"] = "insufficient_data";
    if (entries.length >= 4) {
      const recentScores = entries.slice(0, 3).map((e) => e.score || 50);
      const olderScores = entries.slice(3, 8).map((e) => e.score || 50);
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;

      if (recentAvg - olderAvg > 5) scoreTrend = "improving";
      else if (olderAvg - recentAvg > 5) scoreTrend = "declining";
      else scoreTrend = "stable";
    }

    return {
      totalEntries: total,
      averageScore,
      dominantMood,
      categoryCounts: categoryFreq,
      scoreTrend,
    };
  }, [entries]);

  return (
    <JournalContext.Provider
      value={{
        entries,
        loading,
        error,
        stats,
        addEntry,
        deleteEntry,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error("useJournal must be used within a JournalProvider");
  }
  return context;
}
