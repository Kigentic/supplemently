'use client';

// Mobile-Hamburger-Menü für die Homepage — Desktop-Nav ist ab sm: sichtbar,
// darunter braucht es einen echten Toggle statt einzelner Links, die sonst
// (wie zuvor "Teilnehmer-Registrierung") auf Mobile komplett verschwinden.
import { useState } from 'react';
import Link from 'next/link';

interface NavLink {
  href: string;
  label: string;
}

export default function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-outline text-text"
      >
        {open ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b border-outline/40 bg-bg px-5 py-4 shadow-sm">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition hover:bg-outline/10 hover:text-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
