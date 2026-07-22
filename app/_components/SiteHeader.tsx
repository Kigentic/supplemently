// Supplemently — gemeinsamer Header (Landingpage + Fragebogen).
import Image from 'next/image';
import Link from 'next/link';

const HEADER_LOGO = 88;

export default function SiteHeader({
  ctaHref = '/#registrierung',
  ctaLabel = 'Partnerstudio werden',
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline/40 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Supplemently — Startseite">
          <Image
            src="/supplemently-logo-final.png"
            alt="Supplemently"
            width={HEADER_LOGO}
            height={HEADER_LOGO}
            style={{ height: HEADER_LOGO, width: 'auto' }}
            priority
          />
        </Link>
        <Link
          href={ctaHref}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
        >
          {ctaLabel}
        </Link>
      </div>
    </header>
  );
}
