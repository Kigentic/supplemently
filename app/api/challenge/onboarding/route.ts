// API: Challenge-Onboarding — berechnet das Matching, speichert es aber nur
// beim User statt es sofort auszugeben. Sichtbar wird es erst im Dashboard.
// Die eigentliche Logik lebt in lib/onboarding.ts (geteilt mit dem
// Registrierungs-Endpunkt, der den Fragebogen bereits vor der Registrierung
// mit ausliefert).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';
import { runOnboarding } from '@/lib/onboarding';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const result = await runOnboarding(supabase, user.id, body?.antworten);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true }, { status: 200 });
}
