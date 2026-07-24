// Klick-Tracking-Redirect für Affiliate-Empfehlungen: markiert den
// empfehlungen_log-Eintrag als geklickt (nur beim ersten Klick), erhöht den
// Klick-Zähler des Produkts und leitet dann zur echten Partner-URL weiter.
// Bewusst ohne Auth-Check — die Log-ID ist eine unratbare UUID, der einzige
// Effekt eines "Fremdklicks" wäre ein zusätzlicher Zähler-Increment.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ empfehlungLogId: string }> }) {
  const { empfehlungLogId } = await params;
  const supabase = getServiceClient();

  const { data: log } = await supabase
    .from('empfehlungen_log')
    .select('id, geklickt_at, affiliate_link_id, affiliate_links ( url )')
    .eq('id', empfehlungLogId)
    .maybeSingle();

  const link = log ? (Array.isArray(log.affiliate_links) ? log.affiliate_links[0] : log.affiliate_links) : null;

  if (!log || !link?.url) {
    return NextResponse.redirect(new URL('/challenge/dashboard', req.url));
  }

  if (!log.geklickt_at) {
    await supabase
      .from('empfehlungen_log')
      .update({ geklickt_at: new Date().toISOString() })
      .eq('id', log.id);
    await supabase.rpc('increment_affiliate_klicks', { p_affiliate_link_id: log.affiliate_link_id });
  }

  return NextResponse.redirect(link.url);
}
