// GET /api/session/:sessionId — lädt ergebnis + antworten für die Ergebnisseite.

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
  if (!isUuid) return NextResponse.json({ error: 'Ungültige Session-ID.' }, { status: 400 });

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('sessions')
    .select('ergebnis, antworten')
    .eq('id', sessionId)
    .maybeSingle();

  if (error || !data) return NextResponse.json({ error: 'Session nicht gefunden.' }, { status: 404 });

  return NextResponse.json({ ergebnis: data.ergebnis, antworten: data.antworten });
}
