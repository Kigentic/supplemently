// Gemeinsamer Header (Landingpage + Fragebogen).
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabaseBrowser';

const HEADER_LOGO = 56;

export default function SiteHeader({
  ctaHref = '/challenge/registrierung',
  ctaLabel = 'Jetzt anmelden',
  loggedIn: loggedInProp,
}: {
  ctaHref?: string;
  ctaLabel?: string;
  /** Optional: bekannter Login-Status (vermeidet Flackern). Ohne Angabe prüft der Header selbst. */
  loggedIn?: boolean;
}) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(loggedInProp ?? false);

  useEffect(() => {
    if (loggedInProp !== undefined) return;
    getBrowserClient()
      .auth.getSession()
      .then(({ data }) => setLoggedIn(!!data.session));
  }, [loggedInProp]);

  async function onLogout() {
    await getBrowserClient().auth.signOut();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-outline/40 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" aria-label="Startseite">
          <Image
            src="/Logo-turnkiste-weisser-hintergrun.webp"
            alt="Logo"
            width={HEADER_LOGO}
            height={HEADER_LOGO}
            style={{ height: HEADER_LOGO, width: 'auto' }}
            priority
          />
        </Link>
        {loggedIn ? (
          <nav className="flex items-center gap-5">
            <Link
              href="/challenge/dashboard"
              className="text-sm font-medium text-text-muted transition hover:text-text"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-outline px-4 py-2 text-sm font-medium text-text transition hover:border-text"
            >
              Ausloggen
            </button>
          </nav>
        ) : (
          <Link
            href={ctaHref}
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </header>
  );
}
