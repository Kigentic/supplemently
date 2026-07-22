// Gemeinsamer Footer (Landingpage + Fragebogen).
import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="border-t border-outline/50 bg-bg">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col items-start justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <Image
              src="/Logo-turnkiste-weisser-hintergrun.webp"
              alt="Logo"
              width={96}
              height={96}
              style={{ height: 96, width: 'auto' }}
            />
            <p className="mt-4 text-sm leading-relaxed text-text-muted">
              Die Longevity Lifestyle Community — individuell auf dich abgestimmt.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <a href="/#" className="text-text-muted transition hover:text-text">Impressum</a>
            <a href="/#" className="text-text-muted transition hover:text-text">Datenschutz</a>
            <a href="mailto:hallo@turnkiste.de" className="text-text-muted transition hover:text-text">
              hallo@turnkiste.de
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
