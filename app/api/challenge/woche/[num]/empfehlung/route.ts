// API: Touchpoint 2 (GAMEPLAN Kap. 12.2) — passendes Affiliate-Produkt für
// die jeweilige Wochenseite. Loggt den Impression nur einmal pro
// Teilnahme+Woche, damit die Anzeige beim wiederholten Aufruf nicht spammt.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';
import { matchForWeek, type AffiliateLink } from '@/lib/affiliateMatching';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ num: string }> }) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const { num } = await params;
  const woche = Number(num);
  if (!Number.isInteger(woche) || woche < 1 || woche > 10) {
    return NextResponse.json({ error: 'Ungültige Woche.' }, { status: 400 });
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

  const { data: activeLinks } = await supabase
    .from('affiliate_links')
    .select('id, partner_name, produkt_name, kategorie, beschreibung, url, bild_url, trigger_tags, woche, rabattcode')
    .eq('ist_aktiv', true);

  if (!activeLinks || activeLinks.length === 0) {
    return NextResponse.json({ empfehlungen: [] }, { status: 200 });
  }

  const empfehlungen = matchForWeek(activeLinks as AffiliateLink[], woche);

  if (empfehlungen.length > 0) {
    const { data: existing } = await supabase
      .from('empfehlungen_log')
      .select('id')
      .eq('teilnahme_id', teilnahme.id)
      .eq('woche', woche)
      .eq('kontext', 'wochenemail')
      .limit(1)
      .maybeSingle();

    if (!existing) {
      const { error: logError } = await supabase.from('empfehlungen_log').insert(
        empfehlungen.map((l) => ({
          teilnahme_id: teilnahme.id,
          affiliate_link_id: l.id,
          kontext: 'wochenemail',
          woche,
        }))
      );
      if (logError) console.error('Empfehlungen-Log error (woche):', logError);
    }
  }

  return NextResponse.json({ empfehlungen }, { status: 200 });
}
