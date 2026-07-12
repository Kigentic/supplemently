// Supplemently — gemeinsamer Footer (Landingpage + Fragebogen).
import Image from 'next/image';

export default function SiteFooter() {
  return (
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
            <a href="/#" className="text-text-muted transition hover:text-text">Impressum</a>
            <a href="/#" className="text-text-muted transition hover:text-text">Datenschutz</a>
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
  );
}
