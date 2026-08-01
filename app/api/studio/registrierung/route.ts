// API: Studio-Registrierung (B2B) — erstellt Auth-User für den Ansprechpartner,
// ein Studio, die Studio-Admin-Verknüpfung und die Buchung des gewählten
// Challenge-Typs. Kein Payment (siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md
// Schritt 6 — bewusst erstmal weggelassen).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { sendStudioConfirmationEmail } from '@/lib/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app';

interface Body {
  studioName: string;
  ansprechpartnerVorname: string;
  ansprechpartnerNachname: string;
  email: string;
  telefon?: string;
  passwort: string;
  challengeTypId: string;
  dsgvo: boolean;
}

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

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request.' }, { status: 400 });
  }

  const { studioName, ansprechpartnerVorname, ansprechpartnerNachname, email, telefon, passwort, challengeTypId, dsgvo } = body;

  if (!studioName?.trim() || !ansprechpartnerVorname?.trim() || !ansprechpartnerNachname?.trim() || !email?.trim() || !passwort) {
    return NextResponse.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 });
  }
  if (passwort.length < 8) {
    return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen haben.' }, { status: 400 });
  }
  if (!challengeTypId) {
    return NextResponse.json({ error: 'Bitte einen Challenge-Typ auswählen.' }, { status: 400 });
  }
  if (!dsgvo) {
    return NextResponse.json({ error: 'Bitte die Datenschutzbestimmungen akzeptieren.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { data: typ } = await supabase.from('challenge_typen').select('id').eq('id', challengeTypId).maybeSingle();
  if (!typ) {
    return NextResponse.json({ error: 'Ungültiger Challenge-Typ.' }, { status: 400 });
  }

  // 1. Auth-User für den Ansprechpartner anlegen + Bestätigungslink generieren
  //    (kein automatischer Supabase-Mailversand — eigene Mail über Resend).
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email: email.trim().toLowerCase(),
    password: passwort,
    options: {
      data: { vorname: ansprechpartnerVorname.trim(), nachname: ansprechpartnerNachname.trim() },
      redirectTo: `${SITE_URL}/studio/registrierung`,
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

  // 2. Bestätigungsmail über Resend verschicken.
  try {
    await sendStudioConfirmationEmail({
      to: email.trim().toLowerCase(),
      ansprechpartnerVorname: ansprechpartnerVorname.trim(),
      studioName: studioName.trim(),
      confirmLink,
    });
  } catch (err) {
    console.error('Resend error:', err);
    return NextResponse.json(
      { error: 'Bestätigungsmail konnte nicht versendet werden. Bitte erneut versuchen.' },
      { status: 500 }
    );
  }

  // 3. Profil für den Ansprechpartner anlegen (upsert: erneuter Versuch nach
  //    nicht angekommener Mail darf nicht scheitern).
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    vorname: ansprechpartnerVorname.trim(),
    nachname: ansprechpartnerNachname.trim(),
    email: email.trim().toLowerCase(),
    handynummer: telefon?.trim() || null,
    dsgvo_marketing: dsgvo,
    dsgvo_affiliate: false,
    dsgvo_at: new Date().toISOString(),
  });
  if (profileError) {
    console.error('Profile error:', profileError);
    return NextResponse.json({ error: 'Profil konnte nicht gespeichert werden.' }, { status: 500 });
  }

  // 4. Studio anlegen — eindeutigen Slug sicherstellen (Kollision -> Suffix anhängen).
  const baseSlug = slugify(studioName) || 'studio';
  let slug = baseSlug;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existing } = await supabase.from('studios').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .insert({
      name: studioName.trim(),
      slug,
      kontakt_email: email.trim().toLowerCase(),
      ansprechpartner_vorname: ansprechpartnerVorname.trim(),
      ansprechpartner_nachname: ansprechpartnerNachname.trim(),
      telefon: telefon?.trim() || null,
      abo_status: 'trial',
    })
    .select('id')
    .single();

  if (studioError || !studio) {
    console.error('Studio create error:', studioError);
    return NextResponse.json({ error: 'Studio konnte nicht angelegt werden.' }, { status: 500 });
  }

  // 5. Ansprechpartner als Studio-Admin verknüpfen.
  const { error: adminError } = await supabase
    .from('studio_admins')
    .insert({ studio_id: studio.id, user_id: userId, rolle: 'inhaber' });
  if (adminError) {
    console.error('Studio-Admin create error:', adminError);
    return NextResponse.json({ error: 'Studio-Admin-Zuordnung fehlgeschlagen.' }, { status: 500 });
  }

  // 6. Gewählten Challenge-Typ fürs Studio buchen.
  const { error: typError } = await supabase
    .from('studio_challenge_typen')
    .insert({ studio_id: studio.id, challenge_typ_id: challengeTypId });
  if (typError) {
    console.error('Studio-Challenge-Typ error:', typError);
    return NextResponse.json({ error: 'Challenge-Typ-Zuordnung fehlgeschlagen.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
