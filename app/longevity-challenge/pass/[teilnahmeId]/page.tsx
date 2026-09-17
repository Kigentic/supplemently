// Challenge-Pass: öffentliche Bestätigungsseite nach Registrierung — Ticket-
// Gefühl statt Formular-Quittung (siehe Roadmap Phase D). QR-Code führt
// direkt zur Studio-Check-in-Ansicht (app/challenge/admin/pass), die den
// Zugang per Klick aktiviert. Nur unkritische Daten (Vorname, Challenge,
// Studio, Reservierungsstatus) — keine Gesundheitsdaten auf dieser Seite.
import QRCode from 'qrcode';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getServiceClient } from '@/lib/supabaseServer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://supplemently.vercel.app';

export const metadata = {
  title: 'Dein Challenge-Pass',
};

async function loadPass(teilnahmeId: string) {
  const supabase = getServiceClient();
  const { data: teilnahme, error } = await supabase
    .from('challenge_teilnahmen')
    .select('id, user_id, status, challenges ( name, studios ( name ) )')
    .eq('id', teilnahmeId)
    .maybeSingle();

  if (error || !teilnahme) return null;

  const { data: profile } = await supabase.from('profiles').select('vorname').eq('id', teilnahme.user_id).maybeSingle();
  const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
  const studio = Array.isArray(challenge?.studios) ? challenge?.studios[0] : challenge?.studios;

  // reserviert_bis separat & fehlertolerant laden — Spalte existiert erst
  // nach Migration 0033, soll den Pass bis dahin aber nicht komplett blocken.
  let reserviertBis: string | null = null;
  try {
    const { data: reservData } = await supabase
      .from('challenge_teilnahmen')
      .select('reserviert_bis')
      .eq('id', teilnahmeId)
      .maybeSingle();
    reserviertBis = (reservData as { reserviert_bis?: string } | null)?.reserviert_bis ?? null;
  } catch {
    reserviertBis = null;
  }

  return {
    id: teilnahme.id,
    status: teilnahme.status as string,
    reserviertBis,
    vorname: profile?.vorname ?? null,
    challengeName: challenge?.name ?? 'Longevity Challenge',
    studioName: studio?.name ?? 'dein Studio',
  };
}

export default async function ChallengePassPage({ params }: { params: Promise<{ teilnahmeId: string }> }) {
  const { teilnahmeId } = await params;
  const pass = await loadPass(teilnahmeId);

  if (!pass) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader showNavLinks={false} />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <h1 className="text-3xl font-semibold text-text">Pass nicht gefunden</h1>
          <p className="mt-4 text-text-muted">
            Dieser Challenge-Pass existiert nicht (mehr). Falls du dich gerade angemeldet hast, prüfe deine Bestätigungsmail.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const checkinUrl = `${SITE_URL}/challenge/admin/pass?tid=${pass.id}`;
  const qrSvg = await QRCode.toString(checkinUrl, { type: 'svg', margin: 1, width: 240, color: { dark: '#3a3a3a', light: '#ffffff' } });
  const bereitsAktiv = pass.status === 'aktiv';

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader showNavLinks={false} />

      <main className="mx-auto max-w-xl px-5 py-16 sm:py-20">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">🎟️</div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Dein Platz ist reserviert</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {pass.vorname ? `Willkommen, ${pass.vorname}!` : 'Willkommen!'}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            {bereitsAktiv
              ? 'Deine Teilnahme ist aktiv — du kannst direkt starten.'
              : 'Dein Platz für die Longevity Challenge ist vorreserviert. Zeig diesen Pass im Studio vor, um deine Teilnahme zu aktivieren.'}
          </p>
        </div>

        <div className="rounded-3xl bg-surface p-7 text-center sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{pass.studioName}</p>
          <h2 className="mt-1 text-xl font-semibold text-text">{pass.challengeName}</h2>

          <div className="mx-auto my-6 w-fit rounded-2xl bg-white p-4" dangerouslySetInnerHTML={{ __html: qrSvg }} />

          <div
            className={
              'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium ' +
              (bereitsAktiv ? 'bg-green-100 text-green-700' : 'bg-accent/10 text-accent')
            }
          >
            <span className={'h-2 w-2 rounded-full ' + (bereitsAktiv ? 'bg-green-500' : 'bg-accent')} />
            {bereitsAktiv ? 'Aktiv' : 'Reserviert — noch nicht aktiviert'}
          </div>

          {pass.reserviertBis && !bereitsAktiv && (
            <p className="mt-3 text-xs text-text-muted">
              Gültig bis {new Date(pass.reserviertBis).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
          )}
        </div>

        {!bereitsAktiv && (
          <div className="mt-6 rounded-2xl border border-outline/40 p-5">
            <p className="text-sm font-semibold text-text">So geht's weiter</p>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-text-muted">
              <li>1. Speichere diese Seite oder den QR-Code (Screenshot).</li>
              <li>2. Geh damit ins Studio, sobald du bereit bist zu starten.</li>
              <li>3. Der QR-Code wird gescannt — deine Teilnahme wird direkt aktiviert.</li>
            </ol>
          </div>
        )}

        {bereitsAktiv && (
          <div className="mt-6 text-center">
            <Link href="/challenge/wochenansicht" className="inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover">
              Zur Wochenansicht →
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
