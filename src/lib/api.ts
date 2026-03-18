/** API client — talks to the FastAPI sidecar on port 11435 */

// Dev: Vite proxy handles /api → localhost:11435
// Prod (Tauri): sidecar runs on 11435, use absolute URL
const API_BASE = import.meta.env.DEV ? "/api" : "http://127.0.0.1:11435/api";

async function api<T>(path: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(`API error: ${r.status}`);
  return r.json();
}

// --- Types ---

export interface Stats {
  total_words: number;
  awl_count: number;
  answer_word_count: number;
  topic_count: number;
}

export interface TopicInfo {
  topic: string;
  count: number;
}

export interface WordBrief {
  word: string;
  meaning_cn: string;
  score: number;
  freq: number;
  spread: number;
  band_level: string;
  tier: number;
  is_awl: boolean;
  is_answer_word: boolean;
  topics: string[];
  trend: string;
  primary_section: string;
}

export interface SearchResult {
  total: number;
  page: number;
  size: number;
  items: WordBrief[];
}

export interface Collocation {
  pair: string;
  freq: number;
}

export interface ParaphrasePair {
  word: string;
  sim: number;
}

export interface Example {
  text: string;
  source: string;
  page?: number;
}

export interface WordDetail {
  word: string;
  meaning_cn: string;
  band_level: string;
  tier: number;
  trend: string;
  is_answer_word: boolean;
  answer_freq?: number;
  topics: string[];
  primary_section: string;
  corpus: {
    freq: number;
    spread: number;
    score: number;
    is_awl: boolean;
    sections: Record<string, number>;
  };
  word_family?: string[];
  synonyms?: string[];
  paraphrase_pairs?: ParaphrasePair[];
  collocations?: Collocation[];
  example?: Example;
}

// --- Endpoints ---

export const getStats = () => api<Stats>("/stats");
export const getTopics = () => api<TopicInfo[]>("/topics");

export function searchWords(params: {
  q?: string;
  topic?: string;
  band?: string;
  section?: string;
  awl?: boolean;
  answer?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}): Promise<SearchResult> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.topic) sp.set("topic", params.topic);
  if (params.band) sp.set("band", params.band);
  if (params.section) sp.set("section", params.section);
  if (params.awl) sp.set("awl", "true");
  if (params.answer) sp.set("answer", "true");
  if (params.sort) sp.set("sort", params.sort);
  sp.set("page", String(params.page || 1));
  sp.set("size", String(params.size || 24));
  return api(`/search?${sp}`);
}

export const getWord = (word: string) =>
  api<WordDetail>(`/word/${encodeURIComponent(word)}`);

export const getRandomWords = (params?: { topic?: string; band?: string; count?: number }) => {
  const sp = new URLSearchParams();
  if (params?.topic) sp.set("topic", params.topic);
  if (params?.band) sp.set("band", params.band);
  sp.set("count", String(params?.count || 20));
  return api<WordBrief[]>(`/random?${sp}`);
};
