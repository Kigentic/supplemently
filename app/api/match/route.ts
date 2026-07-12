// Supplemently — API-Route: Antworten rein, Empfehlung raus, Session gespeichert.
// POST /api/match
// Body: { antworten: Answers, studio_id?: string }

import { NextResponse } from 'next/server';
import { validateAnswers } from '@/lib/questions';
import { match, type Supplement } from '@/lib/matching';
import { getServiceClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 });
  }

  const parsed = validateAnswers(body?.antworten);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const answers = parsed.answers;

  const studioId: string | null =
    typeof body?.studio_id === 'string' && body.studio_id.length ? body.studio_id : null;

  const supabase = getServiceClient();

  // Supplement-Katalog laden.
  const { data: supplements, error: loadErr } = await supabase
    .from('supplements')
    .select(
      'id, name, kategorie, zielgruppe, wirkung, dosierung_empfehlung, kontraindikationen, evidenzlevel, ist_kombipraeparat, inhaltsstoffe'
    );

  if (loadErr) {
    return NextResponse.json({ error: 'Katalog konnte nicht geladen werden.', detail: loadErr.message }, { status: 500 });
  }

  // Scoring.
  const ergebnis = match(answers, (supplements ?? []) as Supplement[]);

  // Session speichern (Antworten + Ergebnis verknüpft).
  const { data: session, error: saveErr } = await supabase
    .from('sessions')
    .insert({ studio_id: studioId, antworten: answers, ergebnis })
    .select('id')
    .single();

  if (saveErr) {
    // Ergebnis trotzdem zurückgeben — Speichern ist nicht kritisch für die Antwort.
    return NextResponse.json(
      { ergebnis, session_id: null, warnung: 'Session konnte nicht gespeichert werden.', detail: saveErr.message },
      { status: 200 }
    );
  }

  return NextResponse.json({ ergebnis, session_id: session?.id ?? null }, { status: 200 });
}
