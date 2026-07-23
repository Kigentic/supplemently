// API: Challenge-Registrierung — erstellt Auth-User + Profil + Teilnahme
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServiceClient } from '@/lib/supabaseServer';

// Eigener Anon-Client für signUp — nur signUp (nicht admin.createUser) löst
// den Versand der Supabase-Bestätigungsmail aus.
function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase ENV-Variablen fehlen.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

interface Body {
  vorname: string;
  nachname: string;
  email: string;
  passwort: string;
  handynummer?: string;
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

  const { vorname, nachname, email, passwort, handynummer, dsgvo_marketing, dsgvo_affiliate } = body;

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
  const anon = getAnonClient();

  // 1. Auth-User per signUp anlegen — nur signUp verschickt die Bestätigungsmail.
  const origin = req.nextUrl.origin;
  const { data: authData, error: authError } = await anon.auth.signUp({
    email: email.trim().toLowerCase(),
    password: passwort,
    options: {
      data: { vorname: vorname.trim(), nachname: nachname.trim() },
      emailRedirectTo: `${origin}/challenge/registrierung`,
    },
  });

  if (authError) {
    console.error('Auth error:', authError);
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen. Bitte erneut versuchen.' }, { status: 500 });
  }
  if (!authData.user) {
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen. Bitte erneut versuchen.' }, { status: 500 });
  }
  // Supabase gibt bei bereits registrierter, bestätigter E-Mail aus
  // Sicherheitsgründen keinen Fehler zurück, sondern ein User-Objekt ohne Identities.
  if (authData.user.identities && authData.user.identities.length === 0) {
    return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 409 });
  }

  const userId = authData.user.id;

  // 2. Profil anlegen (upsert: erneuter Versuch nach nicht angekommener Mail darf nicht scheitern)
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    vorname: vorname.trim(),
    nachname: nachname.trim(),
    email: email.trim().toLowerCase(),
    handynummer: handynummer?.trim() || null,
    dsgvo_marketing,
    dsgvo_affiliate,
    dsgvo_at: new Date().toISOString(),
  });

  if (profileError) {
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
      .upsert(
        { user_id: userId, challenge_id: challenge.id, status: 'pre_registered' },
        { onConflict: 'user_id,challenge_id', ignoreDuplicates: false }
      )
      .select('referral_code')
      .single();

    referral_code = teilnahme?.referral_code ?? null;
  }

  return NextResponse.json({ ok: true, referral_code }, { status: 201 });
}
