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

const HEADER_LOGO = 44;

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
              Das Partner-Tool für Fitnessstudios in DACH
            </p>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-text sm:text-6xl">
              Ehrliche Supplement-Empfehlungen für deine Mitglieder
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">
              Supplemently ist ein Whitelabel-Fragebogen für dein Studio. Deine Mitglieder erhalten
              individuelle, evidenzbasierte Empfehlungen — nur was wirklich sinnvoll ist. Kein Scam,
              keine Pauschalpakete, kein Verkaufsdruck.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a href="#registrierung" className={btnPrimary + ' w-full text-center sm:w-auto'}>
                Jetzt Partnerstudio werden
              </a>
              <a href="#so-funktionierts" className={btnSecondary + ' w-full text-center sm:w-auto'}>
                So funktioniert&rsquo;s
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <TrustBadge>Evidenzbasiert</TrustBadge>
              <TrustBadge>DSGVO-konform · Hosting in Frankfurt</TrustBadge>
              <TrustBadge>Kein Verkaufsdruck für deine Mitglieder</TrustBadge>
            </div>
          </div>
        </section>

        {/* 2 — Tool-Nuggets */}
        <section id="so-funktionierts" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:py-20">
          <SectionHeading
            eyebrow="Was das Tool macht"
            title="In zwei Minuten von der Frage zur passenden Empfehlung"
            sub="Deine Mitglieder füllen einen kurzen Fragebogen aus und bekommen eine ehrliche, individuelle Auswertung — direkt in deinem Studio-Branding."
          />
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={IconClipboard} title="Persönlicher Fragebogen" text="2 Minuten zu Ernährung, Lifestyle und Trainingslevel — verständlich und ohne Fachchinesisch." />
            <FeatureCard icon={IconTarget} title="Individuelle Empfehlung" text="Getrennt nach essenziell und optional. Kein Pauschalpaket, sondern auf die Antworten zugeschnitten." />
            <FeatureCard icon={IconShield} title="Kein Scam-Versprechen" text="Empfohlen wird nur, was evidenzbasiert wirklich sinnvoll ist — mit klarem medizinischem Hinweis." />
            <FeatureCard icon={IconQr} title="Gebrandete Studio-Microsite" text="Eigenes Branding, eigener Link und QR-Code. Deine Mitglieder sehen dein Studio, nicht uns." />
          </div>
        </section>

        {/* 3 — Marketing-Optionen */}
        <section className="bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-20 lg:grid-cols-2">
            <div>
              <Kicker>Neukunden gewinnen</Kicker>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
                Ein Akquise-Kanal — nicht nur ein Mitglieder-Feature
              </h2>
              <p className="mt-4 leading-relaxed text-text-muted">
                Supplemently arbeitet auch für dich, wenn jemand noch gar kein Mitglied ist. Der Check
                wird zum Einstieg in dein Studio.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  ['Gebrandeter QR-Code', 'Auf Flyern, in Social Media oder direkt vor Ort — ein Scan führt zum Check in deinem Branding.'],
                  ['Trial-Voucher im Ergebnis', 'Nicht-Mitglieder, die den Check machen, bekommen direkt ein Probetraining-Angebot eingeblendet.'],
                  ['Positionierung als Türöffner', 'Ein echtes Neukundengewinnungs-Tool statt reinem Add-on für Bestandsmitglieder.'],
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
              <Kicker>Mehr Umsatz an der Theke</Kicker>
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
                  <span className="text-5xl font-semibold tracking-tight text-text">ab 24,90&nbsp;€</span>
                  <span className="text-text-muted">/ Monat</span>
                </div>
                <p className="mt-3 text-sm text-text-muted">Platzhalter — finaler Preis wird noch festgelegt.</p>
                <ul className="mt-6 space-y-3 text-text">
                  {['Keine versteckten Kosten', 'Monatlich kündbar', 'Eigenes Branding inklusive'].map((t) => (
                    <li key={t} className="flex items-center gap-3"><CheckIcon />{t}</li>
                  ))}
                </ul>
                <a href="#registrierung" className={btnPrimary + ' mt-8 text-center'}>Unverbindlich starten</a>
              </div>
              <div className="flex flex-col justify-center rounded-3xl border border-outline bg-bg p-8 sm:p-10">
                <h3 className="text-2xl font-semibold text-text">Worauf du dich verlassen kannst</h3>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {[
                    ['Made for DACH', 'Gebaut für den Markt in Deutschland, Österreich und der Schweiz.'],
                    ['Kein Datenverkauf', 'Die Daten deiner Mitglieder werden nicht verkauft — Punkt.'],
                    ['Support auf Deutsch', 'Persönliche Ansprechpartner, keine Ticket-Warteschleife.'],
                    ['DSGVO & Frankfurt', 'Hosting in der EU, datenschutzkonform aufgesetzt.'],
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
                width={64}
                height={64}
                style={{ height: 64, width: 'auto' }}
              />
              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                Ehrliche, evidenzbasierte Supplement-Empfehlungen — als Partner-Tool für Fitnessstudios.
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
