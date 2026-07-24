// API: Wochen-Check-in — Ampelstatus je Habit (Woche 1..aktuell) + zwei
// 1-10-Skalen (Wohlbefinden, Schwierigkeit). Berechnet den Wochen-Score
// und aktualisiert den Gesamt-Score der Teilnahme.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';
import { habitsUpTo } from '@/lib/challengeWeeks';
import { getChallengeSchedule } from '@/lib/challengeSchedule';
import { AMPEL_PUNKTE, CHECKIN_BASISPUNKTE, type Ampel } from '@/lib/challengeScoring';
import { matchForCheckin, type AffiliateLink } from '@/lib/affiliateMatching';

export const runtime = 'nodejs';

interface Body {
  woche: number;
  habit_status: Record<string, Ampel>;
  wohlbefinden: number;
  schwierigkeit: number;
  erfolg_freitext?: string;
}

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 });
  }

  const { woche, habit_status, wohlbefinden, schwierigkeit, erfolg_freitext } = body;

  if (!Number.isInteger(woche) || woche < 1 || woche > 10) {
    return NextResponse.json({ error: 'Ungültige Woche.' }, { status: 400 });
  }
  if (!Number.isInteger(wohlbefinden) || wohlbefinden < 1 || wohlbefinden > 10) {
    return NextResponse.json({ error: 'Wohlbefinden muss zwischen 1 und 10 liegen.' }, { status: 400 });
  }
  if (!Number.isInteger(schwierigkeit) || schwierigkeit < 1 || schwierigkeit > 10) {
    return NextResponse.json({ error: 'Schwierigkeit muss zwischen 1 und 10 liegen.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Teilnahme + Challenge-Termine + Admin-Status laden.
  const [{ data: teilnahme, error: teilnahmeError }, { data: profile }] = await Promise.all([
    supabase
      .from('challenge_teilnahmen')
      .select('id, challenges ( start_datum, wochen_anzahl )')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('profiles').select('ist_admin').eq('id', user.id).maybeSingle(),
  ]);

  if (teilnahmeError) {
    console.error('Teilnahme lookup error:', teilnahmeError);
    return NextResponse.json({ error: 'Teilnahme konnte nicht geladen werden.' }, { status: 500 });
  }
  if (!teilnahme) {
    return NextResponse.json({ error: 'Keine Challenge-Teilnahme gefunden.' }, { status: 404 });
  }

  const isAdmin = !!profile?.ist_admin;
  const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;

  // Datums-Gate serverseitig durchsetzen — Client-Checks sind nur UI-Komfort.
  // Masteradmin darf jede Woche jederzeit einchecken.
  if (!isAdmin) {
    if (!challenge?.start_datum) {
      return NextResponse.json({ error: 'Keine aktive Challenge gefunden.' }, { status: 404 });
    }
    const schedule = getChallengeSchedule(challenge.start_datum, challenge.wochen_anzahl ?? 8);
    if (woche !== schedule.currentWeek) {
      return NextResponse.json({ error: 'Diese Woche ist gerade nicht dran.' }, { status: 403 });
    }
    if (!schedule.checkinUnlocked) {
      return NextResponse.json({ error: 'Der Check-in für diese Woche ist noch nicht freigeschaltet.' }, { status: 403 });
    }
  }

  // Erwartete Habit-Keys für diese Woche (Carry-forward 1..woche) — verhindert
  // dass der Client beliebige Keys/Ampeln unterschiebt.
  const expectedKeys = habitsUpTo(woche).flatMap((g) => g.items.map((i) => i.key));
  if (!habit_status || typeof habit_status !== 'object') {
    return NextResponse.json({ error: 'Habit-Status fehlt.' }, { status: 400 });
  }
  for (const key of expectedKeys) {
    const val = habit_status[key];
    if (val !== 'gruen' && val !== 'gelb' && val !== 'rot') {
      return NextResponse.json({ error: 'Bitte für jede Gewohnheit eine Ampel wählen.' }, { status: 400 });
    }
  }
  // Nur die erwarteten Keys übernehmen (keine fremden Daten persistieren).
  const cleanHabitStatus: Record<string, Ampel> = {};
  for (const key of expectedKeys) cleanHabitStatus[key] = habit_status[key];

  const scoreWoche =
    CHECKIN_BASISPUNKTE + expectedKeys.reduce((sum, key) => sum + AMPEL_PUNKTE[cleanHabitStatus[key]], 0);

  const { error: checkinError } = await supabase.from('wochencheckins').upsert(
    {
      teilnahme_id: teilnahme.id,
      woche,
      wohlbefinden,
      schwierigkeit,
      habit_status: cleanHabitStatus,
      erfolg_freitext: erfolg_freitext?.trim() || null,
      score_woche: scoreWoche,
    },
    { onConflict: 'teilnahme_id,woche' }
  );

  if (checkinError) {
    console.error('Checkin save error:', checkinError);
    return NextResponse.json({ error: 'Check-in konnte nicht gespeichert werden.' }, { status: 500 });
  }

  // Gesamt-Score der Teilnahme neu berechnen (Summe aller Wochen-Scores + Badges).
  const { error: scoreError } = await supabase.rpc('update_gesamt_score', { p_teilnahme_id: teilnahme.id });
  if (scoreError) {
    console.error('Score update error:', scoreError);
    // Nicht kritisch für die Response — Check-in ist gespeichert.
  }

  // Touchpoint 3 (siehe GAMEPLAN Kap. 12.3): passendes Affiliate-Produkt
  // anhand der Check-in-Antworten auswählen, für die Auswertung zurückgeben
  // und im Log festhalten (inkl. Log-ID fürs Klick-Tracking, siehe
  // app/api/challenge/klick/[empfehlungLogId]). Nicht kritisch — Check-in
  // bleibt auch ohne Treffer gültig.
  let affiliateEmpfehlungen: (AffiliateLink & { empfehlungLogId: string })[] = [];
  const { data: activeLinks } = await supabase
    .from('affiliate_links')
    .select('id, partner_name, produkt_name, kategorie, beschreibung, url, bild_url, trigger_tags, woche, rabattcode')
    .eq('ist_aktiv', true);

  if (activeLinks && activeLinks.length > 0) {
    const matched = matchForCheckin(activeLinks as AffiliateLink[], { weekNum: woche, wohlbefinden, schwierigkeit });
    if (matched.length > 0) {
      const { data: insertedLogs, error: logError } = await supabase
        .from('empfehlungen_log')
        .insert(
          matched.map((l) => ({
            teilnahme_id: teilnahme.id,
            affiliate_link_id: l.id,
            kontext: 'checkin_auswertung',
            woche,
          }))
        )
        .select('id, affiliate_link_id');

      if (logError) {
        console.error('Empfehlungen-Log error (checkin):', logError);
      } else {
        affiliateEmpfehlungen = (insertedLogs ?? []).flatMap((log) => {
          const link = matched.find((l) => l.id === log.affiliate_link_id);
          return link ? [{ ...link, empfehlungLogId: log.id }] : [];
        });
      }
    }
  }

  return NextResponse.json(
    { ok: true, score_woche: scoreWoche, affiliate_empfehlungen: affiliateEmpfehlungen },
    { status: 200 }
  );
}
