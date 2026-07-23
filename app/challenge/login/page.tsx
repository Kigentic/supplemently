'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

const inputBase =
  'w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';
const labelBase = 'mb-1.5 block text-sm font-medium text-text';

type Status = 'idle' | 'submitting' | 'error';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [passwort, setPasswort] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Bitte eine gültige E-Mail-Adresse angeben.');
      return;
    }
    if (!passwort) {
      setError('Bitte Passwort eingeben.');
      return;
    }

    setStatus('submitting');
    const supabase = getBrowserClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: passwort,
    });

    if (signInError) {
      const msg = signInError.message.toLowerCase();
      if (msg.includes('email not confirmed')) {
        setError('Deine E-Mail-Adresse ist noch nicht bestätigt. Schau in dein Postfach (auch Promotions/Werbung-Tab).');
      } else if (msg.includes('invalid login credentials')) {
        setError('E-Mail oder Passwort ist falsch.');
      } else {
        setError('Login fehlgeschlagen. Bitte erneut versuchen.');
      }
      setStatus('error');
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setError('Login fehlgeschlagen. Bitte erneut versuchen.');
      setStatus('error');
      return;
    }

    // Onboarding schon erledigt? -> Dashboard. Sonst -> Fragebogen.
    const { data: teilnahme } = (await supabase
      .from('challenge_teilnahmen')
      .select('status')
      .eq('user_id', userId)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: { status: string } | null };

    if (teilnahme?.status === 'aktiv' || teilnahme?.status === 'abgeschlossen') {
      router.push('/challenge/dashboard');
    } else {
      router.push('/fragebogen');
    }
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
            Willkommen zurück.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Logg dich ein und mach weiter, wo du aufgehört hast.
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
          <div>
            <label htmlFor="passwort" className={labelBase}>
              Passwort
            </label>
            <input
              id="passwort"
              type="password"
              className={inputBase}
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              placeholder="Dein Passwort"
              autoComplete="current-password"
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
            {status === 'submitting' ? 'Wird geprüft …' : 'Einloggen'}
          </button>

          <p className="text-center text-sm text-text-muted">
            Noch keinen Account?{' '}
            <Link href="/challenge/registrierung" className="font-medium text-accent hover:underline">
              Jetzt anmelden
            </Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
