// API: Masteradmin-Übersicht aller registrierten User + ihrer Teilnahme.
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { getUserFromAuthHeader } from '@/lib/apiAuth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 });
  }

  const supabase = getServiceClient();

  const { data: callerProfile } = await supabase.from('profiles').select('ist_admin').eq('id', user.id).maybeSingle();
  if (!callerProfile?.ist_admin) {
    return NextResponse.json({ error: 'Kein Zugriff.' }, { status: 403 });
  }

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, vorname, nachname, email, ist_admin, created_at')
    .order('created_at', { ascending: false });

  if (profilesError) {
    console.error('Admin users lookup error:', profilesError);
    return NextResponse.json({ error: 'Konnte User nicht laden.' }, { status: 500 });
  }

  const { data: teilnahmen, error: teilnahmenError } = await supabase
    .from('challenge_teilnahmen')
    .select('user_id, status, gesamt_score, joined_at, challenges ( name )');

  if (teilnahmenError) {
    console.error('Admin teilnahmen lookup error:', teilnahmenError);
    return NextResponse.json({ error: 'Konnte Teilnahmen nicht laden.' }, { status: 500 });
  }

  const teilnahmeByUser = new Map<string, (typeof teilnahmen)[number]>();
  for (const t of teilnahmen ?? []) {
    // Neueste Teilnahme pro User behalten.
    const existing = teilnahmeByUser.get(t.user_id);
    if (!existing || new Date(t.joined_at) > new Date(existing.joined_at)) {
      teilnahmeByUser.set(t.user_id, t);
    }
  }

  const users = (profiles ?? []).map((p) => {
    const t = teilnahmeByUser.get(p.id);
    const challenge = Array.isArray(t?.challenges) ? t?.challenges[0] : t?.challenges;
    return {
      id: p.id,
      vorname: p.vorname,
      nachname: p.nachname,
      email: p.email,
      ist_admin: p.ist_admin,
      created_at: p.created_at,
      challenge_name: challenge?.name ?? null,
      status: t?.status ?? null,
      gesamt_score: t?.gesamt_score ?? 0,
    };
  });

  return NextResponse.json({ users }, { status: 200 });
}
