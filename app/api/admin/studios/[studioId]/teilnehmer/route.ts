// API: Teilnehmer EINES bestimmten Studios (Masteradmin-Drilldown von
// /challenge/admin/studios aus) — anders als /api/admin/users (das über alle
// Studios hinweg flach listet) hier strikt auf ein Studio gescoped, egal ob
// der Masteradmin selbst dort auch Studio-Admin ist.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ studioId: string }> }) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!scope.isMasterAdmin) {
    return NextResponse.json({ error: 'Nur der Masteradmin sieht diese Ansicht.' }, { status: 403 });
  }

  const { studioId } = await params;

  const { data: studio } = await supabase.from('studios').select('id, name').eq('id', studioId).maybeSingle();
  if (!studio) return NextResponse.json({ error: 'Studio nicht gefunden.' }, { status: 404 });

  const { data: teilnahmen, error } = await supabase
    .from('challenge_teilnahmen')
    .select('id, user_id, status, gesamt_score, joined_at, challenges!inner ( name, studio_id )')
    .eq('challenges.studio_id', studioId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Studio-Teilnehmer lookup error:', error);
    return NextResponse.json({ error: 'Teilnehmer konnten nicht geladen werden.' }, { status: 500 });
  }

  const userIds = (teilnahmen ?? []).map((t) => t.user_id);
  let profiles: { id: string; vorname: string; nachname: string; email: string; created_at: string }[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, vorname, nachname, email, created_at')
      .in('id', userIds);
    profiles = data ?? [];
  }
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const teilnehmer = (teilnahmen ?? []).map((t) => {
    const profile = profileById.get(t.user_id);
    const challenge = Array.isArray(t.challenges) ? t.challenges[0] : t.challenges;
    return {
      teilnahmeId: t.id,
      userId: t.user_id,
      vorname: profile?.vorname ?? '(gelöscht)',
      nachname: profile?.nachname ?? '',
      email: profile?.email ?? '—',
      challengeName: challenge?.name ?? null,
      status: t.status,
      gesamtScore: t.gesamt_score,
      joinedAt: t.joined_at,
    };
  });

  return NextResponse.json({ studioName: studio.name, teilnehmer }, { status: 200 });
}
