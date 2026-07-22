// API: Challenge-Registrierung — erstellt Auth-User + Profil + Teilnahme
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';

interface Body {
  vorname: string;
  nachname: string;
  email: string;
  passwort: string;
  handynummer?: string;
  buddy_gewuenscht: boolean;
  dsgvo_marketing: boolean;
  dsgvo_affiliate: boolean;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request.' }, { status: 400 });
  }

  const { vorname, nachname, email, passwort, handynummer, buddy_gewuenscht, dsgvo_marketing, dsgvo_affiliate } = body;

  // Validierung
  if (!vorname?.trim() || !nachname?.trim() || !email?.trim() || !passwort) {
    return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
  }
  if (passwort.length < 8) {
    return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 });
  }
  if (!dsgvo_marketing || !dsgvo_affiliate) {
    return NextResponse.json({ error: 'Bitte beide Einwilligungen bestätigen.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // 1. Auth-User anlegen (sendet Bestätigungsmail)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password: passwort,
    email_confirm: false, // User muss E-Mail bestätigen
    user_metadata: { vorname: vorname.trim(), nachname: nachname.trim() },
  });

  if (authError) {
    if (authError.message.toLowerCase().includes('already')) {
      return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 409 });
    }
    console.error('Auth error:', authError);
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen. Bitte erneut versuchen.' }, { status: 500 });
  }

  const userId = authData.user.id;

  // 2. Profil anlegen
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    vorname: vorname.trim(),
    nachname: nachname.trim(),
    email: email.trim().toLowerCase(),
    handynummer: handynummer?.trim() || null,
    buddy_gewuenscht,
    dsgvo_marketing,
    dsgvo_affiliate,
    dsgvo_at: new Date().toISOString(),
  });

  if (profileError) {
    // Rollback Auth-User
    await supabase.auth.admin.deleteUser(userId);
    console.error('Profile error:', profileError);
    return NextResponse.json({ error: 'Profil konnte nicht gespeichert werden.' }, { status: 500 });
  }

  // 3. Aktive/offene Challenge suchen
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id')
    .eq('ist_offen', true)
    .order('start_datum', { ascending: true })
    .limit(1)
    .maybeSingle();

  // 4. Teilnahme anlegen (falls Challenge vorhanden)
  let referral_code: string | null = null;
  if (challenge) {
    const { data: teilnahme } = await supabase
      .from('challenge_teilnahmen')
      .insert({
        user_id: userId,
        challenge_id: challenge.id,
        status: 'pre_registered',
      })
      .select('referral_code')
      .single();

    referral_code = teilnahme?.referral_code ?? null;
  }

  return NextResponse.json({ ok: true, referral_code }, { status: 201 });
}
