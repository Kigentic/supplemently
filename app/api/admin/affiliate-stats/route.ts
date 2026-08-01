// API: Masteradmin — Affiliate-Statistik. Gezeigt (Impressions) vs. Geklickt
// pro Produkt und pro Touchpoint (Kontext), berechnet aus empfehlungen_log
// + dem Klick-Zähler auf affiliate_links.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope, hasAdminAccess } from '@/lib/apiAuth';

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
  const scope = await getAdminScope(supabase, user.id);
  if (!hasAdminAccess(scope)) {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });
  }

  const { data: links, error: linksError } = await supabase
    .from('affiliate_links')
    .select('id, partner_name, produkt_name, kategorie, klicks, ist_aktiv, rabattcode')
    .order('partner_name', { ascending: true });

  if (linksError) {
    console.error('Affiliate-Stats lookup error:', linksError);
    return NextResponse.json({ error: 'Statistik konnte nicht geladen werden.' }, { status: 500 });
  }

  // Masteradmin sieht alle Impressions/Klicks. Studio-Admin nur die eigenen —
  // dafür erst die Teilnahmen der eigenen Studio(s) auflösen und den Log
  // darauf einschränken (empfehlungen_log hat keine direkte studio_id-Spalte).
  let logsQuery = supabase.from('empfehlungen_log').select('affiliate_link_id, kontext, geklickt_at');
  if (!scope.isMasterAdmin) {
    const { data: teilnahmen } = await supabase
      .from('challenge_teilnahmen')
      .select('id, challenges!inner ( studio_id )')
      .in('challenges.studio_id', scope.studioIds);
    const teilnahmeIds = (teilnahmen ?? []).map((t) => t.id);
    if (teilnahmeIds.length === 0) {
      return NextResponse.json({ produkte: [], touchpoints: [], scope: 'studio' }, { status: 200 });
    }
    logsQuery = logsQuery.in('teilnahme_id', teilnahmeIds);
  }
  const { data: logs, error: logsError } = await logsQuery;

  if (logsError) {
    console.error('Affiliate-Stats lookup error:', logsError);
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
    // Masteradmin: authoritativer globaler Zähler (RPC increment). Studio-Admin:
    // kein globaler Studio-Zähler vorhanden — aus den eigenen, bereits gescopten
    // Log-Zeilen gezählt (geklickt_at gesetzt).
    const klicks = scope.isMasterAdmin ? link.klicks : stat.klicks;
    return {
      id: link.id,
      partner_name: link.partner_name,
      produkt_name: link.produkt_name,
      kategorie: link.kategorie,
      ist_aktiv: link.ist_aktiv,
      rabattcode: link.rabattcode,
      impressions: stat.impressions,
      klicks,
      ctr: stat.impressions > 0 ? Math.round((klicks / stat.impressions) * 1000) / 10 : 0,
    };
  });

  const touchpoints = Array.from(logsByKontext.entries()).map(([kontext, stat]) => ({
    kontext,
    label: KONTEXT_LABEL[kontext] ?? kontext,
    impressions: stat.impressions,
    klicks: stat.klicks,
    ctr: stat.impressions > 0 ? Math.round((stat.klicks / stat.impressions) * 1000) / 10 : 0,
  }));

  return NextResponse.json({ produkte, touchpoints, scope: scope.isMasterAdmin ? 'all' : 'studio' }, { status: 200 });
}
