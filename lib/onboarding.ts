// Geteilte Onboarding-Logik: validiert Fragebogen-Antworten, legt bei Bedarf
// eine Teilnahme an, berechnet Supplement-/Affiliate-Matching und speichert
// alles. Wird von zwei Stellen aufgerufen:
//  - app/api/challenge/onboarding/route.ts (eingeloggter Fragebogen-Flow,
//    Bearer-Token-authentifiziert)
//  - app/api/challenge/registrierung/route.ts (Value-Equation-Funnel: Gast
//    füllt den Fragebogen VOR der Registrierung aus, Antworten kommen direkt
//    im Registrierungs-Request mit, kein zweiter HTTP-Roundtrip nötig)
import { validateAnswers } from '@/lib/questions';
import { match, type Supplement } from '@/lib/matching';
import { getServiceClient } from '@/lib/supabaseServer';
import { matchForOnboarding, type AffiliateLink } from '@/lib/affiliateMatching';
import { getStudioIdBySlug, TURNKISTE_STUDIO_SLUG } from '@/lib/studio';

type ServiceClient = ReturnType<typeof getServiceClient>;

export type OnboardingResult =
  | { ok: true; teilnahmeId: string }
  | { ok: false; error: string; status: number };

export async function runOnboarding(
  supabase: ServiceClient,
  userId: string,
  rawAnswers: unknown
): Promise<OnboardingResult> {
  const parsed = validateAnswers(rawAnswers);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, status: 400 };
  }
  const answers = parsed.answers;

  // 1. Teilnahme des Users finden (aus der Registrierung bereits angelegt).
  let { data: teilnahme, error: teilnahmeError } = await supabase
    .from('challenge_teilnahmen')
    .select('id, status, challenges ( benoetigt_freischaltung )')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (teilnahmeError) {
    console.error('Teilnahme lookup error:', teilnahmeError);
    return { ok: false, error: 'Teilnahme konnte nicht geladen werden.', status: 500 };
  }

  // Fragebogen-Antworten dürfen immer gespeichert werden (Datenerfassung ist
  // bewusst vom Zugang entkoppelt — Value-Equation-Funnel sammelt den Plan
  // VOR der Freischaltung). Ob der Status danach auf 'aktiv' springt oder
  // 'pre_registered' bleibt, entscheidet sich weiter unten anhand von
  // benoetigt_freischaltung; erst DAS steuert den Zugriff auf Wochenansicht
  // & Co. (siehe mein-status/checkin Routen).
  let bleibtGesperrt =
    !!teilnahme &&
    (() => {
      const challenge = Array.isArray(teilnahme!.challenges) ? teilnahme!.challenges[0] : teilnahme!.challenges;
      return !!challenge?.benoetigt_freischaltung && teilnahme!.status === 'pre_registered';
    })();

  // 2. Supplement-Katalog laden + Matching berechnen.
  const { data: supplements, error: loadErr } = await supabase
    .from('supplements')
    .select(
      'id, name, kategorie, tier, zielgruppe, wirkung, bevorzugte_form, dosierung_empfehlung, kontraindikationen, evidenzlevel, ist_kombipraeparat, inhaltsstoffe'
    );
  if (loadErr) {
    return { ok: false, error: 'Katalog konnte nicht geladen werden.', status: 500 };
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
          .select('id, benoetigt_freischaltung')
          .eq('ist_offen', true)
          .eq('studio_id', turnkisteId)
          .order('start_datum', { ascending: true })
          .limit(1)
          .maybeSingle()
      : { data: null };

    if (!challenge) {
      return { ok: false, error: 'Aktuell ist keine Challenge offen. Bitte später erneut versuchen.', status: 404 };
    }

    const { data: neueTeilnahme, error: createError } = await supabase
      .from('challenge_teilnahmen')
      .insert({ user_id: userId, challenge_id: challenge.id, status: 'pre_registered' })
      .select('id')
      .single();

    if (createError || !neueTeilnahme) {
      console.error('Teilnahme create error:', createError);
      return { ok: false, error: 'Teilnahme konnte nicht angelegt werden.', status: 500 };
    }
    teilnahme = { id: neueTeilnahme.id, status: 'pre_registered', challenges: [] };
    bleibtGesperrt = !!challenge.benoetigt_freischaltung;
  }

  const teilnahmeId: string = teilnahme.id;

  // 3. Onboarding-Antworten speichern. Status springt nur auf 'aktiv', wenn
  // kein Freischaltungs-Gate greift — sonst bleibt 'pre_registered', bis das
  // Studio per QR-Scan aktiviert (siehe Freischalten-Route). Trainingsplan-
  // Wunsch/Fokus zusätzlich in eigenen Spalten (überschreibbar im Check-in,
  // daher nicht nur im eingefrorenen onboarding_antworten-Snapshot).
  const { error: updateError } = await supabase
    .from('challenge_teilnahmen')
    .update({
      onboarding_antworten: answers,
      status: bleibtGesperrt ? 'pre_registered' : 'aktiv',
      // Anker für die individuelle Wochenzählung (getChallengeSchedule) —
      // Woche 1 beginnt ab jetzt. Bei aktivem Freischaltungs-Gate erst beim
      // Studio-Check-in gesetzt (siehe Freischalten-Route), nicht schon hier
      // — sonst tickt die Challenge-Uhr, bevor der Zugang überhaupt aktiv ist.
      ...(bleibtGesperrt ? {} : { gestartet_at: new Date().toISOString() }),
      trainingsplan_gewuenscht: answers.trainingsplan_gewuenscht === 'ja',
      trainingsplan_ort: answers.trainingsplan_gewuenscht === 'ja' ? (answers.trainingsplan_ort ?? 'studio') : null,
      trainingsplan_fokus: answers.trainingsplan_gewuenscht === 'ja' ? (answers.trainingsplan_fokus ?? 'kein') : null,
    })
    .eq('id', teilnahmeId);
  if (updateError) {
    console.error('Teilnahme update error:', updateError);
    return { ok: false, error: 'Antworten konnten nicht gespeichert werden.', status: 500 };
  }

  // 4. Matching-Ergebnis speichern (nicht sofort anzeigen — das Dashboard holt es ab).
  const { error: empfehlungError } = await supabase
    .from('supplement_empfehlungen')
    .upsert({ teilnahme_id: teilnahmeId, match_result: ergebnis }, { onConflict: 'teilnahme_id' });
  if (empfehlungError) {
    console.error('Empfehlung save error:', empfehlungError);
    return { ok: false, error: 'Empfehlung konnte nicht gespeichert werden.', status: 500 };
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

  return { ok: true, teilnahmeId };
}
