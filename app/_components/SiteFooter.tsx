// Gemeinsamer Footer (Landingpage + Fragebogen).
import Image from 'next/image';

export default function SiteFooter({
  logoSrc = '/MoveIN-nobg.png',
  logoAlt = 'MoveIn8',
  logoHeight = 96,
  tagline = 'Das Studio Challenge System — schlüsselfertig für dein Fitnessstudio.',
}: {
  /** Nur von /turnkiste überschrieben (eigenes Logo/Tagline, Seite bleibt unangetastet). */
  logoSrc?: string;
  logoAlt?: string;
  logoHeight?: number;
  tagline?: string;
}) {
  return (
    <footer className="border-t border-outline/50 bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <Image
              src={logoSrc}
              alt={logoAlt}
              width={logoHeight * 2}
              height={logoHeight}
              style={{ height: `clamp(36px, 9vw, ${logoHeight}px)`, width: 'auto' }}
            />
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              {tagline}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href="/#" className="text-text-muted transition hover:text-text">Impressum</a>
            <a href="/#" className="text-text-muted transition hover:text-text">Datenschutz</a>
            <a href="mailto:hallo@kigentic.de" className="text-text-muted transition hover:text-text">
              hallo@kigentic.de
            </a>
          </div>
        </div>
        <div className="mt-10 border-t border-outline/50 pt-6 text-xs text-text-muted">
          © {new Date().getFullYear()} Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
