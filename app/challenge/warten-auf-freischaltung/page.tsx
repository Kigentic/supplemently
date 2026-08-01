// Wartescreen für Endkunden, deren Teilnahme noch nicht vom Studio
// freigeschaltet wurde (manuelle Zahlungsabwicklung außerhalb der Plattform,
// siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md).
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

export const metadata = { title: 'Fast geschafft — Freischaltung ausstehend' };

export default function WartenAufFreischaltungPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />
      <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-outline/20 text-3xl">
          ⏳
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
          Fast geschafft.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-muted">
          Deine Anmeldung ist eingegangen. Dein Studio schaltet dich frei, sobald die Zahlung bei
          ihm angekommen ist — danach kannst du direkt starten. Melde dich bei Fragen zur Zahlung
          direkt bei deinem Studio.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
