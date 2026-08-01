// API: Studio-Admin schaltet ein Mitglied frei (nach eigenständig
// abgewickelter Zahlung außerhalb der Plattform) — setzt status='aktiv'.
// Kein automatisiertes Payment über uns, siehe
// GAMEPLAN_B2B_CHALLENGE_PLATFORM.md.
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
    .select('id, status, challenges ( studio_id )')
    .eq('id', teilnahmeId)
    .maybeSingle();

  if (!teilnahme) {
    return NextResponse.json({ error: 'Teilnahme nicht gefunden.' }, { status: 404 });
  }

  const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
  if (!scope.isMasterAdmin && !scope.studioIds.includes(challenge?.studio_id ?? '')) {
    return NextResponse.json({ error: 'Kein Zugriff auf diese Teilnahme.' }, { status: 403 });
  }

  const { error: updateError } = await supabase
    .from('challenge_teilnahmen')
    .update({ status: 'aktiv' })
    .eq('id', teilnahmeId);

  if (updateError) {
    console.error('Freischalten error:', updateError);
    return NextResponse.json({ error: 'Freischalten fehlgeschlagen.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
