// API: KI-Coach-Chat. Holt passende Wissens-Chunks (Challenge-Inhalte +
// globales Supplement-Wissen) per pgvector-Suche und lässt GPT darauf
// basierend antworten. Kontext (aktueller Challenge-Typ) kommt vom Client
// oder wird aus der neuesten Teilnahme des Users abgeleitet.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';
import { getOpenAIClient, CHAT_MODEL, withShortRateLimitRetry } from '@/lib/openai';
import { retrieveRelevantChunks } from '@/lib/kb';

export const runtime = 'nodejs';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const MAX_HISTORY = 6;
const MAX_MESSAGE_LEN = 2000;

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const history: ChatMessage[] = Array.isArray(body?.history) ? body.history.slice(-MAX_HISTORY) : [];

  if (!message) return NextResponse.json({ error: 'Nachricht fehlt.' }, { status: 400 });
  if (message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: 'Nachricht ist zu lang.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  let challengeTypId: string | null = typeof body?.challengeTypId === 'string' ? body.challengeTypId : null;
  let challengeName = 'deiner Challenge';
  if (!challengeTypId) {
    const { data: teilnahme } = await supabase
      .from('challenge_teilnahmen')
      .select('challenges ( name, challenge_typ_id )')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const challenge = Array.isArray(teilnahme?.challenges) ? teilnahme?.challenges[0] : teilnahme?.challenges;
    challengeTypId = challenge?.challenge_typ_id ?? null;
    challengeName = challenge?.name ?? challengeName;
  }

  const chunks = await retrieveRelevantChunks(supabase, message, challengeTypId, 6);
  const context = chunks.length > 0 ? chunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n') : '(keine relevanten Einträge gefunden)';

  const systemPrompt =
    `Du bist der persönliche KI-Coach für die "${challengeName}" auf Supplemently. ` +
    'Du hilfst Teilnehmern bei Fragen zu Aufgaben, Workouts, Mobility, Ernährung und ' +
    'Supplements — praktisch, motivierend, auf Deutsch, ohne Floskeln. ' +
    'Nutze primär die folgenden Wissensauszüge für deine Antwort. Wenn eine Frage darin ' +
    'nicht beantwortet wird, sag das ehrlich und gib bei Bedarf vorsichtigen allgemeinen ' +
    'Rat, ohne ihn als gesicherte Quelle auszugeben. Halte Antworten kurz und konkret ' +
    '(max. ~150 Wörter), keine Diagnosen, kein Ersatz für ärztlichen Rat bei ' +
    'gesundheitlichen Problemen.\n\nWissensauszüge:\n' +
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
