// API: Persönlicher Empfehlungslink des eingeloggten Teilnehmers + Zähler,
// wie viele Registrierungen darüber zustande kamen. Kein Bonus-System —
// nur Link + Anzahl, siehe Konzept in der Session.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app';

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();

  const { data: teilnahme } = await supabase
    .from('challenge_teilnahmen')
    .select('id, challenges ( slug )')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!teilnahme) {
    return NextResponse.json({ error: 'Keine Teilnahme gefunden.' }, { status: 404 });
  }

  const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
  if (!challenge?.slug) {
    return NextResponse.json({ error: 'Kein Anmeldelink für diese Challenge verfügbar.' }, { status: 404 });
  }

  const { count } = await supabase
    .from('challenge_teilnahmen')
    .select('id', { count: 'exact', head: true })
    .eq('empfohlen_von_teilnahme_id', teilnahme.id);

  return NextResponse.json(
    { link: `${SITE_URL}/anmelden/${challenge.slug}?ref=${teilnahme.id}`, anzahl: count ?? 0 },
    { status: 200 }
  );
}
