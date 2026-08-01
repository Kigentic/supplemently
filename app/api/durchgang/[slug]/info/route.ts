// API: öffentliche Infos zu einem Challenge-Durchgang für die Registrierungsseite
// /anmelden/[slug]. challenges hat keine öffentliche RLS-Policy (nur
// Service-Role), daher dieser schlanke Read-Only-Endpoint.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from('challenges')
    .select('name, start_datum, wochen_anzahl, ist_offen, studios ( name ), challenge_typen ( name, beschreibung )')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('Durchgang-Info lookup error:', error);
    return NextResponse.json({ error: 'Durchgang konnte nicht geladen werden.' }, { status: 500 });
  }
  if (!data || !data.ist_offen) {
    return NextResponse.json({ error: 'Dieser Durchgang ist nicht (mehr) offen für Anmeldungen.' }, { status: 404 });
  }

  const studio = Array.isArray(data.studios) ? data.studios[0] : data.studios;
  const typ = Array.isArray(data.challenge_typen) ? data.challenge_typen[0] : data.challenge_typen;

  return NextResponse.json(
    {
      name: data.name,
      studioName: studio?.name ?? null,
      challengeTypName: typ?.name ?? null,
      challengeTypBeschreibung: typ?.beschreibung ?? null,
      startDatum: data.start_datum,
      wochenAnzahl: data.wochen_anzahl,
    },
    { status: 200 }
  );
}
