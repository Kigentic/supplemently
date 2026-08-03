// MoveIn8 — B2B-Startseite: Pitch des Studio-Challenge-Systems an
// Fitnessstudios/Trainer, die als Partner eigene Challenges anbieten wollen.
// Nutzt das globale MoveIn8-CI (Orange/Grau/Olive) aus app/globals.css —
// gilt für die gesamte App außer /turnkiste (Turnkistes eigene B2C-Seite,
// die lokal auf die alten Blautöne zurück-overridet).
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import RegistrierungForm from './_components/RegistrierungForm';

export const metadata = {
  title: 'MoveIn8 — Das Studio Challenge System',
  description:
    'Schlüsselfertige 8-Wochen-Challenges für dein Fitnessstudio: 3 Challenges zur Auswahl, intelligentes Onboarding, KI-Coach 24/7 und Supplement-Upsell inklusive.',
};

const btnPrimary =
  'inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[.98]';
const btnSecondary =
  'inline-block rounded-full border border-olive px-8 py-4 text-base font-medium text-text transition hover:border-text';

function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{children}</p>;
}

function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-base text-text-muted">
      <svg className="mt-1 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 6 9 17l-5-5" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}

function NuggetIcon({ path }: { path: string }) {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d={path} stroke="var(--color-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

const NUGGETS = [
  {
    icon: 'M4 6h16M4 12h16M4 18h16M8 6l0 0M8 12l0 0M8 18l0 0',
    title: '3 Challenges, ein Klick',
    text: 'Longevity, Abnehmen oder Rücken — dein Studio wählt aus, welche Challenges laufen. Kein Aufsetzen von Inhalten nötig.',
  },
  {
    icon: 'M9 12l2 2 4-4M12 3a9 9 0 100 18 9 9 0 000-18z',
    title: 'Intelligentes Onboarding',
    text: 'Neue Mitglieder beantworten einen Fragebogen zu Training, Ernährung und Lifestyle — und bekommen sofort ihren individuellen Plan.',
  },
  {
    icon: 'M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
    title: '8 Wochen, komplett durchgetaktet',
    text: 'Jede Woche ein Thema, aufeinander aufbauend. Deine Mitglieder wissen jederzeit, was als Nächstes ansteht — du musst nichts betreuen.',
  },
  {
    icon: 'M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9',
    title: 'Mobility & Entspannung inklusive',
    text: 'Neben Training und Ernährung laufen zusätzliche Wochenaufgaben zu Mobility und Stressmanagement mit — für echte Alltagstauglichkeit.',
  },
  {
    icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
    title: 'KI-Coach — 24/7 erreichbar',
    text: 'Charles beantwortet Fragen zu Aufgaben, Workouts und Supplements rund um die Uhr. Weniger Rückfragen an dich und dein Team.',
  },
  {
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    title: 'Wöchentliche Check-ins',
    text: 'Ampel-Check-in jede Woche, Score wird automatisch berechnet. Du siehst auf einen Blick, wer aktiv dabei ist und wer Aufmerksamkeit braucht.',
  },
  {
    icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6',
    title: 'Upsell durch Supplemente',
    text: 'Passende Supplement-Empfehlungen mit Affiliate-Code laufen automatisch in der Challenge mit — zusätzlicher Umsatz ohne Zusatzaufwand.',
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Anfrage stellen',
    text: 'Formular unten ausfüllen — wir melden uns innerhalb von 24 Stunden und klären, welche Challenges zu deinem Studio passen.',
  },
  {
    step: '02',
    title: 'Setup & Freischaltung',
    text: 'Wir richten dein Studio ein. Du bekommst Zugang zu deinem Studio-Dashboard mit Mitgliederübersicht und Anmeldelinks.',
  },
  {
    step: '03',
    title: 'Durchgang starten',
    text: 'Startdatum wählen, Anmeldelink an deine Mitglieder schicken. Zahlung regelst du wie gewohnt selbst — wir stellen nur die Plattform.',
  },
];

export default function StudioPartnerPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-outline/40 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Image src="/MoveIN-nobg.png" alt="MoveIn8" width={300} height={150} style={{ height: 66, width: 'auto' }} priority />
          <nav className="hidden items-center gap-7 sm:flex">
            <a href="#funktionen" className="text-sm font-medium text-text-muted transition hover:text-text">
              Funktionen
            </a>
            <a href="#ablauf" className="text-sm font-medium text-text-muted transition hover:text-text">
              So läuft's ab
            </a>
            <Link href="/challenge/login" className="text-sm font-medium text-text-muted transition hover:text-text">
              Login
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/challenge/login" className="text-sm font-medium text-text-muted transition hover:text-text sm:hidden">
              Login
            </Link>
            <a href="#anfrage" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent-hover">
              Partner werden
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* ═══ HERO ═══ */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(65% 55% at 15% 0%, rgba(246,139,53,0.14) 0%, transparent 65%)' }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                <span className="text-sm font-medium text-accent">Für Fitnessstudios &amp; Trainer</span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl">
                Dein eigenes Challenge-System. <span className="text-accent">Schlüsselfertig.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
                MoveIn8 bringt dir ein komplettes 8-Wochen-Challenge-Programm ins Studio —
                Onboarding, Wochenaufgaben, KI-Coach und Check-ins inklusive. Du wählst die
                Challenge, wir liefern die Plattform.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                <a href="#anfrage" className={btnPrimary + ' w-full text-center sm:w-auto'}>
                  Jetzt Studiopartner werden
                </a>
                <a href="#funktionen" className={btnSecondary + ' w-full text-center sm:w-auto'}>
                  Was ist enthalten?
                </a>
              </div>
            </div>

            {/* Hero-Visual: 3 Challenge-Karten */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-3">
              {[
                { name: 'Longevity', color: '#f68b35', active: true },
                { name: 'Abnehmen', color: '#b6b6aa' },
                { name: 'Rücken', color: '#cfc9bd' },
              ].map((c) => (
                <div
                  key={c.name}
                  className={`rounded-2xl border p-5 text-center transition ${
                    c.active ? 'border-accent bg-accent/5 shadow-md' : 'border-outline/50 bg-surface'
                  }`}
                >
                  <div
                    className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: c.color }}
                  >
                    {c.name[0]}
                  </div>
                  <p className="text-sm font-semibold text-text">{c.name}</p>
                  <p className="mt-1 text-xs text-caption">8 Wochen</p>
                  {c.active && (
                    <span className="mt-3 inline-block rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold text-on-accent">
                      Ausgewählt
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FEATURE-NUGGETS ═══ */}
        <section id="funktionen" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Das System</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Alles drin, was ein Challenge-Programm braucht.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                Du musst keine Inhalte entwickeln, keine Fragen beantworten und keine Excel-Listen
                pflegen. Das übernimmt das System.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {NUGGETS.map((n) => (
                <div key={n.title} className="rounded-2xl bg-bg p-6">
                  <NuggetIcon path={n.icon} />
                  <h3 className="text-lg font-semibold text-text">{n.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ KI-COACH CHARLES ═══ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Kicker>Weniger Rückfragen an dich</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Charles beantwortet die Fragen. <br />
                <span className="text-accent">Rund um die Uhr.</span>
              </h2>
              <p className="mt-5 leading-relaxed text-text-muted">
                Ob Frage zur Übung, zum Supplement oder zur aktuellen Wochenaufgabe — der
                KI-Coach kennt die komplette Challenge und antwortet sofort. Deine Mitglieder
                fühlen sich betreut, ohne dass du oder dein Team ständig ans Handy müssen.
              </p>
              <ul className="mt-6 space-y-3">
                <Check>Kennt automatisch die Challenge des jeweiligen Mitglieds</Check>
                <Check>Beantwortet Supplement-Fragen aus eurer eigenen Wissensdatenbank</Check>
                <Check>Läuft direkt im Mitgliederbereich, keine separate App nötig</Check>
              </ul>
            </div>

            <div className="rounded-3xl bg-surface p-7 sm:p-8">
              <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gradient-to-br from-accent to-accent-hover px-4 py-3">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white/40">
                  <Image src="/Trainer_Icon.png" alt="Charles" fill sizes="40px" className="object-cover object-top" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-on-accent">Charles</p>
                  <p className="text-xs text-on-accent/80">Dein persönlicher KI-Challenge Coach</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent px-3.5 py-2.5 text-sm text-on-accent">
                    Wie viel Protein pro Mahlzeit?
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                    <Image src="/Trainer_Icon.png" alt="Charles" fill sizes="28px" className="object-cover object-top" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-bg px-3.5 py-2.5 text-sm text-text shadow-sm">
                    20–30 g pro Mahlzeit ist ein guter Richtwert für Muskelerhalt und Sättigung …
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ UPSELL ═══ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div className="order-2 rounded-3xl bg-bg p-7 sm:p-8 lg:order-1">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-caption">
                  Automatische Empfehlung in Woche 2
                </p>
                <div className="rounded-2xl border border-outline/40 p-4">
                  <p className="text-sm font-semibold text-text">Omega-3 Kapseln</p>
                  <p className="mt-1 text-xs text-text-muted">Passend zur Aufgabe "Gesunde Ernährung"</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">Code: STUDIO10</span>
                    <span className="text-xs text-text-muted">Klick-Tracking inklusive</span>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <Kicker>Zusätzlicher Umsatz</Kicker>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                  Supplements verkaufen sich mit, nicht extra.
                </h2>
                <p className="mt-5 leading-relaxed text-text-muted">
                  Passend zu Woche und Aufgabe schlägt das System deinen Mitgliedern die richtigen
                  Supplements vor — mit eigenem Rabattcode und Klick-Tracking. Du siehst genau,
                  was performt, ohne selbst beraten zu müssen.
                </p>
                <ul className="mt-6 space-y-3">
                  <Check>Läuft automatisch mit, kein Verkaufsgespräch nötig</Check>
                  <Check>Eigene Rabattcodes pro Partner möglich</Check>
                  <Check>Statistik zu Klicks direkt im Studio-Dashboard</Check>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ABLAUF ═══ */}
        <section id="ablauf" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>So läuft's ab</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              3 Schritte bis zu deiner ersten Challenge.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.step}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-olive text-xl font-bold text-white">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.text}</p>
              </div>
            ))}
          </div>

          <p className="mt-10 rounded-xl border border-outline/40 bg-surface p-5 text-sm leading-relaxed text-text-muted">
            Wichtig: Neue Mitglieder landen nach der Registrierung zunächst inaktiv im System.
            Die Zahlung regelst du direkt mit deinem Mitglied — wie auch immer ihr das
            handhabt. Erst nach deiner Freischaltung im Studio-Dashboard startet die Challenge.
          </p>
        </section>

        {/* ═══ ANFRAGE ═══ */}
        <section id="anfrage" className="scroll-mt-20 bg-surface">
          <div className="mx-auto max-w-3xl px-5 py-20 sm:py-28">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <Kicker>Studiopartner werden</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Wir suchen Studiopartner.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                Kurz das Formular ausfüllen — wir melden uns innerhalb von 24 Stunden und klären
                den Rest im persönlichen Gespräch.
              </p>
            </div>
            <RegistrierungForm />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-outline/50 bg-bg">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div className="max-w-sm">
              <Image src="/MoveIN-nobg.png" alt="MoveIn8" width={300} height={150} style={{ height: 66, width: 'auto' }} />
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                Das Studio Challenge System — schlüsselfertig für dein Fitnessstudio.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <a href="/#" className="text-text-muted transition hover:text-text">Impressum</a>
              <a href="/#" className="text-text-muted transition hover:text-text">Datenschutz</a>
              <a href="mailto:hallo@turnkiste.de" className="text-text-muted transition hover:text-text">
                hallo@turnkiste.de
              </a>
            </div>
          </div>
          <div className="mt-10 border-t border-outline/50 pt-6 text-xs text-caption">
            © {new Date().getFullYear()} Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
