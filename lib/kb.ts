// Supplemently — Wissensdatenbank für den KI-Coach: Chunking + Embeddings +
// semantische Suche über pgvector (siehe supabase/migrations/0021_wissensdatenbank.sql).
import type { SupabaseClient } from '@supabase/supabase-js';
import { getOpenAIClient, EMBEDDING_MODEL, withRateLimitRetry, SHORT_BACKOFF_STEPS_MS } from '@/lib/openai';

const MAX_WORDS_PER_CHUNK = 400;
const OVERLAP_WORDS = 60;

export function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + MAX_WORDS_PER_CHUNK, words.length);
    chunks.push(words.slice(start, end).join(' '));
    if (end >= words.length) break;
    start = end - OVERLAP_WORDS;
  }
  return chunks;
}

export async function embedTexts(texts: string[], backoffStepsMs?: number[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const openai = getOpenAIClient();
  const res = await withRateLimitRetry(() => openai.embeddings.create({ model: EMBEDDING_MODEL, input: texts }), backoffStepsMs);
  return res.data.map((d) => d.embedding);
}

export interface RetrievedChunk {
  id: string;
  content: string;
  similarity: number;
}

export async function retrieveRelevantChunks(
  supabase: SupabaseClient,
  query: string,
  challengeTypId: string | null,
  matchCount = 6
): Promise<RetrievedChunk[]> {
  const [embedding] = await embedTexts([query], SHORT_BACKOFF_STEPS_MS);
  const { data, error } = await supabase.rpc('match_kb_chunks', {
    query_embedding: embedding,
    match_count: matchCount,
    p_challenge_typ_id: challengeTypId,
  });
  if (error) {
    console.error('match_kb_chunks error:', error);
    return [];
  }
  return (data ?? []) as RetrievedChunk[];
}
