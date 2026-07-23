// API: Challenge-Onboarding — berechnet das Matching, speichert es aber nur
// beim User statt es sofort auszugeben. Sichtbar wird es erst im Dashboard.
import { NextResponse } from 'next/server';
import { validateAnswers } from '@/lib/questions';
import { match, type Supplement } from '@/lib/matching';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

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
  let { data: teilnahme, error: teilnahmeError } = await supabase
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

  // Selbstheilung: falls bei der Registrierung noch keine offene Challenge
  // existierte (oder aus anderem Grund keine Teilnahme angelegt wurde),
  // jetzt eine anlegen statt mit 404 abzubrechen.
  if (!teilnahme) {
    const { data: challenge } = await supabase
      .from('challenges')
      .select('id')
      .eq('ist_offen', true)
      .order('start_datum', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!challenge) {
      return NextResponse.json({ error: 'Aktuell ist keine Challenge offen. Bitte später erneut versuchen.' }, { status: 404 });
    }

    const { data: neueTeilnahme, error: createError } = await supabase
      .from('challenge_teilnahmen')
      .insert({ user_id: user.id, challenge_id: challenge.id, status: 'pre_registered' })
      .select('id')
      .single();

    if (createError || !neueTeilnahme) {
      console.error('Teilnahme create error:', createError);
      return NextResponse.json({ error: 'Teilnahme konnte nicht angelegt werden.' }, { status: 500 });
    }
    teilnahme = neueTeilnahme;
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
