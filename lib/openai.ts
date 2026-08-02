// Supplemently — serverseitiger OpenAI-Client. NUR serverseitig verwenden.
import OpenAI from 'openai';

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY fehlt in der Umgebung.');
  _client = new OpenAI({ apiKey });
  return _client;
}

export const EMBEDDING_MODEL = 'text-embedding-3-small';
export const CHAT_MODEL = 'gpt-4o-mini';

// 'retry-after-ms' ist bei Token-basierten Limits oft viel zu optimistisch
// (meldet ms, obwohl das Minuten-Fenster erst in >1min zurücksetzt) — daher
// eigene, großzügige Backoff-Treppe statt dem Header zu vertrauen.
const BACKOFF_STEPS_MS = [10_000, 20_000, 40_000, 60_000, 60_000, 60_000, 60_000, 60_000];
// Kurze Variante für interaktive Requests (Chat) — Nutzer soll nicht eine
// Minute auf eine Antwort warten, aber ein kurzer Blip soll nicht gleich hart
// fehlschlagen.
export const SHORT_BACKOFF_STEPS_MS = [2_000, 4_000];

export async function withRateLimitRetry<T>(fn: () => Promise<T>, backoffStepsMs: number[] = BACKOFF_STEPS_MS): Promise<T> {
  const maxAttempts = backoffStepsMs.length + 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      if (err?.status !== 429 || attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, backoffStepsMs[attempt - 1]));
    }
  }
  throw new Error('unreachable');
}

export async function withShortRateLimitRetry<T>(fn: () => Promise<T>): Promise<T> {
  return withRateLimitRetry(fn, SHORT_BACKOFF_STEPS_MS);
}
