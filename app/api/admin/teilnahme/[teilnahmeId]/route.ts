// API: Einzelne Teilnahme fürs Studio-Check-in nachschlagen (QR-Scan oder
// manuelle Code-Eingabe im Admin-Bereich) — liefert die Kerndaten, die das
// Studio vor dem Freischalten sehen will (Name, Challenge, Fragebogen-
// Kurzfassung, Reservierungsstatus).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope, hasAdminAccess } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ teilnahmeId: string }> }) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!hasAdminAccess(scope)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { teilnahmeId } = await params;

  const { data: teilnahme, error } = await supabase
    .from('challenge_teilnahmen')
    .select(
      'id, user_id, status, trainingsplan_gewuenscht, trainingsplan_fokus, trainingsplan_ort, challenges ( name, studio_id, studios ( name ) )'
    )
    .eq('id', teilnahmeId)
    .maybeSingle();

  if (error || !teilnahme) {
    return NextResponse.json({ error: 'Teilnahme nicht gefunden.' }, { status: 404 });
  }

  const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
  if (!scope.isMasterAdmin && !scope.studioIds.includes(challenge?.studio_id ?? '')) {
    return NextResponse.json({ error: 'Kein Zugriff auf diese Teilnahme.' }, { status: 403 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('vorname, nachname, email')
    .eq('id', teilnahme.user_id)
    .maybeSingle();

  const studio = Array.isArray(challenge?.studios) ? challenge?.studios[0] : challenge?.studios;

  // reserviert_bis separat & fehlertolerant — Spalte existiert erst nach
  // Migration 0033, soll den Check-in bis dahin aber nicht blockieren.
  let reserviertBis: string | null = null;
  try {
    const { data: reservData } = await supabase.from('challenge_teilnahmen').select('reserviert_bis').eq('id', teilnahmeId).maybeSingle();
    reserviertBis = (reservData as { reserviert_bis?: string } | null)?.reserviert_bis ?? null;
  } catch {
    reserviertBis = null;
  }

  return NextResponse.json({
    id: teilnahme.id,
    status: teilnahme.status,
    reserviertBis,
    vorname: profile?.vorname ?? null,
    nachname: profile?.nachname ?? null,
    email: profile?.email ?? null,
    challengeName: challenge?.name ?? null,
    studioName: studio?.name ?? null,
    trainingsplanGewuenscht: teilnahme.trainingsplan_gewuenscht,
    trainingsplanFokus: teilnahme.trainingsplan_fokus,
    trainingsplanOrt: teilnahme.trainingsplan_ort,
  });
}
