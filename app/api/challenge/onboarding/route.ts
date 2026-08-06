// API: Challenge-Onboarding — berechnet das Matching, speichert es aber nur
// beim User statt es sofort auszugeben. Sichtbar wird es erst im Dashboard.
import { NextResponse } from 'next/server';
import { validateAnswers } from '@/lib/questions';
import { match, type Supplement } from '@/lib/matching';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';
import { matchForOnboarding, type AffiliateLink } from '@/lib/affiliateMatching';
import { getStudioIdBySlug, TURNKISTE_STUDIO_SLUG } from '@/lib/studio';

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

  // 1. Teilnahme des Users finden (aus der Registrierung bereits angelegt).
  let { data: teilnahme, error: teilnahmeError } = await supabase
    .from('challenge_teilnahmen')
    .select('id, status, challenges ( benoetigt_freischaltung )')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (teilnahmeError) {
    console.error('Teilnahme lookup error:', teilnahmeError);
    return NextResponse.json({ error: 'Teilnahme konnte nicht geladen werden.' }, { status: 500 });
  }

  // Manuelle Freischaltung durch das Studio nötig (kein automatisiertes
  // Payment über uns) — solange die Zahlung nicht bestätigt und die
  // Teilnahme nicht freigeschaltet ist, bleibt der Fragebogen gesperrt.
  if (teilnahme) {
    const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
    if (challenge?.benoetigt_freischaltung && teilnahme.status === 'pre_registered') {
      return NextResponse.json(
        { error: 'Dein Zugang muss erst von deinem Studio freigeschaltet werden — meist nach Zahlungseingang.' },
        { status: 403 }
      );
    }
  }

  // 2. Supplement-Katalog laden + Matching berechnen.
  const { data: supplements, error: loadErr } = await supabase
    .from('supplements')
    .select(
      'id, name, kategorie, tier, zielgruppe, wirkung, bevorzugte_form, dosierung_empfehlung, kontraindikationen, evidenzlevel, ist_kombipraeparat, inhaltsstoffe'
    );
  if (loadErr) {
    return NextResponse.json({ error: 'Katalog konnte nicht geladen werden.' }, { status: 500 });
  }
  const ergebnis = match(answers, (supplements ?? []) as Supplement[]);

  // Selbstheilung: falls bei der Registrierung noch keine offene Challenge
  // existierte (oder aus anderem Grund keine Teilnahme angelegt wurde),
  // jetzt eine anlegen statt mit 404 abzubrechen.
  if (!teilnahme) {
    // Bewusst auf Turnkiste beschränkt — siehe Kommentar in
    // app/api/challenge/registrierung/route.ts.
    const turnkisteId = await getStudioIdBySlug(supabase, TURNKISTE_STUDIO_SLUG);
    const { data: challenge } = turnkisteId
      ? await supabase
          .from('challenges')
          .select('id')
          .eq('ist_offen', true)
          .eq('studio_id', turnkisteId)
          .order('start_datum', { ascending: true })
          .limit(1)
          .maybeSingle()
      : { data: null };

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
    teilnahme = { id: neueTeilnahme.id, status: 'pre_registered', challenges: [] };
  }

  const teilnahmeId: string = teilnahme.id;

  // 3. Onboarding-Antworten speichern, Status auf aktiv setzen. Trainingsplan-
  // Wunsch/Fokus zusätzlich in eigenen Spalten (überschreibbar im Check-in,
  // daher nicht nur im eingefrorenen onboarding_antworten-Snapshot).
  const { error: updateError } = await supabase
    .from('challenge_teilnahmen')
    .update({
      onboarding_antworten: answers,
      status: 'aktiv',
      // Anker für die individuelle Wochenzählung (getChallengeSchedule) —
      // Woche 1 beginnt für dieses Mitglied ab jetzt, nicht am globalen
      // Kohorten-Start.
      gestartet_at: new Date().toISOString(),
      trainingsplan_gewuenscht: answers.trainingsplan_gewuenscht === 'ja',
      trainingsplan_fokus: answers.trainingsplan_gewuenscht === 'ja' ? (answers.trainingsplan_fokus ?? 'kein') : null,
    })
    .eq('id', teilnahmeId);
  if (updateError) {
    console.error('Teilnahme update error:', updateError);
    return NextResponse.json({ error: 'Antworten konnten nicht gespeichert werden.' }, { status: 500 });
  }

  // 4. Matching-Ergebnis speichern (nicht sofort anzeigen — das Dashboard holt es ab).
  const { error: empfehlungError } = await supabase
    .from('supplement_empfehlungen')
    .upsert({ teilnahme_id: teilnahmeId, match_result: ergebnis }, { onConflict: 'teilnahme_id' });
  if (empfehlungError) {
    console.error('Empfehlung save error:', empfehlungError);
    return NextResponse.json({ error: 'Empfehlung konnte nicht gespeichert werden.' }, { status: 500 });
  }

  // Touchpoint 1 (siehe GAMEPLAN Kap. 12.1): passendes Affiliate-Produkt
  // direkt nach dem Onboarding auswählen und loggen. Getrennt von der
  // Supplement-Empfehlung oben — die Integration beider folgt später.
  const { data: activeLinks } = await supabase
    .from('affiliate_links')
    .select('id, partner_name, produkt_name, kategorie, beschreibung, url, bild_url, trigger_tags, woche, rabattcode')
    .eq('ist_aktiv', true);

  if (activeLinks && activeLinks.length > 0) {
    const affiliateEmpfehlungen = matchForOnboarding(activeLinks as AffiliateLink[], answers);
    if (affiliateEmpfehlungen.length > 0) {
      const { error: logError } = await supabase.from('empfehlungen_log').insert(
        affiliateEmpfehlungen.map((l) => ({
          teilnahme_id: teilnahmeId,
          affiliate_link_id: l.id,
          kontext: 'onboarding',
        }))
      );
      if (logError) console.error('Empfehlungen-Log error (onboarding):', logError);
    }
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
