// Rückenfit Challenge — B2C-Landingpage im MoveIn8-CI (Orange).
// Struktur an app/longevity-challenge/page.tsx angelehnt, Copy auf
// Rückengesundheit/Mobility umgeschrieben.
import type { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SiteHeader from '../_components/SiteHeader';
import SiteFooter from '../_components/SiteFooter';
import { OrbitGraphic, StatBar, ProgressRing, PillarHub, WeekTimeline, ShieldHeartIcon } from '../_components/Illustrations';
import PresalesCoachWidget from '../_components/PresalesCoachWidget';

export const metadata = {
  title: 'Rückenfit Challenge — 8 Wochen zu einem starken, schmerzfreien Rücken',
  description:
    'Die Rückenfit Challenge von MoveIn8: Training, Mobility, Ernährung und KI-Coaching individuell auf dich abgestimmt. 8 Wochen, echte Community, messbare Ergebnisse.',
};

const btnPrimary =
  'inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[.98]';
const btnSecondary =
  'inline-block rounded-full border border-outline px-8 py-4 text-base font-medium text-text transition hover:border-text';

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
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: color }}>
          {initial}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Kennst du das?</span>
      </div>
      <p className="text-sm leading-relaxed text-text">{text}</p>
    </div>
  );
}

export default function RueckenChallengePage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader
        ctaLabel="Challenge-Plan erstellen"
        ctaHref="/ruecken-challenge/plan"
        logoHref="/ruecken-challenge"
        showNavLinks={false}
      />

      <main>

        {/* ═══ 1. HERO ═══════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(65% 55% at 15% 0%, rgba(246,139,53,0.16) 0%, transparent 65%)' }}
          />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                <span className="text-sm font-medium text-accent">Community startet bald</span>
              </div>

              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-6xl">
                In 8 Wochen zu <span className="text-accent">deinem</span> starken,
                schmerzfreien Rücken.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
                Die Rückenfit Challenge: gezieltes Training, Mobility und Haltung — individuell
                auf dich berechnet, nicht auf einen generischen Rückenkurs. Mit KI-Coach,
                Wochenplan und echter Community.
              </p>

              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
                <Link href="/ruecken-challenge/plan" className={btnPrimary + ' w-full text-center sm:w-auto'}>
                  Erstelle deinen Challenge-Plan
                </Link>
                <a href="#preis" className={btnSecondary + ' w-full text-center sm:w-auto'}>
                  Was kostet's?
                </a>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-2">
                <TrustPill>In 2 Minuten personalisiert</TrustPill>
                <TrustPill>Kein Abo — ein Programm, ein Ergebnis</TrustPill>
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
                8 Stunden Schreibtisch. <br />
                Und abends zieht's im Rücken.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-text-muted">
                Ergonomischer Stuhl, ab und zu Dehnen, ein Physio-Termin alle paar Monate — und
                trotzdem: der Rücken meldet sich wieder. Das liegt nicht daran, dass du nichts tust.
                Es liegt daran, dass generische Rückenübungen nie auf deine Haltung, dein
                Alltagsprofil und deine Schwachstellen zugeschnitten sind.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <QuoteCard
                initial="T"
                color="#d9701e"
                text="„Ich sitze den ganzen Tag im Büro — abends kann ich mich kaum noch aufrichten.“"
              />
              <QuoteCard
                initial="R"
                color="#f68b35"
                text="„Ich hab Angst, beim Training was falsch zu machen und mir den Rücken noch mehr zu ruinieren.“"
              />
              <QuoteCard
                initial="A"
                color="#d9701e"
                text="„Dehnen allein bringt bei mir nichts mehr — ich bräuchte einen echten Plan.“"
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
              Kein Rückenkurs von der Stange. Dein Profil entscheidet, was du bekommst.
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
                  <span className="text-accent">Ein anderer Rücken.</span>
                </h2>
                <p className="mt-5 leading-relaxed text-text-muted">
                  Du startest mit einer Baseline — Schmerzlevel, Beweglichkeit, Haltung, Fitness.
                  Jede Woche trackst du dein Befinden. Am Ende siehst du schwarz auf weiß, was
                  sich verändert hat. Nicht gefühlt. Gemessen.
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
                  <StatBar label="Schmerzfreiheit" from={3} to={8} />
                  <StatBar label="Beweglichkeit" from={4} to={8} />
                  <StatBar label="Haltung im Alltag" from={4} to={9} />
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
                text: 'Registrieren, Fragebogen zu Beschwerden, Training, Alltag und Lifestyle beantworten. Du bekommst sofort deinen individuellen Supplement-Stack.',
              },
              {
                step: '02',
                title: 'Jede Woche neue Aufgaben',
                text: 'Montags kommen deine Aufgaben in 5 Bereichen. Freitags checkst du ein: was geschafft, wie geht\'s dir. Dein Score wird aktualisiert.',
              },
              {
                step: '03',
                title: 'Nach 8 Wochen auswerten',
                text: 'Komplette Transformation sichtbar — Schmerzlevel, Beweglichkeit, Haltung, Körpergefühl. Die Top 3 gewinnen Preise. Du gewinnst auf jeden Fall.',
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

        {/* ═══ 7. KI-COACH CHARLES ════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Kicker>Nie wieder allein mit deinen Fragen</Kicker>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Charles beantwortet sie. <br />
                <span className="text-accent">Rund um die Uhr.</span>
              </h2>
              <p className="mt-5 leading-relaxed text-text-muted">
                Ob Frage zur richtigen Ausführung, zum Supplement oder zur aktuellen
                Wochenaufgabe — dein persönlicher KI-Coach kennt deine komplette Challenge und
                antwortet sofort. Kein Warten auf Rückmeldung, keine Standard-Antworten.
              </p>
              <ul className="mt-6 space-y-3">
                <Check>Kennt automatisch deinen Plan und deine Woche</Check>
                <Check>Beantwortet Fragen zu Übungsausführung und Belastung</Check>
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
                    Darf ich trainieren, obwohl mein Rücken gerade zwickt?
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full">
                    <Image src="/Trainer_Icon.png" alt="Charles" fill sizes="28px" className="object-cover object-top" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-bg px-3.5 py-2.5 text-sm text-text shadow-sm">
                    Kommt auf die Beschwerde an — bei akuten Schmerzen gilt grundsätzlich: erst ärztlich abklären …
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 8. PERSONALISIERUNG ════════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="grid items-center gap-14 lg:grid-cols-2">
              <div>
                <Kicker>100% personalisiert</Kicker>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                  So individuell wie deine Haltung.
                </h2>
                <p className="mt-5 leading-relaxed text-text-muted">
                  Dein Ergebnis entsteht aus über 30 Parametern: Trainingslevel, Gelenkprobleme,
                  Schlafqualität, Stresslevel, Medikamente, Vorerkrankungen. Kein Einheits-Stack —
                  deins.
                </p>
                <ul className="mt-6 space-y-3">
                  <Check>Bürojob oder körperliche Arbeit — anderes Belastungsprofil</Check>
                  <Check>Chronischer Stress erhöht Verspannungen — wird mitbehandelt</Check>
                  <Check>Bestehende Gelenkprobleme fließen in die Übungsauswahl ein</Check>
                  <Check>Schlechter Schlaf bremst Regeneration — anderer Ansatz</Check>
                </ul>
              </div>

              <div className="rounded-3xl bg-bg p-6 sm:p-8">
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text-muted">
                  Dein Ergebnis nach dem Fragebogen
                </p>
                {[
                  { tier: 'Must-have', color: 'bg-amber-500', items: ['Magnesium', 'Vitamin D3+K2', 'Omega-3'] },
                  { tier: 'Deine Basics', color: 'bg-accent', items: ['MSM', 'Kollagen'] },
                  { tier: 'Specials', color: 'bg-indigo-500', items: ['Curcumin', 'Boswellia'] },
                  { tier: 'Add-ons', color: 'bg-outline', items: ['Ashwagandha', 'Vitamin B-Komplex'] },
                ].map((t) => (
                  <div key={t.tier} className="mb-4 last:mb-0">
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
                  Jede Empfehlung mit konkreter Begründung — basierend auf deinen Antworten, nicht
                  auf generischen Verkaufslisten.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 9. BONUS — Buddy + Krankenkasse ════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <Kicker>Zwei Bonus-Hebel</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Nicht allein. Mit echten Vorteilen.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-3xl bg-surface p-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-2xl">🤝</div>
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
        </section>

        {/* ═══ 9b. WAS KOSTET'S ════════════════════════════════════════════════ */}
        <section id="preis" className="mx-auto max-w-4xl scroll-mt-20 px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>Investition, keine Rate</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Ein Programm. Ein Preis. Ein Ergebnis.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              Kein Abo, das du wieder kündigen musst. Du zahlst einmalig für 8 Wochen mit
              vollständiger Betreuung — nicht für Zutritt zu einem Raum mit Geräten.
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-md rounded-3xl border-2 border-accent/30 bg-surface p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-muted">Rückenfit Challenge</p>
            <p className="mt-3 text-5xl font-bold tracking-tight text-text">
              299&nbsp;€ <span className="text-lg font-medium text-text-muted">einmalig</span>
            </p>
            <p className="mt-2 text-sm text-text-muted">für 8 Wochen — kein Abo, keine Folgekosten</p>

            <ul className="mt-7 space-y-2.5 text-left">
              <Check>Individueller Trainings- und Supplement-Plan</Check>
              <Check>§20-zertifizierte Ernährungs-App inklusive</Check>
              <Check>KI-Coach Charles — 24/7 erreichbar</Check>
              <Check>Wöchentliche Aufgaben, Ziele &amp; Check-ins mit Score</Check>
              <Check>Community &amp; Buddy-System</Check>
            </ul>

            <Link href="/ruecken-challenge/plan" className={btnPrimary + ' mt-8 block w-full text-center'}>
              Jetzt Platz reservieren →
            </Link>
            <p className="mt-3 text-xs text-text-muted">
              Reservierung unverbindlich — Zahlung &amp; Start erst bei deiner Aktivierung im Studio.
            </p>
          </div>
        </section>

        {/* ═══ 10. GEWINNSPIEL ══════════════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <Kicker>On top</Kicker>
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
                { platz: '1', label: 'Platz 1', preis: 'Premium Supplement-Paket + Mobility-Coaching', border: 'border-amber-300' },
                { platz: '2', label: 'Platz 2', preis: 'Supplement-Gutschein + Jahres-Zugang', border: 'border-outline' },
                { platz: '3', label: 'Platz 3', preis: 'Personalisiertes Supplement-Starter-Paket', border: 'border-orange-200' },
              ].map((p) => (
                <div key={p.platz} className={`rounded-2xl border-2 bg-bg p-6 text-center ${p.border}`}>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-bold text-on-accent mx-auto">
                    {p.platz}
                  </span>
                  <p className="mt-4 font-semibold text-text">{p.label}</p>
                  <p className="mt-1 text-sm text-text-muted">{p.preis}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 11. SCIENCE ═════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <Kicker>Evidenzbasiert</Kicker>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Ein starker Rücken ist kein Zufall. Es ist Training.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-text-muted">
              Wer Rumpfstabilität, Mobility und Haltung strukturiert trainiert, reduziert
              wiederkehrende Rückenschmerzen nachweislich. Nicht durch Schonung. Durch Bewegung.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { pct: 76, zahl: '−41%', label: 'Schmerzintensität', text: 'bei regelmäßigem, gezieltem Rückentraining' },
              { pct: 69, zahl: '+34%', label: 'Rumpfstabilität', text: 'durch progressives Core- und Mobility-Training' },
              { pct: 63, zahl: '−28%', label: 'Verspannungen', text: 'bei Kombination aus Bewegung + Stressmanagement' },
              { pct: 88, zahl: '×2.3', label: 'Beweglichkeit', text: 'nach 8 Wochen strukturiertem Mobility-Programm' },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center rounded-2xl bg-surface p-6 text-center">
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
            Angaben auf Basis einschlägiger Studien. Individuelle Ergebnisse können variieren. Bei
            akuten Beschwerden gilt: erst ärztlich abklären lassen.
          </p>
        </section>

        {/* ═══ 12. FINAL CTA + FAQ ════════════════════════════════════════════ */}
        <section className="bg-surface">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
            <h2 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl">
              Dein starker Rücken wartet. <br />
              <span className="text-accent">8 Wochen bis dahin.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-text-muted">
              Erstelle deinen Plan und reserviere deinen Platz — aktiviert wird er, sobald du
              im Studio vorbeikommst.
            </p>

            <div className="mt-10 flex flex-col items-center gap-4">
              <Link href="/ruecken-challenge/plan" className={btnPrimary + ' px-10 py-5 text-lg'}>
                Erstelle deinen Challenge-Plan →
              </Link>
              <p className="text-sm text-text-muted">
                299 € einmalig · Ernährungs-App §20-zertifiziert · Kosten bis zu 150 € erstattungsfähig
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-4 text-left sm:grid-cols-2">
              {[
                ['Ich hab akute Rückenschmerzen — kann ich trotzdem mitmachen?', 'Bei akuten oder chronischen Beschwerden solltest du das vorher ärztlich abklären lassen. Im Fragebogen erfassen wir Vorerkrankungen und passen die Übungsauswahl entsprechend an.'],
                ['Wie viel Zeit brauche ich?', '30–60 Minuten pro Woche für Check-in und Planung. Die Aufgaben integrierst du in deinen Alltag.'],
                ['Was kostet die Challenge?', '299 € einmalig für die vollen 8 Wochen — kein Abo. Die enthaltene §20-zertifizierte Ernährungs-App kann zusätzlich separat über deine Krankenkasse erstattet werden.'],
                ['Was passiert nach der Anmeldung?', 'Du bekommst sofort deinen Challenge-Pass mit QR-Code — dein Platz ist reserviert. Zahlung und Start laufen im Studio: dort wird der Pass gescannt und deine Teilnahme aktiviert.'],
                ['Was passiert nach 8 Wochen?', 'Du bekommst deine komplette Auswertung, deinen langfristigen Stack und kannst in die nächste Runde der Community starten.'],
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

      <SiteFooter tagline="Die Rückenfit Challenge — individuell auf dich abgestimmt." />
      <PresalesCoachWidget
        challengeSlug="ruecken-challenge-1"
        challengeName="Rückenfit Challenge"
        planHref="/ruecken-challenge/plan"
      />
    </div>
  );
}
