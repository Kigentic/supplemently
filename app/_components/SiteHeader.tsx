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
  showNavLinks = true,
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
  /** Startseite/Teilnehmer-Registrierung-Links — auf /turnkiste deaktiviert (Seite bleibt unangetastet). */
  showNavLinks?: boolean;
}) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(loggedInProp ?? false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStudioAdmin, setIsStudioAdmin] = useState(false);

  useEffect(() => {
    if (loggedInProp !== undefined) return;
    getBrowserClient()
      .auth.getSession()
      .then(({ data }) => setLoggedIn(!!data.session));
  }, [loggedInProp]);

  useEffect(() => {
    if (!loggedIn) {
      setIsAdmin(false);
      setIsStudioAdmin(false);
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
      supabase
        .from('studio_admins')
        .select('studio_id')
        .eq('user_id', data.user.id)
        .limit(1)
        .maybeSingle()
        .then(({ data: row }) => setIsStudioAdmin(!!row));
    });
  }, [loggedIn]);

  async function onLogout() {
    await getBrowserClient().auth.signOut();
    router.push('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-outline/40 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-5 sm:py-3">
        <Link href={logoHref} aria-label="Startseite" className="shrink-0">
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={logoHeight * 2}
            height={logoHeight}
            style={{ height: `clamp(32px, 8vw, ${logoHeight}px)`, width: 'auto' }}
            priority
          />
        </Link>
        {loggedIn ? (
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-5">
            {showNavLinks && (
              <>
                <Link href="/" className="text-xs font-medium text-text-muted transition hover:text-text sm:text-sm">
                  Startseite
                </Link>
                <Link
                  href="/challenge/registrierung"
                  className="text-xs font-medium text-text-muted transition hover:text-text sm:text-sm"
                >
                  Teilnehmer-Registrierung
                </Link>
              </>
            )}
            {isStudioAdmin && (
              <Link
                href="/challenge/dashboard"
                className="text-xs font-medium text-text-muted transition hover:text-text sm:text-sm"
              >
                Dashboard
              </Link>
            )}
            <Link
              href="/challenge/wochenansicht"
              className="text-xs font-medium text-text-muted transition hover:text-text sm:text-sm"
            >
              Wochenansicht
            </Link>
            {isAdmin && (
              <Link
                href="/challenge/admin"
                className="text-xs font-medium text-text-muted transition hover:text-text sm:text-sm"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-outline px-3 py-1.5 text-xs font-medium text-text transition hover:border-text sm:px-4 sm:py-2 sm:text-sm"
            >
              Ausloggen
            </button>
          </nav>
        ) : (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-5">
            {showNavLinks && (
              <>
                <Link href="/" className="text-xs font-medium text-text-muted transition hover:text-text sm:text-sm">
                  Startseite
                </Link>
                <Link
                  href="/challenge/registrierung"
                  className="text-xs font-medium text-text-muted transition hover:text-text sm:text-sm"
                >
                  Teilnehmer-Registrierung
                </Link>
              </>
            )}
            <Link
              href={ctaHref}
              className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
