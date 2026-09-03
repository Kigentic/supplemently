import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

export const metadata = {
  title: 'Impressum — MoveIn8',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Impressum</h1>
        <p className="mt-2 text-sm text-text-muted">Angaben gemäß § 5 TMG</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-text-muted">
          <p>
            Turnkiste GmbH
            <br />
            vertreten durch den Geschäftsführer Philipp Kamphaus
            <br />
            Bittermarkstr. 17,
            <br />
            44229 Dortmund
          </p>

          <div>
            <p className="font-semibold text-text">Kontakt:</p>
            <p>
              E-Mail: <a href="mailto:info@turnkiste.de" className="text-accent hover:underline">info@turnkiste.de</a>
              <br />
              Telefon: 0179 90 48 010
            </p>
          </div>

          <div>
            <p className="font-semibold text-text">Umsatzsteueridentifikationsnummer</p>
            <p>(gem. § 27a UStG): DE348393645</p>
          </div>

          <div>
            <p className="font-semibold text-text">Handelsregister-Nummer</p>
            <p>HRB 35259</p>
          </div>

          <div>
            <p className="font-semibold text-text">Verantwortlich für den Inhalt</p>
            <p>Philipp Kamphaus</p>
          </div>

          <div>
            <h2 className="font-semibold text-text">Datenschutz</h2>
            <p className="mt-1">
              Personenbezogene Daten werden nur mit Ihrem Wissen und Ihrer Einwilligung erhoben. Auf
              Antrag erhalten Sie unentgeltlich Auskunft zu den über Sie gespeicherten
              personenbezogenen Daten. Wenden Sie sich dazu bitte an unsere E-Mail-Adresse. Details
              entnehmen Sie bitte den Datenschutzinformationen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-text">Schutzrechtsverletzung</h2>
            <p className="mt-1">
              Falls Sie vermuten, dass von dieser Website aus eines Ihrer Schutzrechte verletzt wird,
              teilen Sie das bitte umgehend per elektronischer Post mit, damit zügig Abhilfe geschafft
              werden kann.
            </p>
            <p className="mt-1">
              Gemäß § 28 BDSG widersprechen wir jeder kommerziellen Verwendung und Weitergabe unserer
              Daten.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-text">Haftungsausschluss für die Inhalte</h2>
            <p className="mt-1">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten
              nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als
              Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
              Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von
              Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
              diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
              Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden
              wir diese Inhalte umgehend entfernen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-text">Haftungsausschluss für Links</h2>
            <p className="mt-1">
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen
              Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr
              übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder
              Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der
              Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum
              Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der
              verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht
              zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
              entfernen.
            </p>
          </div>

          <div>
            <h2 className="font-semibold text-text">Urheberrecht</h2>
            <p className="mt-1">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen
              dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art
              der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
              Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind
              nicht gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden,
              werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
              gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden,
              bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen
              werden wir derartige Inhalte umgehend entfernen.
            </p>
          </div>

          <p className="text-xs">Quelle: e-recht24.de</p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
