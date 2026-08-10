// API: liest die beim Onboarding berechnete Supplement-Empfehlung
// (supplement_empfehlungen.match_result) für die eigene (neueste) Teilnahme.
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
    .select('id, onboarding_antworten')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!teilnahme) {
    return NextResponse.json({ ergebnis: null, antworten: null }, { status: 200 });
  }

  const { data: empfehlung, error } = await supabase
    .from('supplement_empfehlungen')
    .select('match_result')
    .eq('teilnahme_id', teilnahme.id)
    .maybeSingle();

  if (error) {
    console.error('Supplement-Empfehlung lookup error:', error);
    return NextResponse.json({ error: 'Empfehlung konnte nicht geladen werden.' }, { status: 500 });
  }

  // Prozis-Rabattcode direkt bei der Supplement-Empfehlung anzeigen — genau
  // der Moment, in dem er relevant ist.
  const { data: prozis } = await supabase
    .from('affiliate_links')
    .select('partner_name, produkt_name, beschreibung, url, rabattcode')
    .eq('partner_name', 'Prozis')
    .eq('ist_aktiv', true)
    .maybeSingle();

  return NextResponse.json(
    { ergebnis: empfehlung?.match_result ?? null, antworten: teilnahme.onboarding_antworten ?? null, prozis: prozis ?? null },
    { status: 200 }
  );
}
