import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface JournalEntry {
  id: string;
  text: string;
  aiResponse: string;
  mood: string;
  score: number;
  createdAt?: any;
}

export default function JournalTimeline({ user }: { user: User }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry)));
    });
  }, [user.uid]);

  // Group by day
  const groupedEntries = entries.reduce((acc: Record<string, JournalEntry[]>, entry) => {
    const date = entry.createdAt?.toDate().toLocaleDateString() || 'Recent';
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Journal Timeline</h1>
      {Object.entries(groupedEntries).map(([date, dayEntries]) => (
        <div key={date} className="mb-10">
          <h2 className="text-xl font-semibold text-neutral-400 mb-4">{date}</h2>
          <div className="space-y-4">
            {dayEntries.map((entry) => (
              <div key={entry.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                 <div className="flex justify-between mb-2">
                    <span className="px-2 py-0.5 bg-amber-900 text-amber-200 rounded-full text-[10px] font-bold">
                      {entry.mood}
                    </span>
                 </div>
                <p className="text-neutral-200 text-sm mb-2">{entry.text}</p>
                <p className="text-xs text-neutral-500 italic">{entry.aiResponse}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
