// API: Challenge-Registrierung — erstellt Auth-User + Profil + Teilnahme
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { sendConfirmationEmail } from '@/lib/email';

// Feste Produktions-URL statt req.nextUrl.origin — sonst landen
// Bestätigungslinks bei lokalem Testen auf localhost.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app';

interface Body {
  vorname: string;
  nachname: string;
  email: string;
  passwort: string;
  handynummer?: string;
  dsgvo_marketing: boolean;
  dsgvo_affiliate: boolean;
}

export async function POST(req: Request) {
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

  // 1. Auth-User anlegen + Bestätigungslink generieren (KEIN automatischer
  // Mailversand durch Supabase — wir verschicken die Mail selbst über Resend).
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: email.trim().toLowerCase(),
    password: passwort,
    options: {
      data: { vorname: vorname.trim(), nachname: nachname.trim() },
      redirectTo: `${SITE_URL}/challenge/registrierung`,
    },
  });

  if (linkError) {
    if (linkError.message.toLowerCase().includes('already been registered')) {
      return NextResponse.json({ error: 'Diese E-Mail-Adresse ist bereits registriert.' }, { status: 409 });
    }
    console.error('Auth error:', linkError);
    return NextResponse.json({ error: 'Registrierung fehlgeschlagen. Bitte erneut versuchen.' }, { status: 500 });
  }

  const userId = linkData.user.id;
  const confirmLink = linkData.properties.action_link;

  // 2. Bestätigungsmail über Resend verschicken (eigenes Branding statt "Supabase Auth")
  try {
    await sendConfirmationEmail({ to: email.trim().toLowerCase(), vorname: vorname.trim(), confirmLink });
  } catch (err) {
    console.error('Resend error:', err);
    return NextResponse.json(
      { error: 'Bestätigungsmail konnte nicht versendet werden. Bitte erneut versuchen.' },
      { status: 500 }
    );
  }

  // 3. Profil anlegen (upsert: erneuter Versuch nach nicht angekommener Mail darf nicht scheitern)
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

  // 4. Aktive/offene Challenge suchen
  const { data: challenge } = await supabase
    .from('challenges')
    .select('id')
    .eq('ist_offen', true)
    .order('start_datum', { ascending: true })
    .limit(1)
    .maybeSingle();

  // 5. Teilnahme anlegen (falls Challenge vorhanden)
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
