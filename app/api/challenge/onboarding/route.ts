// API: Challenge-Onboarding — berechnet das Matching, speichert es aber nur
// beim User statt es sofort auszugeben. Sichtbar wird es erst im Dashboard.
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateAnswers } from '@/lib/questions';
import { match, type Supplement } from '@/lib/matching';
import { getServiceClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

async function getUserFromAuthHeader(req: Request) {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

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

  const supabase = getServiceClient();

  // 1. Supplement-Katalog laden + Matching berechnen.
  const { data: supplements, error: loadErr } = await supabase
    .from('supplements')
    .select(
      'id, name, kategorie, tier, zielgruppe, wirkung, bevorzugte_form, dosierung_empfehlung, kontraindikationen, evidenzlevel, ist_kombipraeparat, inhaltsstoffe'
    );
  if (loadErr) {
    return NextResponse.json({ error: 'Katalog konnte nicht geladen werden.' }, { status: 500 });
  }
  const ergebnis = match(answers, (supplements ?? []) as Supplement[]);

  // 2. Teilnahme des Users finden (aus der Registrierung bereits angelegt).
  const { data: teilnahme, error: teilnahmeError } = await supabase
    .from('challenge_teilnahmen')
    .select('id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (teilnahmeError) {
    console.error('Teilnahme lookup error:', teilnahmeError);
    return NextResponse.json({ error: 'Teilnahme konnte nicht geladen werden.' }, { status: 500 });
  }
  if (!teilnahme) {
    return NextResponse.json({ error: 'Keine Challenge-Teilnahme gefunden.' }, { status: 404 });
  }

  // 3. Onboarding-Antworten speichern, Status auf aktiv setzen.
  const { error: updateError } = await supabase
    .from('challenge_teilnahmen')
    .update({ onboarding_antworten: answers, status: 'aktiv' })
    .eq('id', teilnahme.id);
  if (updateError) {
    console.error('Teilnahme update error:', updateError);
    return NextResponse.json({ error: 'Antworten konnten nicht gespeichert werden.' }, { status: 500 });
  }

  // 4. Matching-Ergebnis speichern (nicht sofort anzeigen — das Dashboard holt es ab).
  const { error: empfehlungError } = await supabase
    .from('supplement_empfehlungen')
    .upsert({ teilnahme_id: teilnahme.id, match_result: ergebnis }, { onConflict: 'teilnahme_id' });
  if (empfehlungError) {
    console.error('Empfehlung save error:', empfehlungError);
    return NextResponse.json({ error: 'Empfehlung konnte nicht gespeichert werden.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
