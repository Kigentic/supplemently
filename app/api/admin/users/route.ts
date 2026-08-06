// API: Masteradmin-Übersicht aller registrierten User + ihrer Teilnahme.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope, hasAdminAccess } from '@/lib/apiAuth';
import { getChallengeSchedule } from '@/lib/challengeSchedule';
import { maxGesamtScore, noteFuer } from '@/lib/challengeScoring';
import { fetchChallengeWeeks, fetchChallengeTypIdBySlug, LONGEVITY_CHALLENGE_TYP_SLUG, type ChallengeWeek } from '@/lib/challengeWeeks';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const scope = await getAdminScope(supabase, user.id);
  if (!hasAdminAccess(scope)) {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });
  }

  // Masteradmin: Teilnahmen aller Studios. Studio-Admin: nur Teilnahmen der
  // eigenen Studio(s) — inner join erzwingt, dass challenges.studio_id existiert.
  const teilnahmenQuery = supabase
    .from('challenge_teilnahmen')
    .select(
      scope.isMasterAdmin
        ? 'id, user_id, status, gesamt_score, joined_at, gestartet_at, challenges ( name, start_datum, wochen_anzahl, challenge_typ_id )'
        : 'id, user_id, status, gesamt_score, joined_at, gestartet_at, challenges!inner ( name, start_datum, wochen_anzahl, challenge_typ_id, studio_id )'
    );
  const { data: teilnahmen, error: teilnahmenError } = scope.isMasterAdmin
    ? await teilnahmenQuery
    : await teilnahmenQuery.in('challenges.studio_id', scope.studioIds);

  if (teilnahmenError) {
    console.error('Admin teilnahmen lookup error:', teilnahmenError);
    return NextResponse.json({ error: 'Konnte Teilnahmen nicht laden.' }, { status: 500 });
  }

  const teilnahmeByUser = new Map<string, (typeof teilnahmen)[number]>();
  for (const t of teilnahmen ?? []) {
    // Neueste Teilnahme pro User behalten.
    const existing = teilnahmeByUser.get(t.user_id);
    if (!existing || new Date(t.joined_at) > new Date(existing.joined_at)) {
      teilnahmeByUser.set(t.user_id, t);
    }
  }

  // Masteradmin sieht auch registrierte User ohne Teilnahme; Studio-Admin sieht
  // ausschließlich die Teilnehmer der eigenen Studio(s).
  let profiles: { id: string; vorname: string; nachname: string; email: string; ist_admin: boolean; created_at: string }[];
  if (scope.isMasterAdmin) {
    const { data, error: profilesError } = await supabase
      .from('profiles')
      .select('id, vorname, nachname, email, ist_admin, created_at')
      .order('created_at', { ascending: false });
    if (profilesError) {
      console.error('Admin users lookup error:', profilesError);
      return NextResponse.json({ error: 'Konnte User nicht laden.' }, { status: 500 });
    }
    profiles = data ?? [];
  } else {
    const userIds = Array.from(teilnahmeByUser.keys());
    if (userIds.length === 0) {
      profiles = [];
    } else {
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('id, vorname, nachname, email, ist_admin, created_at')
        .in('id', userIds)
        .order('created_at', { ascending: false });
      if (profilesError) {
        console.error('Admin users lookup error:', profilesError);
        return NextResponse.json({ error: 'Konnte User nicht laden.' }, { status: 500 });
      }
      profiles = data ?? [];
    }
  }

  // Wochen pro Challenge-Typ einmal laden und cachen (i.d.R. nur ein Typ,
  // aber vorbereitet für mehrere Studios/Typen — siehe GAMEPLAN_B2B).
  const fallbackTypId = await fetchChallengeTypIdBySlug(supabase, LONGEVITY_CHALLENGE_TYP_SLUG);
  const weeksByTypId = new Map<string, ChallengeWeek[]>();
  async function weeksFor(typId: string | null): Promise<ChallengeWeek[]> {
    const resolvedTypId = typId ?? fallbackTypId;
    if (!resolvedTypId) return [];
    if (!weeksByTypId.has(resolvedTypId)) {
      weeksByTypId.set(resolvedTypId, await fetchChallengeWeeks(supabase, resolvedTypId));
    }
    return weeksByTypId.get(resolvedTypId)!;
  }

  const users = await Promise.all(
    (profiles ?? []).map(async (p) => {
      const t = teilnahmeByUser.get(p.id);
      const challenge = Array.isArray(t?.challenges) ? t?.challenges[0] : t?.challenges;

      const startAnchor = t?.gestartet_at ?? challenge?.start_datum;
      const currentWeek = startAnchor
        ? getChallengeSchedule(startAnchor, challenge?.wochen_anzahl ?? 8).currentWeek
        : 1;
      // Note/Score nur für Teilnehmer, die tatsächlich freigeschaltet sind und
      // die Challenge nutzen können — "pre_registered" hat noch gar nicht
      // angefangen und darf keine (falsche) Bewertung zeigen.
      const hatAngefangen = t?.status === 'aktiv' || t?.status === 'abgeschlossen';
      const gesamtScore = hatAngefangen ? (t?.gesamt_score ?? 0) : 0;
      const weeks = hatAngefangen ? await weeksFor(challenge?.challenge_typ_id ?? null) : [];
      const maxScore = hatAngefangen ? maxGesamtScore(weeks, currentWeek) : 0;
      const note = hatAngefangen ? noteFuer(gesamtScore, maxScore) : null;

      return {
        id: p.id,
        teilnahme_id: t?.id ?? null,
        vorname: p.vorname,
        nachname: p.nachname,
        email: p.email,
        ist_admin: p.ist_admin,
        created_at: p.created_at,
        challenge_name: challenge?.name ?? null,
        status: t?.status ?? null,
        gesamt_score: gesamtScore,
        max_score: maxScore,
        note_wert: note?.wert ?? null,
        note_label: note?.label ?? null,
      };
    })
  );

  return NextResponse.json({ users, scope: scope.isMasterAdmin ? 'all' : 'studio' }, { status: 200 });
}
