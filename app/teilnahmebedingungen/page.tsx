import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

export const metadata = {
  title: 'Teilnahmebedingungen — MoveIn8',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-text">{title}</h2>
      <div className="mt-1.5 space-y-2">{children}</div>
    </div>
  );
}

export default function TeilnahmebedingungenPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Teilnahmebedingungen</h1>
        <p className="mt-2 text-sm text-text-muted">Stand: September 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-text-muted">
          <p>
            Diese Teilnahmebedingungen gelten für die Nutzung der 8-Wochen-Challenges, die über diese
            Plattform durch dein Fitnessstudio angeboten werden. Mit der Registrierung stimmst du
            diesen Bedingungen zu.
          </p>

          <Section title="1. Was die Challenge ist">
            <p>
              Du nimmst über dein Studio an einem 8-wöchigen Challenge-Programm teil. Der genaue
              Ablauf (Wochenaufgaben, Trainingsplan, Fokus) richtet sich nach deinen Angaben im
              Onboarding-Fragebogen und ist individuell auf dich zugeschnitten. Die Inhalte sind
              allgemeine Lifestyle- und Trainingsempfehlungen und ersetzen keine ärztliche oder
              ernährungsmedizinische Beratung. Bei gesundheitlichen Beschwerden, bestehenden
              Erkrankungen oder der Einnahme von Medikamenten sprich vor Beginn oder vor der Einnahme
              von Nahrungsergänzungsmitteln mit einem Arzt.
            </p>
          </Section>

          <Section title="2. Freischaltung durch dein Studio">
            <p>
              Je nach Durchgang erfolgt die Zahlung außerhalb dieser Plattform direkt bei deinem
              Studio. In diesem Fall bleibt dein Zugang nach der Registrierung zunächst inaktiv und
              wird von deinem Studio manuell freigeschaltet, sobald die Zahlung eingegangen ist. Bis
              zur Freischaltung stehen Wochenaufgaben und Check-ins noch nicht zur Verfügung.
            </p>
          </Section>

          <Section title="3. E-Mails im Rahmen der Challenge">
            <p>
              Zur Durchführung der Challenge senden wir dir E-Mails, die für die Teilnahme notwendig
              oder hilfreich sind: Registrierungs- und Freischaltungsbestätigung, Erinnerungen an
              deinen wöchentlichen Check-in (sobald er verfügbar ist und falls du ihn noch nicht
              abgegeben hast) sowie ggf. weitere Hinweise rund um deine Teilnahme. Diese E-Mails sind
              Teil der Challenge-Funktion und keine allgemeine Werbung Dritter.
            </p>
          </Section>

          <Section title="4. Produktempfehlungen & Affiliate-Links">
            <p>
              Basierend auf deinen Angaben im Onboarding-Fragebogen und deinen Wochen-Check-ins zeigen
              wir dir personalisierte Empfehlungen — u. a. zu Supplements sowie zu Produkten und
              Angeboten von Partnerunternehmen (Affiliate-Links, teils mit Rabattcode). Diese
              Empfehlungen sind unverbindlich, es besteht keine Kaufpflicht. Nutzt du einen
              Affiliate-Link, entstehen dir dadurch keine Zusatzkosten; wir bzw. dein Studio können in
              diesem Fall eine Provision vom Partnerunternehmen erhalten. Für die beworbenen Produkte
              und deren Inhalte ist jeweils das Partnerunternehmen verantwortlich.
            </p>
          </Section>

          <Section title="5. Deine Mitwirkung">
            <p>
              Die Ergebnisse der Challenge hängen maßgeblich davon ab, wie konsequent du die
              Wochenaufgaben umsetzt und wie ehrlich du deine Check-ins ausfüllst. Angaben in deinem
              Profil und deinen Check-ins sollten der Wahrheit entsprechen, insbesondere bei
              gesundheitsbezogenen Fragen.
            </p>
          </Section>

          <Section title="6. Beendigung der Teilnahme">
            <p>
              Du kannst die Teilnahme jederzeit beenden, indem du dich an dein Studio oder an uns
              wendest (Kontakt siehe Impressum). Mit Ende der Teilnahme werden deine Daten gemäß
              unserer Datenschutzerklärung gelöscht oder anonymisiert, sofern keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen.
            </p>
          </Section>

          <Section title="7. Datenverarbeitung">
            <p>
              Welche Daten wir zu welchem Zweck verarbeiten — u. a. zum Einsatz des digitalen
              Assistenten und zum Link-Tracking bei Produktempfehlungen — ist ausführlich in unserer{' '}
              <a href="/datenschutz" className="text-accent hover:underline">Datenschutzerklärung</a>{' '}
              beschrieben.
            </p>
          </Section>

          <Section title="8. Änderungen dieser Bedingungen">
            <p>
              Wir passen diese Teilnahmebedingungen an, wenn sich der Ablauf der Challenge oder unsere
              Leistungen ändern. Es gilt jeweils die aktuell auf dieser Seite abrufbare Fassung.
            </p>
          </Section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
