// API: Challenge-Registrierung — erstellt Auth-User + Profil + Teilnahme
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { sendConfirmationEmail, sendNeueRegistrierungEmail, ADMIN_NOTIFICATION_EMAIL } from '@/lib/email';
import { getStudioIdBySlug, TURNKISTE_STUDIO_SLUG } from '@/lib/studio';
import { runOnboarding } from '@/lib/onboarding';

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
  // Value-Equation-Funnel: Fragebogen läuft VOR der Registrierung (Gast-Modus,
  // /longevity-challenge/plan) — Antworten kommen direkt hier mit statt über
  // einen zweiten, auth-pflichtigen Request an /api/challenge/onboarding.
  antworten?: unknown;
  // Welche Turnkiste-Challenge (Longevity/Abnehmen/Rücken — mehrere können
  // gleichzeitig offen sein). Ohne Angabe: älteste offene Challenge
  // (Altverhalten, deckt bestehende Aufrufer ab).
  challengeSlug?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request.' }, { status: 400 });
  }

  const { vorname, nachname, email, passwort, handynummer, dsgvo_marketing, dsgvo_affiliate, antworten, challengeSlug } = body;

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

  // 4. Aktive/offene Challenge suchen — bewusst auf Turnkiste beschränkt, damit
  //    ein neuer Challenge-Durchgang eines anderen Studios hier nicht versehentlich
  //    mitgezählt wird (dieser B2C-Flow ist nur für Turnkiste gedacht). Mit
  //    challengeSlug wird gezielt EINE der mehreren parallel offenen
  //    Challenges (Longevity/Abnehmen/Rücken) angesprochen — ohne Angabe
  //    greift der alte Fallback (älteste offene), für Altaufrufer.
  const turnkisteId = await getStudioIdBySlug(supabase, TURNKISTE_STUDIO_SLUG);
  let challengeQuery = turnkisteId
    ? supabase.from('challenges').select('id, name').eq('ist_offen', true).eq('studio_id', turnkisteId)
    : null;
  if (challengeQuery && challengeSlug) {
    challengeQuery = challengeQuery.eq('slug', challengeSlug);
  } else if (challengeQuery) {
    challengeQuery = challengeQuery.order('start_datum', { ascending: true });
  }
  const { data: challenge } = challengeQuery ? await challengeQuery.limit(1).maybeSingle() : { data: null };

  // 5. Teilnahme anlegen (falls Challenge vorhanden)
  let referral_code: string | null = null;
  let teilnahmeId: string | null = null;
  if (challenge) {
    const { data: teilnahme } = await supabase
      .from('challenge_teilnahmen')
      .upsert(
        { user_id: userId, challenge_id: challenge.id, status: 'pre_registered' },
        { onConflict: 'user_id,challenge_id', ignoreDuplicates: false }
      )
      .select('id, referral_code')
      .single();

    referral_code = teilnahme?.referral_code ?? null;
    teilnahmeId = teilnahme?.id ?? null;

    // Reservierungs-Ablauf für den Challenge-Pass (72h, siehe Roadmap Phase D)
    // — best effort: Spalte existiert erst nach Migration 0033, Fehler hier
    // darf die Registrierung nicht blockieren.
    if (teilnahmeId) {
      const reserviertBis = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
      const { error: reservErr } = await supabase
        .from('challenge_teilnahmen')
        .update({ reserviert_bis: reserviertBis })
        .eq('id', teilnahmeId);
      if (reservErr) console.error('reserviert_bis update error (Migration 0033 angewendet?):', reservErr);
    }
  }

  // 5b. Value-Equation-Funnel: Fragebogen wurde bereits vor der Registrierung
  // ausgefüllt (Gast-Modus) — Antworten jetzt direkt mitverarbeiten, kein
  // zweiter Request nötig. Fehler hier lassen den Account bestehen (Fallback:
  // Nutzer kann sich einloggen und den Fragebogen unter /fragebogen
  // nachholen), brechen die Registrierung selbst aber nicht ab.
  let onboardingError: string | null = null;
  if (antworten) {
    const result = await runOnboarding(supabase, userId, antworten);
    if (!result.ok) {
      console.error('Onboarding (im Registrierungs-Funnel) error:', result.error);
      onboardingError = result.error;
    } else {
      teilnahmeId = result.teilnahmeId;
    }
  }

  // 6. Platform-Admin per Mail benachrichtigen (best effort).
  try {
    await sendNeueRegistrierungEmail({
      to: ADMIN_NOTIFICATION_EMAIL,
      studioName: 'Turnkiste',
      durchgangName: challenge?.name ?? 'Turnkiste',
      teilnehmerName: `${vorname.trim()} ${nachname.trim()}`,
      teilnehmerEmail: email.trim().toLowerCase(),
    });
  } catch (err) {
    console.error('Admin-Benachrichtigung error:', err);
  }

  return NextResponse.json({ ok: true, referral_code, teilnahmeId, onboardingError }, { status: 201 });
}
