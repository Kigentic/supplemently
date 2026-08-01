// API: Status der eigenen (neuesten) Teilnahme — u.a. ob eine Freischaltung
// durch das Studio noch aussteht. `challenges` hat keine öffentliche
// RLS-Policy, daher dieser schlanke Server-Endpoint statt eines direkten
// Client-Query mit Join.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const { data: teilnahme } = await supabase
    .from('challenge_teilnahmen')
    .select('status, challenges ( benoetigt_freischaltung )')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!teilnahme) {
    return NextResponse.json({ status: null, wartetAufFreischaltung: false }, { status: 200 });
  }

  const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
  const wartetAufFreischaltung = !!challenge?.benoetigt_freischaltung && teilnahme.status === 'pre_registered';

  return NextResponse.json({ status: teilnahme.status, wartetAufFreischaltung }, { status: 200 });
}
