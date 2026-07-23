'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

const EXTERNAL_CHECKOUT_URL = 'https://dein-abnehmprogramm.com/preise/';

const btnPrimary =
  'inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[.98]';

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

function FeatureCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-surface p-6">
      <div
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl text-xl"
        style={{ background: 'linear-gradient(135deg, rgba(79,144,193,0.15), rgba(79,144,193,0.05))' }}
      >
        {icon}
      </div>
      <p className="font-semibold text-text">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{text}</p>
    </div>
  );
}

export default function ErnaehrungsAppPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main>

        {/* ═══ 1. HERO ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(60% 50% at 50% -5%, rgba(79,144,193,0.16) 0%, transparent 65%)' }}
          />
          <div className="relative mx-auto max-w-3xl px-5 pb-12 pt-16 text-center sm:pt-20">
            <Kicker>Bevor's ins Dashboard geht</Kicker>
            <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight text-text sm:text-5xl">
              Training und Supplements sind die halbe Miete.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-text-muted">
              Longevity ohne die Ernährung im Griff zu haben, funktioniert nicht — das ist der Baustein,
              an dem die meisten Programme scheitern. Genau dafür ist eine zertifizierte Ernährungs-App
              Teil deiner Challenge.
            </p>
          </div>
        </section>

        {/* ═══ 2. WARUM ═══════════════════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:py-16">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-bg p-6">
                <span className="text-2xl">🏋️</span>
                <p className="mt-3 font-semibold text-text">Training + Supplements allein</p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                  Guter Ansatz, aber ohne passende Ernährung verpufft ein großer Teil des Effekts —
                  Regeneration, Energie und Körperzusammensetzung hängen direkt an dem, was du isst.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-accent/30 bg-bg p-6">
                <span className="text-2xl">🥗</span>
                <p className="mt-3 font-semibold text-text">+ individueller Ernährungsplan</p>
                <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
                  Erst mit allen drei Hebeln zusammen — Training, Supplements, Ernährung — wird aus der
                  Challenge eine echte Longevity-Strategie statt eines weiteren Trainingsprogramms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 3. WAS DIE APP BIETET ══════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>Die Ernährungs-App</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Kein Kalorienzählen. Kein Rätselraten.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              Wissenschaftlich entwickelt in Zusammenarbeit mit Upfit — dein persönlicher
              Ernährungsplan, der sich an deinen Alltag anpasst statt umgekehrt.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard icon="🍽️" title="16.000+ Rezepte" text="Für jeden Ernährungsstil — omnivor, vegetarisch, vegan, flexitarisch — mit Alternativen für jede Mahlzeit." />
            <FeatureCard icon="🛒" title="Automatische Einkaufslisten" text="Kein Kalorienzählen, keine Excel-Tabelle. Die App plant, du kochst." />
            <FeatureCard icon="🔄" title="Flexibel bei Bedarf" text="Mahlzeiten tauschen, überspringen, Snack-Häufigkeit anpassen — passt sich deinem Tag an, nicht umgekehrt." />
            <FeatureCard icon="💬" title="Live-Chat mit Experten" text="Fragen zur Umsetzung? Echte Ernährungsberater antworten direkt in der App." />
            <FeatureCard icon="📱" title="Web, Tablet, Smartphone" text="Überall verfügbar — Einkaufsliste unterwegs, Plan am Rechner, Rezept in der Küche." />
            <FeatureCard icon="🎯" title="100+ Personalisierungen" text="Allergien, Unverträglichkeiten, Ziel-Wechsel jederzeit — der Plan bleibt exakt auf dich zugeschnitten." />
          </div>
        </section>

        {/* ═══ 4. §20-ZERTIFIZIERUNG ═══════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>§20-zertifiziert</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Deine Krankenkasse zahlt in der Regel mit.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                Die App ist als Präventionskurs nach §20 SGB V zertifiziert. Die meisten gesetzlichen
                Krankenkassen erstatten die Kosten dafür — in vielen Fällen sogar vollständig.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                ['01', 'App kaufen & nutzen', 'Du startest direkt mit deinem individuellen Ernährungsplan.'],
                ['02', 'Teilnahme abschließen', 'Du bekommst eine Teilnahmebescheinigung für den §20-Kurs.'],
                ['03', 'Bei der Kasse einreichen', 'Bescheinigung einreichen — die Erstattung läuft direkt über deine Krankenkasse.'],
              ].map(([step, title, text]) => (
                <div key={step} className="rounded-2xl bg-bg p-6">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">
                    {step}
                  </span>
                  <p className="mt-3 font-semibold text-text">{title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{text}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-xs text-text-muted">
              Höhe und Umfang der Erstattung hängen von deiner Krankenkasse ab — ein Blick in die
              Bonusregelung deiner Kasse lohnt sich vorab.
            </p>
          </div>
        </section>

        {/* ═══ 5. PREISE ═══════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-4xl px-5 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>Deine Optionen</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Zwei Laufzeiten, beide erstattungsfähig.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-3xl border border-outline/60 bg-surface p-7">
              <p className="text-sm font-medium text-text-muted">3 Monate</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-text">89,99&nbsp;€</span>
                <span className="text-sm text-text-muted line-through">119,99&nbsp;€</span>
              </div>
              <span className="mt-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Erstattungsfähig
              </span>
              <ul className="mt-5 space-y-2.5">
                <Check>16.000+ Rezepte, individueller Plan</Check>
                <Check>Automatische Einkaufslisten</Check>
                <Check>Live-Chat mit Ernährungsberatung</Check>
              </ul>
            </div>

            <div className="rounded-3xl border-2 border-accent bg-surface p-7">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-medium text-text-muted">12 Monate + Training</p>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-on-accent">Empfehlung</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight text-text">119,99&nbsp;€</span>
                <span className="text-sm text-text-muted line-through">159,99&nbsp;€</span>
              </div>
              <span className="mt-3 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Erstattungsfähig
              </span>
              <ul className="mt-5 space-y-2.5">
                <Check>Alles aus dem 3-Monats-Plan</Check>
                <Check>Trainingsplan inklusive</Check>
                <Check>Deckt die komplette 8-Wochen-Challenge und danach ab</Check>
              </ul>
            </div>
          </div>
        </section>

        {/* ═══ 6. FINAL CTA ═══════════════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-2xl px-5 py-16 text-center sm:py-20">
            <h2 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Der letzte Baustein deiner Challenge.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-muted">
              Der Kauf läuft über unseren Ernährungspartner — du landest auf dessen Seite in einem
              neuen Tab und kannst direkt deine Krankenkasse für die Erstattungsübersicht auswählen.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <a href={EXTERNAL_CHECKOUT_URL} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                Ernährungsplan sichern →
              </a>
              <Link href="/challenge/dashboard" className="text-sm text-text-muted underline hover:text-text">
                Ich entscheide mich später — weiter zum Dashboard
              </Link>
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
