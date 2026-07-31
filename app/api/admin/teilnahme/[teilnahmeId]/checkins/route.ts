// API: Masteradmin — Aufgaben-Breakdown aller Check-ins einer Teilnahme.
// Zeigt pro Woche und Habit die abgegebene Ampel + daraus resultierende
// Punkte, damit die Score-Berechnung für den Admin nachvollziehbar ist.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';
import { habitsUpTo, fetchChallengeWeeks, fetchChallengeTypIdBySlug, LONGEVITY_CHALLENGE_TYP_SLUG } from '@/lib/challengeWeeks';
import { AMPEL_PUNKTE, maxScoreForWeek, noteFuer, type Ampel } from '@/lib/challengeScoring';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ teilnahmeId: string }> }) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data: callerProfile } = await supabase.from('profiles').select('ist_admin').eq('id', user.id).maybeSingle();
  if (!callerProfile?.ist_admin) {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });
  }

  const { teilnahmeId } = await params;

  const [{ data: checkins, error }, { data: teilnahme }] = await Promise.all([
    supabase
      .from('wochencheckins')
      .select('woche, habit_status, score_woche, wohlbefinden, schwierigkeit, erfolg_freitext')
      .eq('teilnahme_id', teilnahmeId)
      .order('woche', { ascending: true }),
    supabase
      .from('challenge_teilnahmen')
      .select('challenges ( challenge_typ_id )')
      .eq('id', teilnahmeId)
      .maybeSingle(),
  ]);

  if (error) {
    console.error('Admin checkins lookup error:', error);
    return NextResponse.json({ error: 'Check-ins konnten nicht geladen werden.' }, { status: 500 });
  }

  const challenge = Array.isArray(teilnahme?.challenges) ? teilnahme?.challenges[0] : teilnahme?.challenges;
  const challengeTypId =
    challenge?.challenge_typ_id ?? (await fetchChallengeTypIdBySlug(supabase, LONGEVITY_CHALLENGE_TYP_SLUG));
  if (!challengeTypId) {
    return NextResponse.json({ error: 'Challenge-Typ konnte nicht ermittelt werden.' }, { status: 500 });
  }

  let weeks;
  try {
    weeks = await fetchChallengeWeeks(supabase, challengeTypId);
  } catch (err) {
    console.error('Challenge-Wochen lookup error:', err);
    return NextResponse.json({ error: 'Challenge-Inhalte konnten nicht geladen werden.' }, { status: 500 });
  }

  const wochen = (checkins ?? []).map((c) => {
    const habitStatus = (c.habit_status ?? {}) as Record<string, Ampel>;
    const gruppen = habitsUpTo(weeks, c.woche).map((g) => ({
      weekNum: g.week.num,
      theme: g.week.theme,
      items: g.items.map((i) => {
        const ampel = habitStatus[i.key] ?? null;
        return {
          text: i.text,
          ampel,
          punkte: ampel ? AMPEL_PUNKTE[ampel] : 0,
        };
      }),
    }));

    const maxScoreWoche = maxScoreForWeek(weeks, c.woche);

    return {
      woche: c.woche,
      scoreWoche: c.score_woche,
      maxScoreWoche,
      note: noteFuer(c.score_woche, maxScoreWoche),
      wohlbefinden: c.wohlbefinden,
      schwierigkeit: c.schwierigkeit,
      erfolgFreitext: c.erfolg_freitext,
      gruppen,
    };
  });

  return NextResponse.json({ wochen }, { status: 200 });
}
