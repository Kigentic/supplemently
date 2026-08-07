// API: Trainingsplan-Wunsch/-Fokus ändern — genutzt vom Trainingsplan-Opt-in
// und vom Wochen-Check-in ("Kommst du mit dem Plan klar?" → Wechsel).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

const FOKUS_WERTE = ['kein', 'ruecken', 'beine_po', 'bauch_core', 'fatburn'];
const ORT_WERTE = ['studio', 'zuhause'];

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const gewuenscht = body?.gewuenscht;
  const fokus = body?.fokus;
  const ort = body?.ort;

  if (typeof gewuenscht !== 'boolean') {
    return NextResponse.json({ error: 'gewuenscht (boolean) fehlt.' }, { status: 400 });
  }
  if (gewuenscht && !FOKUS_WERTE.includes(fokus)) {
    return NextResponse.json({ error: 'Ungültiger Fokus.' }, { status: 400 });
  }
  if (gewuenscht && ort !== undefined && !ORT_WERTE.includes(ort)) {
    return NextResponse.json({ error: 'Ungültiger Ort.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: teilnahme } = await supabase
    .from('challenge_teilnahmen')
    .select('id, trainingsplan_ort')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!teilnahme) return NextResponse.json({ error: 'Keine Teilnahme gefunden.' }, { status: 404 });

  // ort ist im Fokus-Picker optional mitschickbar — ohne Angabe bleibt der
  // bisherige Wert (bzw. Default 'studio') erhalten, statt ihn zu löschen.
  const neuerOrt = gewuenscht ? (ort ?? teilnahme.trainingsplan_ort ?? 'studio') : null;

  const { error } = await supabase
    .from('challenge_teilnahmen')
    .update({ trainingsplan_gewuenscht: gewuenscht, trainingsplan_ort: neuerOrt, trainingsplan_fokus: gewuenscht ? fokus : null })
    .eq('id', teilnahme.id);

  if (error) return NextResponse.json({ error: 'Speichern fehlgeschlagen.' }, { status: 500 });

  return NextResponse.json({ ok: true }, { status: 200 });
}
