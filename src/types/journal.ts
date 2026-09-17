/**
 * ReflectJournal Core Domain Models & Contracts
 * Ensures frontend and backend share an identical, resilient data shape.
 */

export interface JournalEntry {
  id: string;
  text: string;
  aiResponse: string;
  mood: string;
  score: number;
  category: string;
  createdAt?: any; // Firestore Timestamp or Date or string
}

export interface JournalHistoryItem {
  text: string;
  aiResponse: string;
  mood?: string;
  score?: number;
  category?: string;
}

export interface ChatRequestPayload {
  prompt: string;
  history?: JournalHistoryItem[];
}

export interface ChatResponsePayload {
  response: string;
  mood: string;
  score: number;
  category: string;
}

export interface UserStats {
  totalEntries: number;
  averageScore: number;
  dominantMood: string;
  categoryCounts: Record<string, number>;
  scoreTrend: 'improving' | 'stable' | 'declining' | 'insufficient_data';
}
