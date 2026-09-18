// MoveIn8 — zentrale Startseite. Zielneutral: erklärt nur das Prinzip des
// 8-Wochen-Challenge-Systems (Wochenaufgaben, Routinen, Check-ins, Charles),
// ohne sich auf ein Ziel (Longevity/Abnehmen/Rücken) festzulegen. Verlinkt
// von hier aus auf die drei Challenge-Landingpages sowie auf /fuer-studios
// (die frühere Startseite, jetzt reiner B2B-Pitch für Studiopartner).
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';
import { WeekTimeline } from './_components/Illustrations';

export const metadata = {
  title: 'MoveIn8 — Deine 8-Wochen-Challenge',
  description:
    'MoveIn8: ein 8-Wochen-Challenge-System mit Wochenaufgaben, Routinen, Check-ins und KI-Coach Charles. Wähle deine Challenge — Longevity, Abnehmen oder Rücken.',
};

function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{children}</p>;
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

const PRINZIP = [
  {
    icon: 'M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z',
    title: 'Wöchentliche Aufgaben',
    text: 'Jede Woche neue Aufgaben in mehreren Bereichen — aufeinander aufbauend, nie zufällig zusammengewürfelt.',
  },
  {
    icon: 'M12 3v18M3 12h18M7.5 7.5l9 9M16.5 7.5l-9 9',
    title: 'Feste Routinen',
    text: 'Training, Mobility und kleine Alltags-Routinen, die sich wirklich in deinen Tag einbauen lassen.',
  },
  {
    icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
    title: 'Regelmäßige Check-ins',
    text: 'Jede Woche ein kurzer Check-in, dein Score wird automatisch berechnet — du siehst deinen Fortschritt schwarz auf weiß.',
  },
  {
    icon: 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z',
    title: 'Charles — dein KI-Coach',
    text: 'Rund um die Uhr erreichbar für Fragen zu deiner Challenge. Kein Warten auf Rückmeldung.',
  },
];

const CHALLENGES = [
  {
    slug: 'longevity-challenge',
    name: 'Longevity',
    subtitle: 'Energie, Schlaf, langfristige Gesundheit',
    image: '/Hero.webp',
    color: '#f68b35',
  },
  {
    slug: 'abnehmen-challenge',
    name: 'Abnehmen',
    subtitle: 'Nachhaltig runter vom Gewicht, ohne Diät-Chaos',
    image: '/gym2_ai.webp',
    color: '#b6b6aa',
  },
  {
    slug: 'ruecken-challenge',
    name: 'Rücken',
    subtitle: 'Mehr Kraft und Beweglichkeit im Rücken',
    image: '/gymberatung.webp',
    color: '#cfc9bd',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader
        ctaHref="#challenges"
        ctaLabel="Challenge wählen"
        extraNavLinks={[
          { href: '/challenge/login', label: 'Studio-Login' },
          { href: '/challenge/login', label: 'Teilnehmer-Login' },
        ]}
      />

      <main>
        {/* ═══ HERO ═══ */}
        <section className="relative isolate overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(65% 55% at 15% 0%, rgba(246,139,53,0.16) 0%, transparent 65%)' }}
          />
          <div className="relative mx-auto max-w-4xl px-5 py-20 text-center sm:py-28">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="text-sm font-medium text-accent">Das MoveIn8-Prinzip</span>
            </div>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl">
              Ein System. Acht Wochen. <span className="text-accent">Dein Ziel.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
              MoveIn8 begleitet dich 8 Wochen lang mit Wochenaufgaben, festen Routinen,
              regelmäßigen Check-ins und deinem KI-Coach Charles — egal welches Ziel du
              verfolgst. Wähle unten deine Challenge und leg los.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a href="#challenges" className="inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[.98]">
                Meine Challenge finden
              </a>
              <Link href="/fuer-studios" className="inline-block rounded-full border border-outline px-8 py-4 text-base font-medium text-text transition hover:border-text">
                Ich bin Studio/Trainer
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ PRINZIP ═══ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>So funktioniert's</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Kein Rätselraten. Ein klarer Rahmen für 8 Wochen.
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PRINZIP.map((n) => (
                <div key={n.title} className="rounded-2xl bg-bg p-6">
                  <NuggetIcon path={n.icon} />
                  <h3 className="text-lg font-semibold text-text">{n.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{n.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-14 rounded-3xl bg-bg p-6 sm:p-10">
              <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                Jede Challenge läuft nach demselben Aufbau
              </p>
              <WeekTimeline />
            </div>
          </div>
        </section>

        {/* ═══ CHALLENGES ═══ */}
        <section id="challenges" className="scroll-mt-20">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Wähle deine Challenge</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Drei Ziele. Ein System dahinter.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                Die Bausteine sind überall gleich — Training, Aufgaben, Check-ins, Charles.
                Nur der Fokus unterscheidet sich.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {CHALLENGES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/${c.slug}`}
                  className="group block overflow-hidden rounded-3xl border border-outline/50 bg-surface transition hover:border-accent/50"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(min-width: 640px) 33vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: 'linear-gradient(0deg, rgba(10,10,11,0.75) 0%, transparent 55%)' }}
                    />
                    <span
                      className="absolute bottom-3 left-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ background: c.color }}
                    >
                      {c.name[0]}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-text">{c.name}-Challenge</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{c.subtitle}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent">
                      Mehr erfahren
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition group-hover:translate-x-0.5">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ STUDIOPARTNER ═══ */}
        <section className="bg-surface">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-5 py-16 text-center sm:py-20">
            <Kicker>Du bist Studio oder Trainer?</Kicker>
            <h2 className="max-w-xl text-2xl font-semibold tracking-tight text-text sm:text-3xl">
              MoveIn8 gibt's auch als Lizenz für dein Studio.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-text-muted">
              Biete deinen Mitgliedern das komplette Challenge-System unter deinem eigenen
              Dach an — Onboarding, Wochenaufgaben, KI-Coach und Check-ins inklusive.
            </p>
            <Link
              href="/fuer-studios"
              className="inline-block rounded-full border border-outline px-8 py-3.5 text-base font-medium text-text transition hover:border-text"
            >
              Mehr für Studiopartner →
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter tagline="Dein 8-Wochen-Challenge-System — Wochenaufgaben, Routinen, Check-ins und Charles." />
    </div>
  );
}
