// API: Masteradmin-Übersicht aller Studios inkl. Teilnehmer-/Durchgangs-
// Anzahl. Getrennt von /api/admin/users (das listet Teilnehmer flach über
// alle Studios) — hier geht's um die Studios selbst als Top-Level-Einheit.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!scope.isMasterAdmin) {
    return NextResponse.json({ error: 'Nur der Masteradmin sieht die Studio-Übersicht.' }, { status: 403 });
  }

  const { data: studios, error } = await supabase
    .from('studios')
    .select('id, name, slug, kontakt_email, gesperrt, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Studios lookup error:', error);
    return NextResponse.json({ error: 'Studios konnten nicht geladen werden.' }, { status: 500 });
  }

  const studioIds = (studios ?? []).map((s) => s.id);
  if (studioIds.length === 0) {
    return NextResponse.json({ studios: [] }, { status: 200 });
  }

  // Durchgänge (Challenges) pro Studio zählen.
  const { data: challenges } = await supabase
    .from('challenges')
    .select('id, studio_id')
    .in('studio_id', studioIds);

  const challengeIdsByStudio = new Map<string, string[]>();
  for (const c of challenges ?? []) {
    if (!c.studio_id) continue;
    const list = challengeIdsByStudio.get(c.studio_id) ?? [];
    list.push(c.id);
    challengeIdsByStudio.set(c.studio_id, list);
  }

  // Teilnehmer (Teilnahmen) pro Studio zählen — über alle Durchgänge des Studios.
  const allChallengeIds = (challenges ?? []).map((c) => c.id);
  const teilnehmerCountByStudio = new Map<string, number>();
  if (allChallengeIds.length > 0) {
    const { data: teilnahmen } = await supabase
      .from('challenge_teilnahmen')
      .select('challenge_id')
      .in('challenge_id', allChallengeIds);

    const challengeToStudio = new Map<string, string>();
    for (const [studioId, ids] of challengeIdsByStudio) {
      for (const id of ids) challengeToStudio.set(id, studioId);
    }
    for (const t of teilnahmen ?? []) {
      const studioId = challengeToStudio.get(t.challenge_id);
      if (!studioId) continue;
      teilnehmerCountByStudio.set(studioId, (teilnehmerCountByStudio.get(studioId) ?? 0) + 1);
    }
  }

  const result = (studios ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    kontaktEmail: s.kontakt_email,
    gesperrt: s.gesperrt,
    createdAt: s.created_at,
    durchgaengeAnzahl: challengeIdsByStudio.get(s.id)?.length ?? 0,
    teilnehmerAnzahl: teilnehmerCountByStudio.get(s.id) ?? 0,
  }));

  return NextResponse.json({ studios: result }, { status: 200 });
}
