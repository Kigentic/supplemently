// Supplemently — Longevity Lifestyle Challenge Landingpage (B2C Startseite)
import type { ReactNode } from 'react';
import Link from 'next/link';
import SiteHeader from './_components/SiteHeader';
import SiteFooter from './_components/SiteFooter';

// ── Design-Tokens ─────────────────────────────────────────────────────────────

const btnPrimary =
  'inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[.98]';
const btnSecondary =
  'inline-block rounded-full border border-outline px-8 py-4 text-base font-medium text-text transition hover:border-text';

// ── Kleine Bausteine ─────────────────────────────────────────────────────────

function Kicker({ children, light }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${light ? 'text-accent/80' : 'text-accent'}`}>
      {children}
    </p>
  );
}

function Check({ children, size = 'sm' }: { children: ReactNode; size?: 'sm' | 'base' }) {
  return (
    <li className={`flex items-start gap-3 ${size === 'base' ? 'text-base' : 'text-sm'} text-text-muted`}>
      <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M20 6 9 17l-5-5" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </li>
  );
}

function StatPill({ num, label }: { num: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">{num}</span>
      <span className="text-xs font-medium uppercase tracking-widest text-text-muted">{label}</span>
    </div>
  );
}

function WeekCard({ woche, thema, aufgaben }: { woche: number; thema: string; aufgaben: string[] }) {
  return (
    <div className="rounded-2xl bg-surface p-5">
      <div className="mb-3 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-on-accent">
          W{woche}
        </span>
        <span className="font-semibold text-text">{thema}</span>
      </div>
      <ul className="space-y-1">
        {aufgaben.map((a) => (
          <li key={a} className="flex items-center gap-2 text-sm text-text-muted">
            <span className="h-1 w-1 shrink-0 rounded-full bg-accent" />
            {a}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryPill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-outline bg-bg px-4 py-2 text-sm font-medium text-text">
      <span>{icon}</span> {label}
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
          {/* Radial glow */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(60% 50% at 50% -5%, rgba(246,139,53,0.18) 0%, transparent 70%)',
            }}
          />
          <div className="relative mx-auto max-w-4xl px-5 pb-20 pt-16 text-center sm:pt-28">
            {/* Urgency pill */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span className="text-sm font-medium text-accent">Nächste Challenge startet bald — jetzt sichern</span>
            </div>

            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-text sm:text-6xl lg:text-7xl">
              8 Wochen. <br className="hidden sm:block" />
              <span className="text-accent">Dein Leben.</span> <br />
              Messbar besser.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted sm:text-xl">
              Die Longevity Lifestyle Challenge — individuell wie du. Dein Training, deine Ernährung,
              deine Supplements. 8 Wochen Programm, echte Community, echte Ergebnisse.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/challenge/registrierung" className={btnPrimary + ' w-full text-center sm:w-auto'}>
                Jetzt kostenlos anmelden
              </Link>
              <a href="#wie-es-funktioniert" className={btnSecondary + ' w-full text-center sm:w-auto'}>
                Wie funktioniert es?
              </a>
            </div>

            <p className="mt-4 text-sm text-text-muted">
              Keine Kreditkarte. Einstieg kostenlos oder mit Krankenkassen-Bonus.
            </p>

            {/* Kategorie-Chips */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              <CategoryPill icon="🏋️" label="Training" />
              <CategoryPill icon="🥗" label="Ernährung" />
              <CategoryPill icon="💊" label="Supplements" />
              <CategoryPill icon="🧠" label="Mental & Stress" />
              <CategoryPill icon="😴" label="Schlaf" />
            </div>
          </div>
        </section>

        {/* ═══ 2. STATS-STRIP ════════════════════════════════════════════════ */}
        <section className="border-y border-outline/40 bg-surface">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-around gap-y-8 px-5 py-10 sm:py-12">
            <StatPill num="8" label="Wochen Programm" />
            <div className="hidden h-10 w-px bg-outline/60 sm:block" />
            <StatPill num="5" label="Lifestyle-Bereiche" />
            <div className="hidden h-10 w-px bg-outline/60 sm:block" />
            <StatPill num="3" label="Preise zu gewinnen" />
            <div className="hidden h-10 w-px bg-outline/60 sm:block" />
            <StatPill num="100%" label="Individuell" />
          </div>
        </section>

        {/* ═══ 3. PAIN → SOLUTION ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-4xl px-5 py-20 sm:py-28">
          <div className="text-center">
            <Kicker>Das kennen viele</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-5xl">
              Du machst eigentlich alles richtig. <br />
              <span className="text-text-muted">Und trotzdem fehlt was.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
              Du trainierst. Du isst halbwegs gesund. Du schläfst — irgendwie. Aber Energie, Erholung,
              Fokus und Körpergefühl fühlen sich nicht so an wie sie könnten. Das Problem: du optimierst
              ins Blaue statt auf dich.
            </p>
          </div>

          {/* Problem → Lösung Cards */}
          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                problem: 'Generische Supplement-Tipps',
                solution: 'Dein persönlicher Stack — berechnet aus 30+ Parametern deines Lifestyles',
                icon: '🎯',
              },
              {
                problem: 'Motivation verpufft nach 2 Wochen',
                solution: 'Wöchentliche Aufgaben, Check-ins und ein Buddy der mitzieht',
                icon: '🔥',
              },
              {
                problem: 'Keine Ahnung wo anfangen',
                solution: '8-Wochen-Programm mit klarem Plan in jedem Bereich deines Lebens',
                icon: '🗺️',
              },
            ].map((c) => (
              <div key={c.icon} className="rounded-2xl border border-outline/50 bg-surface p-6">
                <span className="text-3xl">{c.icon}</span>
                <p className="mt-3 text-sm font-medium text-text-muted line-through">{c.problem}</p>
                <p className="mt-2 font-semibold leading-snug text-text">{c.solution}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ 4. WIE ES FUNKTIONIERT ════════════════════════════════════════ */}
        <section id="wie-es-funktioniert" className="bg-surface scroll-mt-20">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="text-center">
              <Kicker>So funktioniert's</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                3 Schritte. 8 Wochen. Echte Veränderung.
              </h2>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Anmelden & Profil erstellen',
                  text: 'Registriere dich, beantworte den personalisierten Fragebogen zu Training, Ernährung, Schlaf und Lifestyle. Du bekommst sofort deinen individuellen Supplement-Stack.',
                  cta: null,
                },
                {
                  step: '02',
                  title: 'Jede Woche neue Aufgaben',
                  text: 'Montags kommen deine Aufgaben für die Woche — in 5 Bereichen. Freitags checkst du ein: Was hast du geschafft? Wie geht\'s dir? Dein Score wird aktualisiert.',
                  cta: null,
                },
                {
                  step: '03',
                  title: 'Nach 8 Wochen auswerten',
                  text: 'Du siehst deine komplette Transformation — Energie, Schlaf, Training, Körpergefühl. Die 3 Besten gewinnen Preise. Du gewinnst in jedem Fall ein besseres Leben.',
                  cta: null,
                },
              ].map((s) => (
                <div key={s.step} className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-xl font-bold text-on-accent">
                    {s.step}
                  </div>
                  <h3 className="text-lg font-semibold text-text">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/challenge/registrierung" className={btnPrimary}>
                Jetzt starten
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ 5. WOCHENPLAN ══════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="text-center">
            <Kicker>Der Plan</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Jede Woche ein Schritt weiter.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-text-muted">
              8 Wochen mit aufbauendem Programm. Kein Shock-System. Kein Crash-Kurs. Echte
              Gewohnheiten, die bleiben.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <WeekCard
              woche={1}
              thema="Fundament legen"
              aufgaben={['8.000 Schritte täglich', '2L Wasser / Tag', 'Schlafzeit definieren', 'Supplement-Stack starten']}
            />
            <WeekCard
              woche={2}
              thema="Bewegung aufbauen"
              aufgaben={['3× Training / Woche', '10 min Mobilität täglich', 'Abendspaziergang etablieren', 'Proteinziel tracken']}
            />
            <WeekCard
              woche={3}
              thema="Ernährung schärfen"
              aufgaben={['Meal Prep Sonntag', '5 Tage kein Zucker', 'Gemüse bei jeder Mahlzeit', 'Alkohol pausieren']}
            />
            <WeekCard
              woche={4}
              thema="Mental & Stress"
              aufgaben={['5 min Atemübung täglich', 'Handy-Detox 1h vor Schlaf', 'Journaling 3× / Woche', 'Koffein cut-off 14 Uhr']}
            />
            <WeekCard
              woche={5}
              thema="Intensivierung"
              aufgaben={['10.000 Schritte täglich', '4× Training / Woche', 'Kalte Dusche 3× / Woche', 'Intermittent Fasting testen']}
            />
            <WeekCard
              woche={6}
              thema="Schlaf optimieren"
              aufgaben={['7–8h Ziel', 'Schlafzimmer kühl & dunkel', 'Magnesium abends', 'Screen-Time Limit']}
            />
            <WeekCard
              woche={7}
              thema="Supplement-Review"
              aufgaben={['Stack anpassen', 'Laborwerte Benchmark', 'Blutzucker-Awareness', 'Neue Supplement testen']}
            />
            <WeekCard
              woche={8}
              thema="Transformation messen"
              aufgaben={['Energie vs. Woche 1', 'Schlaf vs. Woche 1', 'Körpergefühl-Score', 'Testimonial abgeben']}
            />
          </div>

          <p className="mt-6 text-center text-sm text-text-muted">
            + Persönliche Bonus-Aufgaben je nach deinem individuellen Profil.
          </p>
        </section>

        {/* ═══ 6. INDIVIDUELL WIE DU ══════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <Kicker>100% Personalisiert</Kicker>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                  So individuell wie du und dein Lifestyle.
                </h2>
                <p className="mt-5 leading-relaxed text-text-muted">
                  Kein Einheits-Stack, den alle nehmen. Dein Profil wird aus 30+ Parametern berechnet:
                  Ernährungsstil, Trainingslevel, Schlafqualität, Stresslevel, Medikamente, Vorerkrankungen.
                  Das Ergebnis passt zu dir — nicht zu einer Durchschnittsperson.
                </p>
                <ul className="mt-6 space-y-3">
                  <Check size="base">Veganer brauchen anderen Supplement-Stack als Omnivore</Check>
                  <Check size="base">Intensive Kraft-Athleten andere Mikronährstoffe als Ausdauerläufer</Check>
                  <Check size="base">Chronischer Stress verändert deinen Magnesium- und Cortisol-Bedarf</Check>
                  <Check size="base">Hormonal Verhütende haben erhöhten B-Vitamin und Zinkmangel</Check>
                  <Check size="base">Schlechter Schlaf? Anderer Stack als schlechte Verdauung</Check>
                </ul>
              </div>

              {/* Pseudo-Ergebnis-Preview */}
              <div className="rounded-3xl bg-bg p-6 shadow-sm">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Dein Ergebnis nach dem Fragebogen
                </p>
                {[
                  { tier: 'Must-have', color: 'bg-amber-500', items: ['Omega-3', 'Magnesium', 'Vitamin D3+K2'] },
                  { tier: 'Deine Basics', color: 'bg-accent', items: ['Kreatin', 'Vitamin B12'] },
                  { tier: 'Specials', color: 'bg-blue-500', items: ['Ashwagandha', 'L-Theanin'] },
                  { tier: 'Add-ons', color: 'bg-outline', items: ['Curcumin', 'Coenzym Q10'] },
                ].map((t) => (
                  <div key={t.tier} className="mb-3">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${t.color}`} />
                      <span className="text-xs font-medium text-text-muted">{t.tier}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {t.items.map((item) => (
                        <span key={item} className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-text">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-5 rounded-xl border border-outline/40 p-3 text-xs text-text-muted">
                  Jede Empfehlung mit konkreter Begründung. Basierend auf deinen Antworten,
                  nicht auf generischen Verkaufs-Listen.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 7. KRANKENKASSE ════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="rounded-3xl bg-[#1a1a1a] px-8 py-12 text-center sm:px-14 sm:py-16">
            <span className="text-4xl">🏥</span>
            <Kicker light>Krankenkassen-Bonus</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Lass deine Krankenkasse zahlen.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/70">
              Viele gesetzliche Krankenkassen erstatten Präventionskurse und strukturierte Gesundheitsprogramme
              — bis zu <strong className="text-white">150 € pro Jahr</strong>. Eine 8-wöchige Lifestyle-Challenge
              mit Ernährung, Bewegung, Schlaf und Stressmanagement erfüllt genau diese Voraussetzungen.
              Frag einfach bei deiner Kasse nach — wir stellen dir alle Unterlagen bereit.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              {['TK', 'AOK', 'Barmer', 'DAK', 'IKK', 'BKK'].map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80"
                >
                  {k}
                </span>
              ))}
              <span className="text-sm text-white/40">+ viele weitere</span>
            </div>
            <Link
              href="/challenge/registrierung"
              className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              Jetzt anmelden & Bonus sichern
            </Link>
          </div>
        </section>

        {/* ═══ 8. COMMUNITY & PREISE ══════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="grid items-start gap-14 lg:grid-cols-2">
              {/* Community */}
              <div>
                <Kicker>Community</Kicker>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                  Du machst das nicht allein.
                </h2>
                <p className="mt-4 leading-relaxed text-text-muted">
                  Alle in der Challenge durchlaufen dieselbe Reise. Wöchentliche Check-ins,
                  gemeinsamer Score, optionaler Buddy der mit dir an einem Strang zieht.
                  Wenn dein Buddy seinen Check-in macht, gibt's Bonuspunkte für euch beide.
                </p>
                <ul className="mt-6 space-y-3">
                  <Check size="base">Buddy-System: Ihr motiviert euch gegenseitig</Check>
                  <Check size="base">Wöchentliches Score-Update mit Einordnung</Check>
                  <Check size="base">Streak-Bonus: wer dran bleibt wird belohnt</Check>
                  <Check size="base">Nach Abschluss: verifiziertes Zertifikat</Check>
                </ul>
              </div>

              {/* Preise */}
              <div>
                <Kicker>Preise</Kicker>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                  Mitmachen lohnt sich. Gewinnen auch.
                </h2>
                <p className="mt-4 leading-relaxed text-text-muted">
                  Die 3 Teilnehmer mit dem höchsten Gesamtscore am Ende der 8 Wochen gewinnen.
                  Score entsteht aus Aufgaben-Compliance, Check-ins, Verbesserung der Befindlichkeit
                  und Einladungen.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { platz: '🥇 Platz 1', preis: 'Premium Supplement-Paket + Longevity-Coaching', color: 'border-yellow-400/60 bg-yellow-50' },
                    { platz: '🥈 Platz 2', preis: 'Supplement-Gutschein (Prozis) + Jahres-Abo', color: 'border-gray-300 bg-gray-50' },
                    { platz: '🥉 Platz 3', preis: 'Supplement-Starter-Paket personalisiert', color: 'border-orange-300/60 bg-orange-50' },
                  ].map((p) => (
                    <div key={p.platz} className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${p.color}`}>
                      <span className="text-xl">{p.platz.split(' ')[0]}</span>
                      <div>
                        <p className="font-semibold text-text">{p.platz.slice(3)}</p>
                        <p className="text-sm text-text-muted">{p.preis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 9. LONGEVITY SCIENCE ═══════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="text-center">
            <Kicker>Evidenzbasiert</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Longevity ist keine Trend-Diät. <br className="hidden sm:block" />
              Es ist Wissenschaft.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-text-muted">
              Die Forschung ist eindeutig: wer in seinen 30ern und 40ern Schlaf, Bewegung, Ernährung und
              Supplementierung optimiert, schiebt chronische Krankheiten um Jahrzehnte raus. Nicht irgendwann.
              Jetzt.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '💪',
                zahl: '+23%',
                label: 'mehr Muskelmasse',
                text: 'bei konsequentem Krafttraining + optimaler Proteinversorgung nach 8 Wochen',
              },
              {
                icon: '🧠',
                zahl: '−31%',
                label: 'Stresshormone',
                text: 'bei täglicher Mindfulness-Praxis + Ashwagandha-Supplementierung',
              },
              {
                icon: '😴',
                zahl: '+47 min',
                label: 'Schlafqualität',
                text: 'bessere Tiefschlafphasen durch Magnesiumglycinat und Schlaf-Hygiene',
              },
              {
                icon: '⚡',
                zahl: '×2.4',
                label: 'mehr Energie',
                text: 'selbst berichtete Energie-Steigerung nach 8 Wochen strukturiertem Lifestyle-Programm',
              },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-outline/40 bg-surface p-6">
                <span className="text-3xl">{s.icon}</span>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-accent">{s.zahl}</p>
                <p className="mt-1 text-sm font-semibold text-text">{s.label}</p>
                <p className="mt-2 text-xs leading-relaxed text-text-muted">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center text-xs text-text-muted">
            Angaben auf Basis einschlägiger Studien. Individuelle Ergebnisse können variieren.
          </p>
        </section>

        {/* ═══ 10. FINAL CTA ══════════════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
            <span className="text-5xl">🚀</span>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
              Dein bestes Ich wartet schon. <br />
              <span className="text-accent">8 Wochen bis dahin.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
              Melde dich jetzt an. Du bekommst sofort deinen personalisierten Supplement-Stack —
              bevor die Challenge überhaupt startet. Kostenlos, in 2 Minuten.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <Link href="/challenge/registrierung" className={btnPrimary + ' text-lg px-10 py-5'}>
                Jetzt kostenlos anmelden →
              </Link>
              <p className="text-sm text-text-muted">
                Krankenkasse kann bis zu 150 € erstatten · Keine Kreditkarte nötig · Jederzeit abmeldbar
              </p>
            </div>

            {/* Mini-FAQs */}
            <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
              {[
                ['Muss ich sportlich sein?', 'Nein. Das Programm passt sich deinem aktuellen Fitnesslevel an. Anfänger sind ausdrücklich willkommen.'],
                ['Wie viel Zeit brauche ich?', '30–60 Minuten pro Woche für Check-in und Planung. Die Aufgaben selbst integrierst du in deinen Alltag.'],
                ['Was kostet die Challenge?', 'Der Einstieg ist kostenlos. Optional: 9,90 € Einmalbeitrag — der durch viele Krankenkassen erstattet wird.'],
                ['Was passiert nach 8 Wochen?', 'Du bekommst deine komplette Auswertung, deinen personalisierten Langzeit-Stack und kannst in die nächste Kohorte.'],
              ].map(([q, a]) => (
                <div key={q} className="rounded-xl border border-outline/40 bg-bg p-5">
                  <p className="font-semibold text-text">{q}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <SiteFooter />
    </div>
  );
}
