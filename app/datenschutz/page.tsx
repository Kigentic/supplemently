import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

export const metadata = {
  title: 'Datenschutzerklärung — MoveIn8',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-text">{title}</h2>
      <div className="mt-1.5 space-y-2">{children}</div>
    </div>
  );
}

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Datenschutzerklärung</h1>
        <p className="mt-2 text-sm text-text-muted">Stand: August 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-text-muted">
          <p>
            Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Diese Erklärung informiert Sie,
            welche Daten bei der Nutzung dieser Challenge-Plattform verarbeitet werden, zu welchem
            Zweck, auf welcher Rechtsgrundlage und welche Rechte Ihnen zustehen — gemäß der
            Datenschutz-Grundverordnung (DSGVO) und dem Bundesdatenschutzgesetz (BDSG).
          </p>

          <Section title="1. Verantwortlicher">
            <p>
              Turnkiste GmbH
              <br />
              vertreten durch den Geschäftsführer Philipp Kamphaus
              <br />
              Bittermarkstr. 17, 44229 Dortmund
              <br />
              E-Mail: <a href="mailto:info@turnkiste.de" className="text-accent hover:underline">info@turnkiste.de</a>
              <br />
              Telefon: 0179 90 48 010
            </p>
          </Section>

          <Section title="2. Zweckbindung: Speicherung nur zur Erfüllung der Challenge">
            <p>
              Wir erheben und speichern Ihre personenbezogenen Daten (Name, E-Mail-Adresse,
              Onboarding-Angaben, Wochen-Check-ins, Trainingsplan- und Supplement-Präferenzen)
              ausschließlich zu dem Zweck, Ihnen die gebuchte Challenge bereitzustellen und
              durchzuführen: Fortschritts-Tracking, personalisierte Aufgaben, Trainingsplan- und
              Supplement-Empfehlungen sowie die Kommunikation rund um Ihre Teilnahme. Eine Nutzung für
              andere Zwecke — insbesondere Weiterverkauf an Dritte oder zweckfremdes Profiling — findet
              nicht statt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie,
              soweit gesondert eingewilligt, Art. 6 Abs. 1 lit. a DSGVO.
            </p>
            <p>
              Nach Abschluss oder Abbruch der Challenge werden Ihre Daten gelöscht oder anonymisiert,
              sobald sie für die Zweckerfüllung, für die Abrechnung mit Ihrem Studio oder für
              gesetzliche Aufbewahrungspflichten nicht mehr benötigt werden. Sie können jederzeit die
              vollständige Löschung Ihres Kontos verlangen (Kontakt siehe oben oder über Ihr Studio).
            </p>
          </Section>

          <Section title="3. Registrierung, Login & Challenge-Nutzung">
            <p>
              Für die Teilnahme legen wir über unseren Hosting- und Datenbankdienstleister Supabase
              (Supabase Inc., mit Serverstandort in der EU) ein Nutzerkonto an. Verarbeitet werden Ihre
              Registrierungsangaben, Ihre Onboarding-Antworten, Ihre Wochen-Check-ins
              (Gewohnheiten-Ampeln, Wohlbefinden, Freitext) sowie Ihr Fortschritt/Score innerhalb der
              Challenge. Ihr Studio (Vertragspartner für die Challenge) sieht dabei nur die für die
              Betreuung erforderlichen Daten seiner eigenen Teilnehmenden.
            </p>
          </Section>

          <Section title="4. Digitaler Assistent (KI-Coach „Charles“)">
            <p>
              Innerhalb der Challenge können Sie einen KI-gestützten Chat-Assistenten („Charles“)
              nutzen, um Fragen zu Aufgaben, Training, Ernährung und Supplements zu stellen. Ihre
              Chat-Nachrichten werden dafür an unseren Sprachmodell-Anbieter OpenAI, L.L.C. (USA)
              übermittelt und dort verarbeitet, um eine Antwort zu erzeugen; die Übermittlung an ein
              Drittland erfolgt auf Grundlage der EU-Standardvertragsklauseln bzw. eines
              Angemessenheitsbeschlusses. Es findet keine automatisierte Entscheidung mit rechtlicher
              Wirkung Ihnen gegenüber statt (kein Profiling im Sinne von Art. 22 DSGVO) — der
              Assistent gibt lediglich informative Antworten auf Basis Ihrer Frage und
              challenge-bezogener Inhalte. Rechtsgrundlage ist unser berechtigtes Interesse an einer
              hilfreichen Produktfunktion (Art. 6 Abs. 1 lit. f DSGVO) bzw. die Vertragserfüllung, da
              der Coach Teil der gebuchten Challenge ist. Die Nutzung des Chats ist freiwillig; ohne
              Nutzung werden keine Chat-Daten an OpenAI übermittelt.
            </p>
          </Section>

          <Section title="5. Affiliate-Empfehlungen & Link-Tracking">
            <p>
              An passenden Stellen (z. B. nach dem Onboarding oder einem Wochen-Check-in) empfehlen wir
              Ihnen Produkte von Partnerunternehmen (Affiliate-Links), teils mit Rabattcode. Wenn wir
              Ihnen einen solchen Link anzeigen, speichern wir dazu einen Log-Eintrag (welches Produkt,
              zu welchem Zeitpunkt, im Rahmen welcher Challenge-Phase). Klicken Sie auf den Link,
              erfassen wir zusätzlich den Zeitpunkt des Klicks, bevor Sie zur Partnerseite
              weitergeleitet werden. Dies dient ausschließlich uns bzw. dem Studio zur Auswertung, wie
              gut einzelne Empfehlungen ankommen, sowie ggf. der Provisionsabrechnung mit dem
              Partnerunternehmen. Es werden keine personenbezogenen Daten an die Partnerunternehmen
              übermittelt, die über die beim Partner selbst (z. B. beim Kauf) angegebenen Daten
              hinausgehen. Rechtsgrundlage ist unser berechtigtes Interesse an der Optimierung unseres
              Angebots (Art. 6 Abs. 1 lit. f DSGVO).
            </p>
          </Section>

          <Section title="6. E-Mail-Kommunikation">
            <p>
              Für den Versand von Bestätigungs-, Freischaltungs- und Erinnerungs-E-Mails (z. B.
              Hinweise auf einen offenen Wochen-Check-in) nutzen wir den E-Mail-Dienstleister Resend.
              Übermittelt werden dabei Ihre E-Mail-Adresse, Ihr Vorname sowie der jeweilige Anlass der
              Mail. Erinnerungs-Mails erhalten Sie nur, solange Sie aktiv an einer Challenge teilnehmen
              und den jeweiligen Check-in noch nicht abgegeben haben.
            </p>
          </Section>

          <Section title="7. Hosting & Logfiles">
            <p>
              Diese Website wird bei Vercel Inc. gehostet. Beim Aufruf der Seite werden automatisch
              technische Informationen (u. a. IP-Adresse, Browsertyp, Datum/Uhrzeit des Zugriffs) in
              Server-Logfiles erfasst, um den Betrieb und die Sicherheit der Plattform zu gewährleisten
              (Art. 6 Abs. 1 lit. f DSGVO). Diese Daten werden nicht mit anderen Datenquellen
              zusammengeführt und regelmäßig gelöscht.
            </p>
          </Section>

          <Section title="8. Cookies & lokale Speicherung">
            <p>
              Wir setzen ausschließlich technisch notwendige Cookies bzw. lokalen Browser-Speicher ein,
              um Sie nach dem Login eingeloggt zu halten (Sitzungsverwaltung über Supabase Auth). Eine
              Analyse Ihres Surfverhaltens zu Werbe- oder Marketingzwecken (z. B. über Google Analytics
              oder vergleichbare Dienste) findet auf dieser Plattform nicht statt.
            </p>
          </Section>

          <Section title="9. Empfänger und Auftragsverarbeiter">
            <p>
              Zur Bereitstellung der Challenge setzen wir folgende Dienstleister als Auftragsverarbeiter
              ein, mit denen jeweils ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO besteht:
              Supabase Inc. (Datenbank & Authentifizierung), Vercel Inc. (Hosting), Resend (E-Mail-Versand)
              und OpenAI, L.L.C. (KI-Coach-Funktion, nur bei aktiver Nutzung des Chats). Eine
              Weitergabe Ihrer Daten über diese Dienstleister sowie Ihr eigenes Studio hinaus an Dritte
              erfolgt nicht, es sei denn, wir sind gesetzlich dazu verpflichtet.
            </p>
          </Section>

          <Section title="10. Ihre Rechte">
            <p>
              Sie haben jederzeit das Recht auf Auskunft über die zu Ihrer Person gespeicherten Daten
              (Art. 15 DSGVO), auf Berichtigung (Art. 16 DSGVO), auf Löschung (Art. 17 DSGVO), auf
              Einschränkung der Verarbeitung (Art. 18 DSGVO), auf Datenübertragbarkeit (Art. 20 DSGVO)
              sowie auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO). Wenden Sie sich hierzu an
              die oben genannte Kontaktadresse oder an Ihr Studio. Ihnen steht zudem ein
              Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu.
            </p>
          </Section>

          <Section title="11. Änderung dieser Datenschutzerklärung">
            <p>
              Wir passen diese Erklärung an, sobald sich die von uns verarbeiteten Daten oder
              eingesetzten Dienste ändern. Es gilt jeweils die aktuell auf dieser Seite abrufbare
              Fassung.
            </p>
          </Section>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
