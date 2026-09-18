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
  extraNavLinks,
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
  /** Zusätzliche Nav-Links (ausgeloggt), z.B. Studio-/Teilnehmer-Login auf der Startseite. */
  extraNavLinks?: { href: string; label: string }[];
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

  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setMobileOpen(false);
  }, [loggedIn]);

  // Turnkiste bleibt unangetastet: ausgeloggt + showNavLinks=false gibt's
  // außer der CTA nichts zum Aufklappen — dann auch kein Hamburger-Icon.
  const hasMobileMenu = loggedIn || showNavLinks || !!extraNavLinks?.length;

  const linkCls = 'text-xs font-medium text-text-muted transition hover:text-text sm:text-sm';
  const mobileLinkCls = 'rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition hover:bg-outline/10 hover:text-text';

  return (
    <header className="sticky top-0 z-30 border-b border-outline/40 bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-x-4 px-4 py-2.5 sm:px-5 sm:py-3">
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

        {/* Desktop-Nav */}
        {loggedIn ? (
          <nav className="hidden items-center gap-5 sm:flex">
            {showNavLinks && (
              <>
                <Link href="/" className={linkCls}>Startseite</Link>
                <Link href="/challenge/registrierung" className={linkCls}>Teilnehmer-Registrierung</Link>
              </>
            )}
            {isStudioAdmin && <Link href="/challenge/dashboard" className={linkCls}>Dashboard</Link>}
            <Link href="/challenge/wochenansicht" className={linkCls}>Wochenansicht</Link>
            {isAdmin && <Link href="/challenge/admin" className={linkCls}>Admin</Link>}
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-outline px-4 py-2 text-sm font-medium text-text transition hover:border-text"
            >
              Ausloggen
            </button>
          </nav>
        ) : (
          <div className="hidden items-center gap-5 sm:flex">
            {showNavLinks && (
              <>
                <Link href="/" className={linkCls}>Startseite</Link>
                <Link href="/challenge/registrierung" className={linkCls}>Teilnehmer-Registrierung</Link>
              </>
            )}
            {extraNavLinks?.map((l) => (
              <Link key={l.href + l.label} href={l.href} className={linkCls}>{l.label}</Link>
            ))}
            <Link
              href={ctaHref}
              className="shrink-0 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        )}

        {/* Mobile: CTA (ausgeloggt) + Hamburger */}
        <div className="flex items-center gap-2 sm:hidden">
          {!loggedIn && (
            <Link
              href={ctaHref}
              className="shrink-0 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              {ctaLabel}
            </Link>
          )}
          {hasMobileMenu && (
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Menü schließen' : 'Menü öffnen'}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-outline text-text"
            >
              {mobileOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile-Dropdown */}
      {hasMobileMenu && mobileOpen && (
        <div className="border-t border-outline/40 bg-bg px-4 py-3 sm:hidden">
          <nav className="flex flex-col gap-1">
            {showNavLinks && (
              <>
                <Link href="/" className={mobileLinkCls} onClick={() => setMobileOpen(false)}>Startseite</Link>
                <Link href="/challenge/registrierung" className={mobileLinkCls} onClick={() => setMobileOpen(false)}>
                  Teilnehmer-Registrierung
                </Link>
              </>
            )}
            {extraNavLinks?.map((l) => (
              <Link key={l.href + l.label} href={l.href} className={mobileLinkCls} onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
            {loggedIn && isStudioAdmin && (
              <Link href="/challenge/dashboard" className={mobileLinkCls} onClick={() => setMobileOpen(false)}>Dashboard</Link>
            )}
            {loggedIn && (
              <Link href="/challenge/wochenansicht" className={mobileLinkCls} onClick={() => setMobileOpen(false)}>Wochenansicht</Link>
            )}
            {loggedIn && isAdmin && (
              <Link href="/challenge/admin" className={mobileLinkCls} onClick={() => setMobileOpen(false)}>Admin</Link>
            )}
            {loggedIn && (
              <button type="button" onClick={onLogout} className={`${mobileLinkCls} text-left`}>
                Ausloggen
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
