// API: Öffentlicher Charles-Chat auf den B2C-Landingpages (Longevity/
// Abnehmen/Rücken) — Phase C des Value-Equation-Funnels (siehe Roadmap).
// Kein Login, daher andere Rolle als /api/coach/chat: statt Support für
// bestehende Teilnehmer geht es um Qualifizierung, Einwandbehandlung und
// Vertrauen VOR der Anmeldung. Nutzt dieselbe Wissensdatenbank (lib/kb.ts),
// zusätzlich die Inhalte der jeweiligen Challenge (challengeSlug), damit
// Fragen wie "was passiert in Woche 3?" beantwortbar sind.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getOpenAIClient, CHAT_MODEL, withShortRateLimitRetry } from '@/lib/openai';
import { retrieveRelevantChunks } from '@/lib/kb';
import { getStudioIdBySlug, TURNKISTE_STUDIO_SLUG } from '@/lib/studio';

export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_HISTORY = 6;
const MAX_MESSAGE_LEN = 800;

// Sehr einfaches In-Memory-Rate-Limit pro IP — bremst offensichtlichen
// Missbrauch auf einer warmen Serverless-Instanz, ist aber NICHT über
// mehrere Instanzen/Regionen hinweg konsistent. Für echten Schutz bräuchte
// es einen shared Store (z.B. Vercel KV) — bewusst als v1-Kompromiss, da
// kein solcher Store im Projekt vorhanden ist.
const RATE_LIMIT = 12;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Zu viele Nachrichten — bitte kurz warten.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history.slice(-MAX_HISTORY) : [];
  const challengeSlug = typeof body?.challengeSlug === 'string' ? body.challengeSlug : 'challenge-1';
  const challengeName = typeof body?.challengeName === 'string' ? body.challengeName : 'Longevity Lifestyle Challenge';

  if (!message) return NextResponse.json({ error: 'Nachricht fehlt.' }, { status: 400 });
  if (message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: 'Nachricht ist zu lang.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Challenge-Typ der konkreten Landingpage ermitteln, damit die Wochen-/
  // Aufgaben-Inhalte (nicht nur Supplement-Wissen) mit ins Retrieval
  // einfließen. Fällt auf die älteste offene Turnkiste-Challenge zurück,
  // falls der Slug nicht (mehr) existiert.
  let challengeTypId: string | null = null;
  const turnkisteId = await getStudioIdBySlug(supabase, TURNKISTE_STUDIO_SLUG);
  if (turnkisteId) {
    let challengeQuery = supabase.from('challenges').select('challenge_typ_id').eq('ist_offen', true).eq('studio_id', turnkisteId).eq('slug', challengeSlug);
    let { data: challenge } = await challengeQuery.maybeSingle();
    if (!challenge) {
      const fallback = await supabase
        .from('challenges')
        .select('challenge_typ_id')
        .eq('ist_offen', true)
        .eq('studio_id', turnkisteId)
        .order('start_datum', { ascending: true })
        .limit(1)
        .maybeSingle();
      challenge = fallback.data;
    }
    challengeTypId = challenge?.challenge_typ_id ?? null;
  }

  const chunks = await retrieveRelevantChunks(supabase, message, challengeTypId, 6);
  const context = chunks.length > 0 ? chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n') : '(keine relevanten Einträge gefunden)';

  const systemPrompt =
    `Du bist Charles, der KI-Berater für die ${challengeName} von MoveIn8 auf der ` +
    'öffentlichen Landingpage. Dein Gegenüber ist noch NICHT angemeldet — deine Aufgabe ist, ' +
    'Fragen zu beantworten, Unsicherheiten auszuräumen und bei Bedarf zur Anmeldung zu ' +
    'ermutigen, OHNE aufdringlich zu wirken. ' +
    'Kernfakten zum Programm: 8 Wochen, 299 € einmalig (kein Abo), individueller Trainings- und ' +
    'Supplement-Plan nach kurzem Fragebogen, wöchentliche Aufgaben und Check-ins mit Score, ' +
    'optionales Buddy-System. Anmeldung reserviert nur den Platz — Zahlung und Start passieren ' +
    'erst im Studio, wenn der Challenge-Pass dort gescannt wird. Wichtig: die Challenge selbst ' +
    'enthält KEINE Ernährungs-App — falls danach gefragt wird, nicht behaupten, dass eine App ' +
    'im Preis inbegriffen ist. ' +
    'Nutze primär die folgenden Wissensauszüge für inhaltliche Fragen (Training, Ernährung, ' +
    'Supplements). Wenn eine Frage darin nicht beantwortet wird, sag das ehrlich statt ' +
    'zu raten. Antworte kurz und konkret (max. ~120 Wörter), auf Deutsch, ohne Floskeln, keine ' +
    'Diagnosen, kein Ersatz für ärztlichen Rat. Reiner Klartext ohne Markdown.\n\nWissensauszüge:\n' +
    context;

  const openai = getOpenAIClient();
  const completion = await withShortRateLimitRetry(() =>
    openai.chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
    })
  );

  const reply = completion.choices[0]?.message?.content?.trim() ?? 'Dazu fällt mir gerade nichts ein — frag mich gern anders.';

  return NextResponse.json({ reply }, { status: 200 });
}
