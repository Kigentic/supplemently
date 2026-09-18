// API: Einzelnen Teilnehmer sperren (z.B. bei Missbrauch), unabhängig vom
// Studio-weiten Sperren-Schalter. Gegenstück zu .../freischalten, das
// bestehende Zugang setzt status wieder auf 'aktiv'.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope, hasAdminAccess } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ teilnahmeId: string }> }) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!hasAdminAccess(scope)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { teilnahmeId } = await params;

  const { data: teilnahme } = await supabase
    .from('challenge_teilnahmen')
    .select('id, user_id, challenges ( studio_id )')
    .eq('id', teilnahmeId)
    .maybeSingle();

  if (!teilnahme) return NextResponse.json({ error: 'Teilnahme nicht gefunden.' }, { status: 404 });

  const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
  if (!scope.isMasterAdmin && !scope.studioIds.includes(challenge?.studio_id ?? '')) {
    return NextResponse.json({ error: 'Kein Zugriff auf diese Teilnahme.' }, { status: 403 });
  }

  if (teilnahme.user_id === user.id) {
    return NextResponse.json({ error: 'Du kannst dich nicht selbst sperren.' }, { status: 400 });
  }

  const { error } = await supabase.from('challenge_teilnahmen').update({ status: 'gesperrt' }).eq('id', teilnahmeId);
  if (error) {
    console.error('Teilnehmer sperren error:', error);
    return NextResponse.json({ error: 'Sperren fehlgeschlagen.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
