// API: Registrierung für einen konkreten Challenge-Durchgang eines Studios
// (Anmeldelink /anmelden/[slug]). Erstellt Auth-User + Profil + Teilnahme wie
// die B2C-Registrierung, aber gegen einen expliziten Durchgang statt "die
// eine offene Turnkiste-Challenge". Teilnahme bleibt 'pre_registered', bis
// das Studio manuell freischaltet (kein automatisiertes Payment über uns —
// siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { sendDurchgangConfirmationEmail, sendNeueRegistrierungEmail } from '@/lib/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app';

interface Body {
  vorname: string;
  nachname: string;
  email: string;
  passwort: string;
  handynummer?: string;
  dsgvo_marketing: boolean;
  dsgvo_affiliate: boolean;
  ref?: string;
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request.' }, { status: 400 });
  }

  const { vorname, nachname, email, passwort, handynummer, dsgvo_marketing, dsgvo_affiliate, ref } = body;

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

  const { data: challenge } = await supabase
    .from('challenges')
    .select('id, name, ist_offen, studios ( name, kontakt_email )')
    .eq('slug', slug)
    .maybeSingle();

  if (!challenge || !challenge.ist_offen) {
    return NextResponse.json({ error: 'Dieser Durchgang ist nicht (mehr) offen für Anmeldungen.' }, { status: 404 });
  }
  const studio = Array.isArray(challenge.studios) ? challenge.studios[0] : challenge.studios;

  // Empfehlungslink: nur gültig, wenn er auf eine Teilnahme desselben
  // Durchgangs zeigt (verhindert Missbrauch über Challenge-Grenzen hinweg).
  let empfohlenVonTeilnahmeId: string | null = null;
  if (ref) {
    const { data: referrer } = await supabase
      .from('challenge_teilnahmen')
      .select('id')
      .eq('id', ref)
      .eq('challenge_id', challenge.id)
      .maybeSingle();
    empfohlenVonTeilnahmeId = referrer?.id ?? null;
  }

  // 1. Auth-User anlegen + Bestätigungslink generieren.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: email.trim().toLowerCase(),
    password: passwort,
    options: {
      data: { vorname: vorname.trim(), nachname: nachname.trim() },
      redirectTo: `${SITE_URL}/anmelden/${slug}`,
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

  // 2. Bestätigungsmail über Resend.
  try {
    await sendDurchgangConfirmationEmail({
      to: email.trim().toLowerCase(),
      vorname: vorname.trim(),
      studioName: studio?.name ?? 'dein Studio',
      durchgangName: challenge.name,
      confirmLink,
    });
  } catch (err) {
    console.error('Resend error:', err);
    return NextResponse.json(
      { error: 'Bestätigungsmail konnte nicht versendet werden. Bitte erneut versuchen.' },
      { status: 500 }
    );
  }

  // 3. Profil anlegen.
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

  // 4. Teilnahme anlegen — bleibt 'pre_registered' bis das Studio manuell freischaltet.
  const { error: teilnahmeError } = await supabase
    .from('challenge_teilnahmen')
    .upsert(
      { user_id: userId, challenge_id: challenge.id, status: 'pre_registered', empfohlen_von_teilnahme_id: empfohlenVonTeilnahmeId },
      { onConflict: 'user_id,challenge_id', ignoreDuplicates: false }
    );
  if (teilnahmeError) {
    console.error('Teilnahme error:', teilnahmeError);
    return NextResponse.json({ error: 'Teilnahme konnte nicht angelegt werden.' }, { status: 500 });
  }

  // 5. Studio per Mail benachrichtigen (best effort — Registrierung ist auch
  //    ohne diese Mail gültig).
  if (studio?.kontakt_email) {
    try {
      await sendNeueRegistrierungEmail({
        to: studio.kontakt_email,
        studioName: studio.name,
        durchgangName: challenge.name,
        teilnehmerName: `${vorname.trim()} ${nachname.trim()}`,
        teilnehmerEmail: email.trim().toLowerCase(),
      });
    } catch (err) {
      console.error('Studio-Benachrichtigung error:', err);
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
