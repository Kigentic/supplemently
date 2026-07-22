// Bestätigungsseite nach erfolgreicher Registrierung — wartet auf E-Mail-Bestätigung
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

export const metadata = { title: 'Anmeldung eingegangen — Longevity Lifestyle Challenge' };

export default function BestaetigungPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-5 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
          ✓
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Anmeldung eingegangen.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          Wir haben dir eine Bestätigungsmail geschickt. Klick auf den Link darin — danach ist dein Account aktiv und du kannst den Fragebogen ausfüllen.
        </p>

        <div className="mt-8 rounded-xl border border-outline/50 bg-surface p-6 text-left">
          <p className="mb-3 text-sm font-semibold text-text">Was passiert als nächstes:</p>
          <ol className="space-y-2 text-sm text-text-muted">
            <li className="flex gap-2.5">
              <span className="flex-shrink-0 font-semibold text-accent">1.</span>
              <span>E-Mail bestätigen (Link läuft nach 24h ab)</span>
            </li>
            <li className="flex gap-2.5">
              <span className="flex-shrink-0 font-semibold text-accent">2.</span>
              <span>Fragebogen ausfüllen — dein personalisierter Supplement-Stack wird direkt berechnet</span>
            </li>
            <li className="flex gap-2.5">
              <span className="flex-shrink-0 font-semibold text-accent">3.</span>
              <span>Am Montag startet Woche 1 — du bekommst deine ersten Aufgaben per Mail</span>
            </li>
          </ol>
        </div>

        <p className="mt-6 text-sm text-text-muted">
          Keine Mail bekommen?{' '}
          <Link href="/challenge/registrierung" className="font-medium text-accent hover:underline">
            Erneut registrieren
          </Link>{' '}
          oder Spam-Ordner checken.
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
