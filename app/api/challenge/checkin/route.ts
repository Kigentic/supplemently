// API: Wochen-Check-in — Ampelstatus je Habit (Woche 1..aktuell) + zwei
// 1-10-Skalen (Wohlbefinden, Schwierigkeit). Berechnet den Wochen-Score
// und aktualisiert den Gesamt-Score der Teilnahme.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';
import { habitsUpTo } from '@/lib/challengeWeeks';

export const runtime = 'nodejs';

type Ampel = 'gruen' | 'gelb' | 'rot';
const PUNKTE: Record<Ampel, number> = { gruen: 20, gelb: 10, rot: 0 };
const CHECKIN_BASISPUNKTE = 10;

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
    CHECKIN_BASISPUNKTE + expectedKeys.reduce((sum, key) => sum + PUNKTE[cleanHabitStatus[key]], 0);

  const supabase = getServiceClient();

  // Teilnahme des Users finden.
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

  return NextResponse.json({ ok: true, score_woche: scoreWoche }, { status: 200 });
}
