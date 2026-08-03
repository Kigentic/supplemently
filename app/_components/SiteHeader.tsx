// Gemeinsamer Header (Landingpage + Fragebogen).
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserClient } from '@/lib/supabaseBrowser';

const HEADER_LOGO = 84;

export default function SiteHeader({
  ctaHref = '/challenge/registrierung',
  ctaLabel = 'Jetzt anmelden',
  loggedIn: loggedInProp,
  logoSrc = '/MoveIN-nobg.png',
  logoAlt = 'MoveIn8',
  logoHref = '/',
  logoHeight = HEADER_LOGO,
}: {
  ctaHref?: string;
  ctaLabel?: string;
  /** Optional: bekannter Login-Status (vermeidet Flackern). Ohne Angabe prüft der Header selbst. */
  loggedIn?: boolean;
  /** Nur von /turnkiste überschrieben (eigenes Logo/Link/Größe, Seite bleibt unangetastet). */
  logoSrc?: string;
  logoAlt?: string;
  logoHref?: string;
  logoHeight?: number;
}) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(loggedInProp ?? false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (loggedInProp !== undefined) return;
    getBrowserClient()
      .auth.getSession()
      .then(({ data }) => setLoggedIn(!!data.session));
  }, [loggedInProp]);

  useEffect(() => {
    if (!loggedIn) {
      setIsAdmin(false);
      return;
    }
    const supabase = getBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from('profiles')
        .select('ist_admin')
        .eq('id', data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => setIsAdmin(!!(profile as { ist_admin: boolean } | null)?.ist_admin));
    });
  }, [loggedIn]);

  async function onLogout() {
    await getBrowserClient().auth.signOut();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-outline/40 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href={logoHref} aria-label="Startseite">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={logoHeight}
            height={logoHeight}
            style={{ height: logoHeight, width: 'auto' }}
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
            <Link
              href="/challenge/wochenansicht"
              className="text-sm font-medium text-text-muted transition hover:text-text"
            >
              Wochenansicht
            </Link>
            {isAdmin && (
              <Link
                href="/challenge/admin"
                className="text-sm font-medium text-text-muted transition hover:text-text"
              >
                Admin
              </Link>
            )}
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
