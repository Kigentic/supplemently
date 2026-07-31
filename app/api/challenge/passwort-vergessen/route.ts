// API: Passwort-Reset anfordern — generiert einen sicheren Supabase-
// Recovery-Link, verschickt ihn aber über Resend statt Supabases
// Standard-Mail (gleiches Muster wie die Bestätigungsmail bei der
// Registrierung, siehe lib/email.ts).
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabaseServer';
import { sendPasswordResetEmail } from '@/lib/email';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app';

export async function POST(req: Request) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültiger Request.' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Bitte eine gültige E-Mail-Adresse angeben.' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // Bewusst immer "ok" zurückgeben, unabhängig davon, ob die E-Mail existiert —
  // sonst ließe sich über die Antwort herausfinden, welche Adressen registriert sind.
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${SITE_URL}/challenge/passwort-zuruecksetzen` },
  });

  if (linkError || !linkData) {
    console.error('Recovery-Link error (evtl. unbekannte E-Mail):', linkError);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('vorname')
    .eq('email', email)
    .maybeSingle();

  try {
    await sendPasswordResetEmail({
      to: email,
      vorname: profile?.vorname || 'du',
      resetLink: linkData.properties.action_link,
    });
  } catch (err) {
    console.error('Resend error (Passwort-Reset):', err);
    // Trotzdem "ok" — kein Hinweis auf internen Mailversand-Fehler nach außen.
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
