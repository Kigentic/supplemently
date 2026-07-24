// API: Touchpoint 1 (GAMEPLAN Kap. 12.1) — liest die beim Onboarding
// geloggten Affiliate-Empfehlungen zurück, damit die Empfehlungsseite sie
// nach einem Redirect erneut anzeigen kann (kein Neu-Berechnen bei jedem Aufruf).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: teilnahme } = await supabase
    .from('challenge_teilnahmen')
    .select('id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!teilnahme) {
    return NextResponse.json({ empfehlungen: [] }, { status: 200 });
  }

  const { data: logEintraege, error } = await supabase
    .from('empfehlungen_log')
    .select('gezeigt_at, affiliate_links ( id, partner_name, produkt_name, beschreibung, url, rabattcode )')
    .eq('teilnahme_id', teilnahme.id)
    .eq('kontext', 'onboarding')
    .order('gezeigt_at', { ascending: false });

  if (error) {
    console.error('Empfehlung lookup error:', error);
    return NextResponse.json({ error: 'Empfehlungen konnten nicht geladen werden.' }, { status: 500 });
  }

  const empfehlungen = (logEintraege ?? [])
    .map((e) => (Array.isArray(e.affiliate_links) ? e.affiliate_links[0] : e.affiliate_links))
    .filter(Boolean);

  return NextResponse.json({ empfehlungen }, { status: 200 });
}
