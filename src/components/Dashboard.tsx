import { User, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw, Send, Sparkles, LogOut, CheckCircle2, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface JournalEntry {
  id: string;
  text: string;
  aiResponse: string;
  mood?: string;
  score?: number;
  createdAt?: any;
}

// Zero-crash payload hygiene helper: strip undefined properties
function sanitizePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

export default function Dashboard({ user }: { user: User }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'users', user.uid, 'entries'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEntries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry)));
      },
      (err) => {
        console.error('Firestore snapshot listener error:', err);
      }
    );
    return unsubscribe;
  }, [user.uid]);

  const handleSubmit = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || loading) return;

    setLoading(true);
    setErrorMessage(null);
    setSuccessToast(null);

    try {
      const history = entries.slice(0, 10).map(entry => ({
        text: entry.text,
        mood: entry.mood,
        score: entry.score
      })).reverse(); // Send oldest first

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmedPrompt, userId: user.uid, history }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || `Server responded with status ${response.status}`);
      }

      const rawPayload = {
        text: trimmedPrompt,
        aiResponse: data.response || "No reflection generated.",
        mood: data.mood,
        score: data.score,
        createdAt: serverTimestamp(),
      };

      // Strip any undefined keys before sending to Firestore
      const cleanPayload = sanitizePayload(rawPayload);
      await addDoc(collection(db, 'users', user.uid, 'entries'), cleanPayload);

      // Only clear user input after confirmed write
      setPrompt('');
      setSuccessToast('Reflection saved successfully.');
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (error: any) {
      console.error('Submission or persistence failed:', error);
      setErrorMessage(error?.message || 'Failed to generate reflection or save entry. Your draft has been preserved.');
    } finally {
      setLoading(false);
    }
  };

  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const initiateDelete = (entryId: string) => {
    setEntryToDelete(entryId);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'entries', entryToDelete));
      setSuccessToast('Reflection deleted successfully.');
      setTimeout(() => setSuccessToast(null), 4000);
      setEntryToDelete(null);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setErrorMessage('Failed to delete the entry.');
      setEntryToDelete(null);
    }
  };

  const formatDate = (val: any) => {
    if (!val) return 'Just now';
    if (typeof val.toDate === 'function') {
      return val.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    if (val instanceof Date) {
      return val.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
    return 'Recent';
  };

  const chartData = [...entries].reverse().map((entry, index) => ({
    name: `Entry ${index + 1}`,
    score: Number(entry.score) || 50,
    date: formatDate(entry.createdAt)
  }));

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <header className="flex justify-between items-center pb-6 border-b border-neutral-200 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            ReflectJournal
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Logged in as <span className="font-medium text-neutral-700">{user.email || user.displayName || 'User'}</span>
          </p>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </header>

      {/* Error Banner with Retry */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-medium text-sm">Error processing reflection</p>
              <p className="text-xs text-red-700 mt-1">{errorMessage}</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 text-white rounded text-xs font-medium hover:bg-red-800 transition disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Success Banner */}
      {successToast && (
        <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* New Reflection Input */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-10">
        <label htmlFor="journal-textarea" className="block text-sm font-semibold text-neutral-800 mb-2">
          New Reflection Draft
        </label>
        <textarea
          id="journal-textarea"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="w-full p-3.5 text-neutral-900 placeholder:text-neutral-400 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-sm resize-y"
          placeholder="What is on your mind today? Write your thoughts, questions, or ideas..."
          disabled={loading}
        />
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            {prompt.length} character{prompt.length === 1 ? '' : 's'}
          </span>
          <button
            id="submit-reflection-button"
            onClick={handleSubmit}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Reflecting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Reflection</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mood Analytics */}
      {entries.length > 0 && chartData.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Mood Analytics</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#333' }}
                />
                <Line type="monotone" dataKey="score" stroke="#d97706" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Journal History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-neutral-900">Your Journal Timeline</h2>
          <span className="text-xs text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <p className="text-neutral-500 text-sm">No journal entries yet.</p>
            <p className="text-neutral-400 text-xs mt-1">Submit your first reflection above to start your journey.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                id={`entry-${entry.id}`}
                className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs transition hover:border-neutral-300"
              >
                <div className="flex justify-between items-start text-xs text-neutral-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold uppercase tracking-wider text-neutral-500">Entry {index + 1}</span>
                    {entry.mood && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        {entry.mood}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{formatDate(entry.createdAt)}</span>
                    <button
                      onClick={() => initiateDelete(entry.id)}
                      className="text-neutral-400 hover:text-red-600 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-neutral-900 font-medium text-sm leading-relaxed whitespace-pre-wrap">{entry.text}</p>
                <div className="mt-4 pt-3 border-t border-neutral-100 bg-neutral-50/80 -mx-5 -mb-5 p-4 rounded-b-xl">
                  <p className="text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    AI Companion Insight
                  </p>
                  <p className="text-xs text-neutral-700 leading-relaxed whitespace-pre-wrap">{entry.aiResponse}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 bg-neutral-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full">
            <h3 className="font-bold text-neutral-900 mb-2">Delete Reflection</h3>
            <p className="text-sm text-neutral-600 mb-6">Are you sure you want to delete this reflection? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setEntryToDelete(null)} className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

