// Longevity Lifestyle Challenge Landingpage (B2C Startseite)
import type { ReactNode } from 'react';
import Link from 'next/link';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';
import { OrbitGraphic, StatBar, ProgressRing, PillarHub, WeekTimeline, ShieldHeartIcon } from './_components/Illustrations';

// ── Design-Tokens ─────────────────────────────────────────────────────────────

const btnPrimary =
  'inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[.98]';
const btnSecondary =
  'inline-block rounded-full border border-outline px-8 py-4 text-base font-medium text-text transition hover:border-text';

// ── Kleine Bausteine ─────────────────────────────────────────────────────────

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

function TrustPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-outline bg-bg px-3.5 py-1.5 text-sm text-text-muted">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M20 6 9 17l-5-5" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}

function QuoteCard({ initial, color, text }: { initial: string; color: string; text: string }) {
  return (
    <div className="rounded-2xl bg-surface p-5">
      <div className="mb-3 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: color }}
        >
          {initial}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Kennst du das?</span>
      </div>
      <p className="text-sm leading-relaxed text-text">{text}</p>
    </div>
  );
}

// ── Seite ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader ctaLabel="Jetzt anmelden" ctaHref="/challenge/registrierung" />

      <main>

        {/* ═══ 1. HERO ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(65% 55% at 15% 0%, rgba(79,144,193,0.16) 0%, transparent 65%)' }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                <span className="text-sm font-medium text-accent">Community startet bald</span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl">
                In 8 Wochen zu <span className="text-accent">deinem</span> längeren,
                besseren Leben.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
                Die Longevity Lifestyle Challenge: Training, Ernährung und Supplements —
                individuell auf dich berechnet, nicht auf den Durchschnitt. Mit Community,
                Wochenplan und echten Belohnungen.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                <Link href="/challenge/registrierung" className={btnPrimary + ' w-full text-center sm:w-auto'}>
                  Jetzt kostenlos anmelden
                </Link>
                <a href="#mechanismus" className={btnSecondary + ' w-full text-center sm:w-auto'}>
                  Wie es funktioniert
                </a>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2">
                <TrustPill>Kostenloser Einstieg</TrustPill>
                <TrustPill>In 2 Minuten personalisiert</TrustPill>
                <TrustPill>Mit §20-zertifizierter Ernährungs-App</TrustPill>
              </div>
            </div>

            <OrbitGraphic />
          </div>
        </section>

        {/* ═══ 2. PAIN — "Kennst du das?" ════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Kennst du das?</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Du machst eigentlich alles richtig. <br />
                Und trotzdem fehlt was.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-text-muted">
                Training, Ernährung, ein paar Supplements aus dem Drogeriemarkt — und trotzdem: Energie,
                Schlaf und Fokus fühlen sich nicht so an, wie sie könnten. Das liegt nicht an dir. Es liegt
                daran, dass generische Tipps nie auf dich zugeschnitten sind.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <QuoteCard
                initial="J"
                color="#225990"
                text="„Ich nehme seit Jahren irgendwelche Vitamine — keine Ahnung ob die überhaupt was bringen.“"
              />
              <QuoteCard
                initial="M"
                color="#4f90c1"
                text="„Motivation ist nach 2 Wochen immer weg. Mir fehlt einfach ein klarer Plan und jemand der mitzieht.“"
              />
              <QuoteCard
                initial="L"
                color="#225990"
                text="„Ich trainiere regelmäßig, schlafe aber schlecht und weiß nicht mal warum.“"
              />
            </div>
          </div>
        </section>

        {/* ═══ 3. MECHANISMUS — 3 Säulen ═══════════════════════════════════════ */}
        <section id="mechanismus" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>Der Mechanismus</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              3 Hebel. Individuell auf dich eingestellt.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              Kein Programm von der Stange. Dein Profil entscheidet, was du bekommst.
            </p>
          </div>
          <div className="mt-12">
            <PillarHub />
          </div>
        </section>

        {/* ═══ 4. TRANSFORMATION — Woche 0 vs Woche 8 ═════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <Kicker>Deine Transformation</Kicker>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                  Woche 0. Woche 8. <br />
                  <span className="text-accent">Zwei verschiedene Menschen.</span>
                </h2>
                <p className="mt-5 leading-relaxed text-text-muted">
                  Du startest mit einer Baseline — Energie, Schlaf, Stimmung, Fitness. Jede Woche trackst
                  du dein Befinden. Am Ende siehst du schwarz auf weiß, was sich verändert hat. Nicht gefühlt.
                  Gemessen.
                </p>
                <ul className="mt-6 space-y-3">
                  <Check>Baseline-Check direkt beim Onboarding</Check>
                  <Check>Wöchentliches Update deiner Werte</Check>
                  <Check>Finale Auswertung mit direktem Vergleich</Check>
                </ul>
              </div>

              <div className="rounded-3xl bg-bg p-7 shadow-sm sm:p-8">
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Typische Entwicklung nach 8 Wochen
                </p>
                <div className="space-y-5">
                  <StatBar label="Energie" from={4} to={8} />
                  <StatBar label="Schlafqualität" from={5} to={8} />
                  <StatBar label="Stimmung" from={5} to={9} />
                  <StatBar label="Trainingskonsistenz" from={3} to={7} />
                </div>
                <p className="mt-5 text-xs text-text-muted">
                  Illustrative Werte auf Basis typischer Verläufe strukturierter 8-Wochen-Programme.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 5. WIE ES FUNKTIONIERT ════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>So läuft's ab</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              3 Schritte. 8 Wochen. Kein Rätselraten.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Anmelden & Profil erstellen',
                text: 'Registrieren, Fragebogen zu Training, Ernährung, Schlaf und Lifestyle beantworten. Du bekommst sofort deinen individuellen Supplement-Stack.',
              },
              {
                step: '02',
                title: 'Jede Woche neue Aufgaben',
                text: 'Montags kommen deine Aufgaben in 5 Bereichen. Freitags checkst du ein: was geschafft, wie geht\'s dir. Dein Score wird aktualisiert.',
              },
              {
                step: '03',
                title: 'Nach 8 Wochen auswerten',
                text: 'Komplette Transformation sichtbar — Energie, Schlaf, Training, Körpergefühl. Die Top 3 gewinnen Preise. Du gewinnst auf jeden Fall.',
              },
            ].map((s) => (
              <div key={s.step}>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-xl font-bold text-on-accent">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-text">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 6. WOCHENPLAN — Timeline ═══════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Der Plan</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Aufbauend. Kein Crash-Kurs.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                Jede Woche ein Thema, aufeinander aufbauend — von Fundament bis Feintuning.
                Plus persönliche Bonus-Aufgaben je nach deinem Profil.
              </p>
            </div>
            <div className="mt-14 rounded-3xl bg-bg p-6 sm:p-10">
              <WeekTimeline />
            </div>
          </div>
        </section>

        {/* ═══ 7. PERSONALISIERUNG ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Kicker>100% personalisiert</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                So individuell wie du und dein Lifestyle.
              </h2>
              <p className="mt-5 leading-relaxed text-text-muted">
                Dein Ergebnis entsteht aus über 30 Parametern: Ernährungsstil, Trainingslevel,
                Schlafqualität, Stresslevel, Medikamente, Vorerkrankungen. Kein Einheits-Stack —
                deins.
              </p>
              <ul className="mt-6 space-y-3">
                <Check>Veganer bekommen einen anderen Stack als Omnivore</Check>
                <Check>Kraft-Athleten andere Mikronährstoffe als Ausdauerläufer</Check>
                <Check>Chronischer Stress verändert deinen Magnesiumbedarf</Check>
                <Check>Schlechter Schlaf? Anderer Ansatz als schlechte Verdauung</Check>
              </ul>
            </div>

            <div className="rounded-3xl bg-surface p-6 sm:p-8">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                Dein Ergebnis nach dem Fragebogen
              </p>
              {[
                { tier: 'Must-have', color: 'bg-amber-500', items: ['Omega-3', 'Magnesium', 'Vitamin D3+K2'] },
                { tier: 'Deine Basics', color: 'bg-accent', items: ['Kreatin', 'Vitamin B12'] },
                { tier: 'Specials', color: 'bg-indigo-500', items: ['Ashwagandha', 'L-Theanin'] },
                { tier: 'Add-ons', color: 'bg-outline', items: ['Curcumin', 'Coenzym Q10'] },
              ].map((t) => (
                <div key={t.tier} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${t.color}`} />
                    <span className="text-xs font-medium text-text-muted">{t.tier}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {t.items.map((item) => (
                      <span key={item} className="rounded-full bg-bg px-3 py-1 text-sm font-medium text-text">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div className="mt-5 rounded-xl border border-outline/40 p-3 text-xs text-text-muted">
                Jede Empfehlung mit konkreter Begründung — basierend auf deinen Antworten, nicht
                auf generischen Verkaufslisten.
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 8. BONUS — Buddy + Krankenkasse ════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <Kicker>Zwei Bonus-Hebel</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Nicht allein. Mit echten Vorteilen.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Buddy */}
              <div className="rounded-3xl bg-bg p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-2xl">
                  🤝
                </div>
                <h3 className="text-xl font-semibold text-text">Dein Buddy zieht mit</h3>
                <p className="mt-3 leading-relaxed text-text-muted">
                  Optional beim Anmelden aktivierbar: Wir matchen dich mit einem anderen Teilnehmer.
                  Wenn ihr beide euren Wochen-Check-in einreicht, gibt's Bonuspunkte für euch beide —
                  gegenseitige Motivation, eingebaut ins System.
                </p>
                <ul className="mt-5 space-y-2.5">
                  <Check>Ein Klick beim Onboarding, komplett optional</Check>
                  <Check>Bonuspunkte für gemeinsame Check-ins</Check>
                  <Check>Eigenes Badge wenn ihr beide durchhaltet</Check>
                </ul>
              </div>

              {/* Krankenkasse */}
              <div className="rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 via-bg to-bg p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                  <ShieldHeartIcon />
                </div>
                <h3 className="text-xl font-semibold text-text">Bis zu 150 € für deine Ernährungs-App</h3>
                <p className="mt-3 leading-relaxed text-text-muted">
                  In der Challenge enthalten ist eine §20-zertifizierte Ernährungs-App. Deren
                  Kosten erstatten viele gesetzliche Krankenkassen bis zu 150 € pro Jahr —
                  ganz offiziell, weil die App als Präventionsangebot anerkannt ist.
                </p>
                <p className="mt-3 text-sm text-text-muted">
                  Wichtig zu wissen: zertifiziert ist die Ernährungs-App, nicht die Challenge
                  selbst. Die Challenge ist unser eigenes Programm, in das die App eingebunden
                  ist. Für die App-Kosten reichst du die Teilnahmebestätigung einfach bei
                  deiner Kasse ein — die Unterlagen dafür stellen wir dir bereit.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {['TK', 'AOK', 'Barmer', 'DAK', 'IKK'].map((k) => (
                    <span key={k} className="rounded-full border border-outline bg-bg px-3 py-1 text-xs font-medium text-text-muted">
                      {k}
                    </span>
                  ))}
                  <span className="rounded-full px-3 py-1 text-xs font-medium text-text-muted">+ weitere</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 9. PREISE ═══════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>Preise</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Mitmachen lohnt sich. Gewinnen auch.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              Die 3 Teilnehmer mit dem höchsten Gesamtscore nach 8 Wochen gewinnen. Punkte gibt's für
              Aufgaben-Compliance, Check-ins, Verbesserung deiner Werte und Einladungen.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { platz: '1', label: 'Platz 1', preis: 'Premium Supplement-Paket + Longevity-Coaching', border: 'border-amber-300' },
              { platz: '2', label: 'Platz 2', preis: 'Supplement-Gutschein + Jahres-Zugang', border: 'border-outline' },
              { platz: '3', label: 'Platz 3', preis: 'Personalisiertes Supplement-Starter-Paket', border: 'border-orange-200' },
            ].map((p) => (
              <div key={p.platz} className={`rounded-2xl border-2 bg-surface p-6 text-center ${p.border}`}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-on-accent mx-auto">
                  {p.platz}
                </span>
                <p className="mt-4 font-semibold text-text">{p.label}</p>
                <p className="mt-1 text-sm text-text-muted">{p.preis}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 10. LONGEVITY SCIENCE ══════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>Evidenzbasiert</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Longevity ist kein Trend. Es ist Wissenschaft.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-text-muted">
                Wer Schlaf, Bewegung, Ernährung und Supplementierung strukturiert optimiert, schiebt
                chronische Risiken um Jahre nach hinten. Nicht irgendwann. Jetzt.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { pct: 72, zahl: '+23%', label: 'Muskelmasse', text: 'bei Krafttraining + optimaler Proteinversorgung' },
                { pct: 68, zahl: '−31%', label: 'Stresshormone', text: 'bei täglicher Mindfulness + Ashwagandha' },
                { pct: 85, zahl: '+47 min', label: 'Tiefschlaf', text: 'durch Magnesiumglycinat + Schlaf-Hygiene' },
                { pct: 90, zahl: '×2.4', label: 'Energie-Level', text: 'nach 8 Wochen strukturiertem Programm' },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center rounded-2xl bg-bg p-6 text-center">
                  <div className="relative flex items-center justify-center">
                    <ProgressRing pct={s.pct} />
                    <span className="absolute text-sm font-bold text-accent">{s.zahl}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-text">{s.label}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{s.text}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-text-muted">
              Angaben auf Basis einschlägiger Studien. Individuelle Ergebnisse können variieren.
            </p>
          </div>
        </section>

        {/* ═══ 11. FINAL CTA + FAQ ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
          <h2 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Dein bestes Ich wartet. <br />
            <span className="text-accent">8 Wochen bis dahin.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
            Melde dich an und bekomme sofort deinen personalisierten Supplement-Stack —
            noch bevor die Challenge startet.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            <Link href="/challenge/registrierung" className={btnPrimary + ' px-10 py-5 text-lg'}>
              Jetzt kostenlos anmelden →
            </Link>
            <p className="text-sm text-text-muted">
              Ernährungs-App §20-zertifiziert · Kosten bis zu 150 € erstattungsfähig
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
            {[
              ['Muss ich sportlich sein?', 'Nein. Das Programm passt sich deinem aktuellen Fitnesslevel an. Anfänger sind ausdrücklich willkommen.'],
              ['Wie viel Zeit brauche ich?', '30–60 Minuten pro Woche für Check-in und Planung. Die Aufgaben integrierst du in deinen Alltag.'],
              ['Was kostet die Challenge?', 'Der Einstieg ist kostenlos. Optional: 9,90 € Einmalbeitrag für die Challenge. Die enthaltene §20-zertifizierte Ernährungs-App kann separat über deine Krankenkasse erstattet werden.'],
              ['Was passiert nach 8 Wochen?', 'Du bekommst deine komplette Auswertung, deinen langfristigen Stack und kannst in die nächste Runde der Community starten.'],
            ].map(([q, a]) => (
              <div key={q} className="rounded-xl border border-outline/40 bg-surface p-5">
                <p className="font-semibold text-text">{q}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{a}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
