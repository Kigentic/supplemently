// API: Trainingsplan-Wunsch/-Fokus ändern — genutzt vom Trainingsplan-Opt-in
// und vom Wochen-Check-in ("Kommst du mit dem Plan klar?" → Wechsel).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

const FOKUS_WERTE = ['kein', 'ruecken', 'beine_po', 'bauch_core'];

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const gewuenscht = body?.gewuenscht;
  const fokus = body?.fokus;

  if (typeof gewuenscht !== 'boolean') {
    return NextResponse.json({ error: 'gewuenscht (boolean) fehlt.' }, { status: 400 });
  }
  if (gewuenscht && !FOKUS_WERTE.includes(fokus)) {
    return NextResponse.json({ error: 'Ungültiger Fokus.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: teilnahme } = await supabase
    .from('challenge_teilnahmen')
    .select('id')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!teilnahme) return NextResponse.json({ error: 'Keine Teilnahme gefunden.' }, { status: 404 });

  const { error } = await supabase
    .from('challenge_teilnahmen')
    .update({ trainingsplan_gewuenscht: gewuenscht, trainingsplan_fokus: gewuenscht ? fokus : null })
    .eq('id', teilnahme.id);

  if (error) return NextResponse.json({ error: 'Speichern fehlgeschlagen.' }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
