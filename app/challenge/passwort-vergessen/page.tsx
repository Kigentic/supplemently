'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

const inputBase =
  'w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';
const labelBase = 'mb-1.5 block text-sm font-medium text-text';

type Status = 'idle' | 'submitting' | 'sent';

export default function PasswortVergessenPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Bitte eine gültige E-Mail-Adresse angeben.');
      return;
    }

    setStatus('submitting');
    try {
      await fetch('/api/challenge/passwort-vergessen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
    } catch {
      // Bewusst kein Fehler-Feedback zum User — siehe API-Route (keine Info,
      // ob Mailversand geklappt hat, verhindert Rückschlüsse auf Systemzustand).
    }
    setStatus('sent');
  }

  if (status === 'sent') {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Check dein Postfach.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Falls ein Account zu dieser E-Mail-Adresse existiert, haben wir dir einen Link zum
            Zurücksetzen deines Passworts geschickt. Der Link ist 1 Stunde gültig.
          </p>
          <Link href="/challenge/login" className="mt-8 inline-block text-accent hover:underline">
            Zurück zum Login
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-md px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Longevity Challenge
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Passwort vergessen?
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Gib deine E-Mail-Adresse ein — wir schicken dir einen Link zum Zurücksetzen.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className={labelBase}>
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              className={inputBase}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@beispiel.de"
              autoComplete="email"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-full bg-accent px-7 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? 'Wird gesendet …' : 'Link zum Zurücksetzen schicken'}
          </button>

          <p className="text-center text-sm text-text-muted">
            <Link href="/challenge/login" className="font-medium text-accent hover:underline">
              Zurück zum Login
            </Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
