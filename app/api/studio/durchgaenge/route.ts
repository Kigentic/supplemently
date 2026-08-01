// API: Challenge-Durchgänge eines Studios anlegen + auflisten.
// Ein "Durchgang" ist ein konkreter Lauf einer Challenge mit Startdatum
// (immer fest 8 Wochen, siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md Schritt 6 —
// bewusst nicht variabel, um mit den Wocheninhalten nicht durcheinanderzukommen).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope, hasAdminAccess } from '@/lib/apiAuth';

export const runtime = 'nodejs';

const WOCHEN_ANZAHL = 8;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Löst die Ziel-Studio-ID auf: explizit übergeben (nur wenn im eigenen Scope)
 * oder, falls eindeutig, das einzige Studio des Callers. */
function resolveStudioId(scope: { isMasterAdmin: boolean; studioIds: string[] }, requested?: string): string | { error: string } {
  if (requested) {
    if (scope.isMasterAdmin || scope.studioIds.includes(requested)) return requested;
    return { error: 'Kein Zugriff auf dieses Studio.' };
  }
  if (scope.studioIds.length === 1) return scope.studioIds[0];
  if (scope.studioIds.length === 0) return { error: 'Dir ist kein Studio zugeordnet.' };
  return { error: 'Bitte Studio angeben — dir sind mehrere Studios zugeordnet.' };
}

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!hasAdminAccess(scope)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const requestedStudioId = searchParams.get('studioId') ?? undefined;
  const resolved = resolveStudioId(scope, requestedStudioId);
  if (typeof resolved !== 'string') return NextResponse.json({ error: resolved.error }, { status: 400 });

  const { data, error } = await supabase
    .from('challenges')
    .select('id, name, slug, start_datum, end_datum, wochen_anzahl, ist_aktiv, ist_offen, challenge_typen ( name )')
    .eq('studio_id', resolved)
    .order('start_datum', { ascending: false });

  if (error) {
    console.error('Durchgänge lookup error:', error);
    return NextResponse.json({ error: 'Durchgänge konnten nicht geladen werden.' }, { status: 500 });
  }

  const durchgaenge = (data ?? []).map((c) => {
    const typ = Array.isArray(c.challenge_typen) ? c.challenge_typen[0] : c.challenge_typen;
    return {
      id: c.id,
      name: c.name,
      challengeTypName: typ?.name ?? null,
      startDatum: c.start_datum,
      endDatum: c.end_datum,
      wochenAnzahl: c.wochen_anzahl,
      istAktiv: c.ist_aktiv,
      istOffen: c.ist_offen,
    };
  });

  return NextResponse.json({ durchgaenge }, { status: 200 });
}

export async function POST(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });

  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!hasAdminAccess(scope)) return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });

  let body: { studioId?: string; challengeTypId?: string; startDatum?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request.' }, { status: 400 });
  }

  const resolved = resolveStudioId(scope, body.studioId);
  if (typeof resolved !== 'string') return NextResponse.json({ error: resolved.error }, { status: 400 });
  const studioId = resolved;

  if (!body.challengeTypId) {
    return NextResponse.json({ error: 'Bitte einen Challenge-Typ auswählen.' }, { status: 400 });
  }
  if (!body.startDatum || Number.isNaN(new Date(body.startDatum).getTime())) {
    return NextResponse.json({ error: 'Bitte ein gültiges Startdatum angeben.' }, { status: 400 });
  }

  // Challenge-Typ muss für dieses Studio gebucht sein.
  const [{ data: buchung }, { data: typ }, { data: studio }] = await Promise.all([
    supabase
      .from('studio_challenge_typen')
      .select('challenge_typ_id')
      .eq('studio_id', studioId)
      .eq('challenge_typ_id', body.challengeTypId)
      .maybeSingle(),
    supabase.from('challenge_typen').select('name, slug').eq('id', body.challengeTypId).maybeSingle(),
    supabase.from('studios').select('slug').eq('id', studioId).maybeSingle(),
  ]);

  if (!buchung || !typ || !studio) {
    return NextResponse.json({ error: 'Dieser Challenge-Typ ist für dein Studio nicht gebucht.' }, { status: 400 });
  }

  const startDatum = new Date(body.startDatum);
  const endDatum = new Date(startDatum);
  endDatum.setDate(endDatum.getDate() + WOCHEN_ANZAHL * 7);

  const startFormatted = startDatum.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const name = `${typ.name} – Start ${startFormatted}`;

  const baseSlug = slugify(`${studio.slug}-${typ.slug}-${body.startDatum}`);
  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase.from('challenges').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: challenge, error: insertError } = await supabase
    .from('challenges')
    .insert({
      name,
      slug,
      start_datum: startDatum.toISOString().slice(0, 10),
      end_datum: endDatum.toISOString().slice(0, 10),
      wochen_anzahl: WOCHEN_ANZAHL,
      studio_id: studioId,
      challenge_typ_id: body.challengeTypId,
      ist_aktiv: true,
      ist_offen: true,
      paywall_aktiv: false,
      preis_cent: 0,
    })
    .select('id, name, slug, start_datum, end_datum')
    .single();

  if (insertError || !challenge) {
    console.error('Durchgang create error:', insertError);
    return NextResponse.json({ error: 'Durchgang konnte nicht angelegt werden.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, durchgang: challenge }, { status: 201 });
}
