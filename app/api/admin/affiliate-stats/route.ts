// API: Masteradmin — Affiliate-Statistik. Gezeigt (Impressions) vs. Geklickt
// pro Produkt und pro Touchpoint (Kontext), berechnet aus empfehlungen_log
// + dem Klick-Zähler auf affiliate_links.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

const KONTEXT_LABEL: Record<string, string> = {
  onboarding: 'Touchpoint 1 · Onboarding',
  wochenemail: 'Touchpoint 2 · Wochenseite',
  checkin_auswertung: 'Touchpoint 3 · Check-in',
  abschluss: 'Abschluss',
};

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = getServiceClient();
  const { data: callerProfile } = await supabase.from('profiles').select('ist_admin').eq('id', user.id).maybeSingle();
  if (!callerProfile?.ist_admin) {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });
  }

  const [{ data: links, error: linksError }, { data: logs, error: logsError }] = await Promise.all([
    supabase
      .from('affiliate_links')
      .select('id, partner_name, produkt_name, kategorie, klicks, ist_aktiv, rabattcode')
      .order('partner_name', { ascending: true }),
    supabase.from('empfehlungen_log').select('affiliate_link_id, kontext, geklickt_at'),
  ]);

  if (linksError || logsError) {
    console.error('Affiliate-Stats lookup error:', linksError, logsError);
    return NextResponse.json({ error: 'Statistik konnte nicht geladen werden.' }, { status: 500 });
  }

  const logsByLink = new Map<string, { impressions: number; klicks: number }>();
  const logsByKontext = new Map<string, { impressions: number; klicks: number }>();

  for (const l of logs ?? []) {
    const linkStat = logsByLink.get(l.affiliate_link_id) ?? { impressions: 0, klicks: 0 };
    linkStat.impressions += 1;
    if (l.geklickt_at) linkStat.klicks += 1;
    logsByLink.set(l.affiliate_link_id, linkStat);

    const kontextStat = logsByKontext.get(l.kontext) ?? { impressions: 0, klicks: 0 };
    kontextStat.impressions += 1;
    if (l.geklickt_at) kontextStat.klicks += 1;
    logsByKontext.set(l.kontext, kontextStat);
  }

  const produkte = (links ?? []).map((link) => {
    const stat = logsByLink.get(link.id) ?? { impressions: 0, klicks: 0 };
    return {
      id: link.id,
      partner_name: link.partner_name,
      produkt_name: link.produkt_name,
      kategorie: link.kategorie,
      ist_aktiv: link.ist_aktiv,
      rabattcode: link.rabattcode,
      impressions: stat.impressions,
      klicks: link.klicks, // authoritativer Zähler (RPC increment), nicht aus dem Log-Count
      ctr: stat.impressions > 0 ? Math.round((link.klicks / stat.impressions) * 1000) / 10 : 0,
    };
  });

  const touchpoints = Array.from(logsByKontext.entries()).map(([kontext, stat]) => ({
    kontext,
    label: KONTEXT_LABEL[kontext] ?? kontext,
    impressions: stat.impressions,
    klicks: stat.klicks,
    ctr: stat.impressions > 0 ? Math.round((stat.klicks / stat.impressions) * 1000) / 10 : 0,
  }));

  return NextResponse.json({ produkte, touchpoints }, { status: 200 });
}
