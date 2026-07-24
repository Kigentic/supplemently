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

  const matched = matchForWeek(activeLinks as AffiliateLink[], woche);
  if (matched.length === 0) {
    return NextResponse.json({ empfehlungen: [] }, { status: 200 });
  }

  // Wiederholter Aufruf derselben Woche soll dieselbe (bereits geloggte)
  // Empfehlung inkl. Log-ID zurückgeben, statt jedes Mal neu zu loggen.
  const { data: existing } = await supabase
    .from('empfehlungen_log')
    .select('id, affiliate_link_id, affiliate_links ( id, partner_name, produkt_name, kategorie, beschreibung, url, bild_url, trigger_tags, woche, rabattcode )')
    .eq('teilnahme_id', teilnahme.id)
    .eq('woche', woche)
    .eq('kontext', 'wochenemail');

  if (existing && existing.length > 0) {
    const empfehlungen = existing.flatMap((e) => {
      const link = Array.isArray(e.affiliate_links) ? e.affiliate_links[0] : e.affiliate_links;
      return link ? [{ ...(link as AffiliateLink), empfehlungLogId: e.id }] : [];
    });
    return NextResponse.json({ empfehlungen }, { status: 200 });
  }

  const { data: insertedLogs, error: logError } = await supabase
    .from('empfehlungen_log')
    .insert(matched.map((l) => ({ teilnahme_id: teilnahme.id, affiliate_link_id: l.id, kontext: 'wochenemail', woche })))
    .select('id, affiliate_link_id');

  if (logError) {
    console.error('Empfehlungen-Log error (woche):', logError);
    return NextResponse.json({ empfehlungen: [] }, { status: 200 });
  }

  const empfehlungen = (insertedLogs ?? []).flatMap((log) => {
    const link = matched.find((l) => l.id === log.affiliate_link_id);
    return link ? [{ ...link, empfehlungLogId: log.id }] : [];
  });

  return NextResponse.json({ empfehlungen }, { status: 200 });
}
