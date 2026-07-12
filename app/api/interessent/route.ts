// Supplemently — Lead-Erfassung von der Landingpage.
// POST /api/interessent  -> schreibt in public.interessenten

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

export const runtime = 'nodejs';

function clean(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 });
  }

  const studioname = clean(body?.studioname, 200);
  const ansprechpartner = clean(body?.ansprechpartner, 200);
  const email = clean(body?.email, 200);
  const telefon = clean(body?.telefon, 100);
  const nachricht = clean(body?.nachricht, 2000);

  if (!studioname) return NextResponse.json({ error: 'Studioname ist erforderlich.' }, { status: 400 });
  if (!ansprechpartner) return NextResponse.json({ error: 'Ansprechpartner ist erforderlich.' }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return NextResponse.json({ error: 'Bitte eine gültige E-Mail angeben.' }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase
    .from('interessenten')
    .insert({ studioname, ansprechpartner, email, telefon, nachricht });

  if (error) {
    return NextResponse.json({ error: 'Speichern fehlgeschlagen.', detail: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
