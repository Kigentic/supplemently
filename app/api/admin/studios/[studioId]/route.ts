// API: Einzelnes Studio sperren/entsperren oder komplett löschen (inkl.
// aller Teilnehmer-Accounts) — nur Masteradmin. "Sperren" wirkt sofort auf
// ALLE laufenden Teilnehmer (auch bereits aktive, nicht nur neue Anmeldungen)
// — bewusste Entscheidung, siehe Chat-Verlauf/Commit-Message. Sperren merkt
// sich den bisherigen Status pro Teilnahme (status_vor_sperre) und stellt ihn
// beim Entsperren exakt wieder her, statt pauschal alles auf 'aktiv' zu setzen.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader, getAdminScope } from '@/lib/apiAuth';

export const runtime = 'nodejs';

async function requireMasterAdmin(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) return { error: NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 }) };
  const supabase = getServiceClient();
  const scope = await getAdminScope(supabase, user.id);
  if (!scope.isMasterAdmin) {
    return { error: NextResponse.json({ error: 'Nur der Masteradmin darf das.' }, { status: 403 }) };
  }
  return { user, supabase };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ studioId: string }> }) {
  const auth = await requireMasterAdmin(req);
  if (auth.error) return auth.error;
  const { supabase } = auth;
  const { studioId } = await params;

  let body: { action?: 'sperren' | 'freischalten' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request.' }, { status: 400 });
  }

  if (body.action !== 'sperren' && body.action !== 'freischalten') {
    return NextResponse.json({ error: 'Ungültige Aktion.' }, { status: 400 });
  }

  const { data: studio } = await supabase.from('studios').select('id').eq('id', studioId).maybeSingle();
  if (!studio) return NextResponse.json({ error: 'Studio nicht gefunden.' }, { status: 404 });

  const { data: challenges } = await supabase.from('challenges').select('id').eq('studio_id', studioId);
  const challengeIds = (challenges ?? []).map((c) => c.id);

  if (body.action === 'sperren') {
    const { error: studioError } = await supabase.from('studios').update({ gesperrt: true }).eq('id', studioId);
    if (studioError) {
      console.error('Studio sperren error:', studioError);
      return NextResponse.json({ error: 'Studio konnte nicht gesperrt werden.' }, { status: 500 });
    }

    if (challengeIds.length > 0) {
      // Nur Teilnahmen sperren, die gerade "laufen" (aktiv/pre_registered) —
      // abgeschlossene/abgebrochene Challenges bleiben unangetastet.
      const { data: betroffene } = await supabase
        .from('challenge_teilnahmen')
        .select('id, status')
        .in('challenge_id', challengeIds)
        .in('status', ['aktiv', 'pre_registered']);

      for (const t of betroffene ?? []) {
        await supabase
          .from('challenge_teilnahmen')
          .update({ status: 'gesperrt', status_vor_sperre: t.status })
          .eq('id', t.id);
      }
    }

    return NextResponse.json({ ok: true, gesperrt: true }, { status: 200 });
  }

  // action === 'freischalten' (entsperren)
  const { error: studioError } = await supabase.from('studios').update({ gesperrt: false }).eq('id', studioId);
  if (studioError) {
    console.error('Studio freischalten error:', studioError);
    return NextResponse.json({ error: 'Studio konnte nicht entsperrt werden.' }, { status: 500 });
  }

  if (challengeIds.length > 0) {
    const { data: gesperrte } = await supabase
      .from('challenge_teilnahmen')
      .select('id, status_vor_sperre')
      .in('challenge_id', challengeIds)
      .eq('status', 'gesperrt');

    for (const t of gesperrte ?? []) {
      await supabase
        .from('challenge_teilnahmen')
        .update({ status: t.status_vor_sperre ?? 'aktiv', status_vor_sperre: null })
        .eq('id', t.id);
    }
  }

  return NextResponse.json({ ok: true, gesperrt: false }, { status: 200 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ studioId: string }> }) {
  const auth = await requireMasterAdmin(req);
  if (auth.error) return auth.error;
  const { user, supabase } = auth;
  const { studioId } = await params;

  const { data: studio } = await supabase.from('studios').select('id, name').eq('id', studioId).maybeSingle();
  if (!studio) return NextResponse.json({ error: 'Studio nicht gefunden.' }, { status: 404 });

  const { data: challenges } = await supabase.from('challenges').select('id').eq('studio_id', studioId);
  const challengeIds = (challenges ?? []).map((c) => c.id);

  if (challengeIds.length > 0) {
    const { data: teilnahmen } = await supabase
      .from('challenge_teilnahmen')
      .select('user_id')
      .in('challenge_id', challengeIds);

    const userIds = Array.from(new Set((teilnahmen ?? []).map((t) => t.user_id)));

    for (const userId of userIds) {
      if (userId === user.id) continue; // niemals den eigenen Account mitreißen

      // Sicherheitsnetz: Nutzer, die ZUSÄTZLICH bei einem anderen Studio
      // mitmachen, werden nicht komplett gelöscht (kollateraler Datenverlust
      // beim fremden Studio) — nur ihre Teilnahmen an DIESEM Studio.
      const { data: alleTeilnahmen } = await supabase
        .from('challenge_teilnahmen')
        .select('id, challenges ( studio_id )')
        .eq('user_id', userId);
      const andereStudios = (alleTeilnahmen ?? []).some((t) => {
        const challenge = Array.isArray(t.challenges) ? t.challenges[0] : t.challenges;
        return challenge?.studio_id && challenge.studio_id !== studioId;
      });

      const { data: profile } = await supabase.from('profiles').select('ist_admin').eq('id', userId).maybeSingle();
      if (profile?.ist_admin) continue; // Admin-Accounts nie automatisch löschen

      if (andereStudios) {
        // Nur die Teilnahmen an DIESEM Studio entfernen, Account bleibt bestehen.
        await supabase.from('challenge_teilnahmen').delete().eq('user_id', userId).in('challenge_id', challengeIds);
      } else {
        const { error: delError } = await supabase.auth.admin.deleteUser(userId);
        if (delError) console.error(`User ${userId} delete error (Studio-Löschung):`, delError);
      }
    }

    const { error: challengesDeleteError } = await supabase.from('challenges').delete().in('id', challengeIds);
    if (challengesDeleteError) {
      console.error('Challenges delete error (Studio-Löschung):', challengesDeleteError);
      return NextResponse.json({ error: 'Durchgänge konnten nicht gelöscht werden.' }, { status: 500 });
    }
  }

  const { error: studioDeleteError } = await supabase.from('studios').delete().eq('id', studioId);
  if (studioDeleteError) {
    console.error('Studio delete error:', studioDeleteError);
    return NextResponse.json({ error: 'Studio konnte nicht gelöscht werden.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
