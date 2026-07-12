// Supplemently — öffentliche B2B-Landingpage (helles Theme).
// Zielgruppe: Fitnessstudio-Inhaber in DACH. Mobile-first, Single-Page.
import Image from 'next/image';
import type { ReactNode } from 'react';
import RegistrierungForm from './_components/RegistrierungForm';

// --- kleine Bausteine -------------------------------------------------------

function Kicker({ children }: { children: ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{children}</p>;
}

function TrustBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-outline bg-bg px-3.5 py-1.5 text-sm text-text-muted">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
        <path d="M20 6 9 17l-5-5" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </span>
  );
}

function FeatureCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl bg-surface p-6 transition hover:-translate-y-0.5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-on-accent">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{text}</p>
    </div>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Kicker>{eyebrow}</Kicker>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-base leading-relaxed text-text-muted">{sub}</p>}
    </div>
  );
}

const btnPrimary =
  'rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-on-accent transition hover:bg-accent-hover';
const btnSecondary =
  'rounded-full border border-outline bg-transparent px-7 py-3.5 text-base font-medium text-text transition hover:border-text';

// --- Icons (inline, keine externe Lib) --------------------------------------

const IconClipboard = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);
const IconTarget = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1" />
  </svg>
);
const IconShield = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconQr = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M20 14v.01M14 20h.01M17 20h.01M20 17v3" />
  </svg>
);

const HEADER_LOGO = 88;

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="shrink-0">
      <path d="M20 6 9 17l-5-5" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-outline/40 bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <Image
            src="/supplemently-logo-final.png"
            alt="Supplemently"
            width={HEADER_LOGO}
            height={HEADER_LOGO}
            style={{ height: HEADER_LOGO, width: 'auto' }}
            priority
          />
          <a href="#registrierung" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover">
            Partnerstudio werden
          </a>
        </div>
      </header>

      <main>
        {/* 1 — Hero */}
        <section className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(55% 55% at 50% 0%, rgba(246,139,53,0.10), transparent 70%)' }}
          />
          <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-16 text-center sm:pt-24">
            <p className="mb-5 inline-block rounded-full border border-outline px-4 py-1.5 text-sm text-text-muted">
              Das Partner-Tool für Fitnessstudios
            </p>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-text sm:text-6xl">
              Nur die Nährstoffe, die deine Mitglieder wirklich brauchen
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
              Supplemently ist der Whitelabel-Ratgeber für dein Studio. Deine Mitglieder beantworten
              ein paar Fragen zu Ernährung, Lifestyle und Training — und bekommen eine ehrliche,
              individuelle Empfehlung. Nur was sinnvoll ist, in Formen, die der Körper auch aufnimmt.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#registrierung" className={btnPrimary + ' w-full text-center sm:w-auto'}>
                Jetzt Partnerstudio werden
              </a>
              <a href="/fragebogen" className={btnSecondary + ' w-full text-center sm:w-auto'}>
                Jetzt direkt live testen
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <TrustBadge>Nur was wirklich nötig ist</TrustBadge>
              <TrustBadge>Auf Bioverfügbarkeit optimiert</TrustBadge>
              <TrustBadge>Evidenzbasiert</TrustBadge>
            </div>
          </div>
        </section>

        {/* 2 — Tool-Nuggets */}
        <section id="so-funktionierts" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Was das Tool macht"
            title="Ein verlässlicher Ratgeber statt Regal-Raten"
            sub="Deine Mitglieder beantworten ein paar Fragen zu Ernährung, Lifestyle und Trainingslevel und bekommen eine ehrliche, individuelle Auswertung — direkt in deinem Studio-Branding."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={IconClipboard} title="Persönlicher Fragebogen" text="Ein paar Fragen zu Ernährung, Lifestyle und Trainingslevel — verständlich, in rund zwei Minuten." />
            <FeatureCard icon={IconShield} title="Nur was wirklich nötig ist" text="Empfohlen wird ausschließlich, was für die Nährstoffversorgung sinnvoll ist. Das spart deinen Mitgliedern unnötige Ausgaben." />
            <FeatureCard icon={IconTarget} title="Auf Bioverfügbarkeit geachtet" text="Nicht jede Form wirkt gleich. Empfohlen wird die, die der Körper auch wirklich aufnimmt." />
            <FeatureCard icon={IconQr} title="Gebrandete Studio-Microsite" text="Eigenes Branding, eigener Link und QR-Code. Deine Mitglieder sehen dein Studio, nicht uns." />
          </div>
        </section>

        {/* 3 — Marketing-Optionen */}
        <section className="bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2">
            <div>
              <Kicker>Vorteil fürs Studio</Kicker>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Ein Angebot, das kaum ein Studio hat
              </h2>
              <p className="mt-4 leading-relaxed text-text-muted">
                Die wenigsten Studios geben ihren Mitgliedern beim Thema Nahrungsergänzung echte
                Orientierung. Mit Supplemently lieferst du sofort Mehrwert — unter deinem eigenen Namen.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  ['Sofort Mehrwert für Mitglieder', 'Ein nützliches Tool, das du ab Tag eins anbieten kannst — ohne eigenes Fachwissen aufzubauen.'],
                  ['Gebrandete Microsite', 'Alles läuft unter deinem Studio. Das stärkt dein Image und den Trust bei deinen Mitgliedern.'],
                  ['Eigener QR-Code', 'Auf Flyern, in Social Media oder vor Ort — ein Scan führt zum Check in deinem Branding.'],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-1"><CheckIcon /></span>
                    <span><strong className="font-semibold text-text">{t}.</strong> <span className="text-text-muted">{d}</span></span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-bg p-8">
              <div className="mx-auto flex aspect-square max-w-xs flex-col items-center justify-center gap-4 rounded-2xl border border-outline p-8 text-center">
                <div className="grid h-28 w-28 grid-cols-4 grid-rows-4 gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className={((i * 7) % 3 === 0 ? 'bg-accent' : 'bg-outline/50') + ' rounded-sm'} />
                  ))}
                </div>
                <p className="text-sm text-text-muted">Dein Studio-QR — ein Scan, ein neuer Lead.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4 — Sales-Boost */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-3 gap-3">
                {['Whey', 'Kreatin', 'Omega-3', 'Magnesium', 'Vitamin D', 'Zink'].map((p, i) => (
                  <div key={p} className={'rounded-xl bg-surface p-4 text-center ' + (i === 1 ? 'ring-2 ring-accent' : '')}>
                    <div className="mx-auto mb-2 h-10 w-7 rounded bg-accent/25" />
                    <span className="text-xs text-text-muted">{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <Kicker>Zusätzliche Einnahmen</Kicker>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Verkaufe, was deine Mitglieder wirklich brauchen
              </h2>
              <p className="mt-4 leading-relaxed text-text-muted">
                Viele Studios verkaufen bereits Supplements am Tresen oder im eigenen Shop. Supplemently
                lenkt die Empfehlung direkt dorthin — individuell und vertrauenswürdig statt generischer
                Regal-Verkauf.
              </p>
              <p className="mt-4 leading-relaxed text-text-muted">
                Das Ergebnis: mehr qualifizierte Kaufanlässe. Wer eine ehrliche, auf sich zugeschnittene
                Empfehlung erhält, kauft mit gutem Gefühl — und kommt wieder.
              </p>
            </div>
          </div>
        </section>

        {/* 5 — Preis / Trust */}
        <section className="bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
              <div className="flex flex-col justify-center rounded-3xl bg-bg p-8 sm:p-10">
                <Kicker>Transparenter Einstieg</Kicker>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-5xl font-semibold tracking-tight text-text">29,90&nbsp;€<sup className="align-super text-2xl">*</sup></span>
                  <span className="text-text-muted">/ Monat</span>
                </div>
                <p className="mt-3 text-sm text-text-muted">* Alle Preise netto, zzgl. gesetzlicher MwSt. — B2B-Angebot für Studios.</p>
                <ul className="mt-6 space-y-3 text-text">
                  {['Keine versteckten Kosten', 'Eigenes Branding inklusive', 'In wenigen Minuten startklar'].map((t) => (
                    <li key={t} className="flex items-center gap-3"><CheckIcon />{t}</li>
                  ))}
                </ul>
                <a href="#registrierung" className={btnPrimary + ' mt-8 text-center'}>Unverbindlich starten</a>
                <a href="/fragebogen" className={btnSecondary + ' mt-3 text-center'}>Jetzt direkt ausprobieren</a>
              </div>
              <div className="flex flex-col justify-center rounded-3xl border border-outline bg-bg p-8 sm:p-10">
                <h3 className="text-2xl font-semibold text-text">Worauf deine Mitglieder sich verlassen können</h3>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ['Ehrliche Empfehlungen', 'Nur was wirklich nötig ist — das spart deinen Mitgliedern unnötige Ausgaben.'],
                    ['Bioverfügbarkeit im Blick', 'Empfohlen wird die Form eines Wirkstoffs, die der Körper auch aufnimmt.'],
                    ['Evidenzbasiert', 'Empfehlungen nach fachlichem Stand, immer mit klarem medizinischem Hinweis.'],
                    ['Dein Branding, dein Kanal', 'Die Microsite läuft komplett unter deinem Studio.'],
                  ].map(([t, d]) => (
                    <div key={t} className="rounded-xl bg-surface p-4">
                      <p className="font-semibold text-text">{t}</p>
                      <p className="mt-1 text-sm text-text-muted">{d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 — Registrierung */}
        <section id="registrierung" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-16 sm:py-24">
          <SectionHeading
            eyebrow="Jetzt Partnerstudio werden"
            title="Lass uns dein Studio startklar machen"
            sub="Trag dich unverbindlich ein — wir melden uns innerhalb von 24 Stunden und richten deine gebrandete Microsite ein."
          />
          <div className="mt-10">
            <RegistrierungForm />
          </div>
        </section>
      </main>

      {/* 7 — Footer */}
      <footer className="border-t border-outline/50 bg-bg">
        <div className="mx-auto max-w-6xl px-5 py-12">
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
            <div className="max-w-sm">
              <Image
                src="/supplemently-logo-final.png"
                alt="Supplemently"
                width={128}
                height={128}
                style={{ height: 128, width: 'auto' }}
              />
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                Der ehrliche Nährstoff-Ratgeber für Fitnessstudios und ihre Mitglieder.
              </p>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <a href="#" className="text-text-muted transition hover:text-text">Impressum</a>
              <a href="#" className="text-text-muted transition hover:text-text">Datenschutz</a>
              <a href="mailto:hallo@supplemently.de" className="text-text-muted transition hover:text-text">
                hallo@supplemently.de
              </a>
            </div>
          </div>
          <div className="mt-10 border-t border-outline/50 pt-6 text-xs text-text-muted">
            © {new Date().getFullYear()} Supplemently. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
}
