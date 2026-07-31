'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import PasswordInput from '@/app/_components/PasswordInput';
import { getBrowserClient } from '@/lib/supabaseBrowser';

const inputBase =
  'w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';
const labelBase = 'mb-1.5 block text-sm font-medium text-text';

type Status = 'checking' | 'ready' | 'invalid' | 'submitting' | 'success';

export default function PasswortZuruecksetzenPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('checking');
  const [passwort, setPasswort] = useState('');
  const [passwortWiederholen, setPasswortWiederholen] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();

    // Der Recovery-Link aus der Mail setzt die Session automatisch (Supabase
    // parst den URL-Hash). Wir warten auf das PASSWORD_RECOVERY-Event, prüfen
    // aber zusätzlich sofort auf eine bestehende Session (falls der Hash schon
    // vor dem Event-Listener verarbeitet wurde).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setStatus('ready');
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus((s) => (s === 'checking' ? 'ready' : s));
      else setTimeout(() => setStatus((s) => (s === 'checking' ? 'invalid' : s)), 1500);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (passwort.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben.');
      return;
    }
    if (passwort !== passwortWiederholen) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }

    setStatus('submitting');
    const supabase = getBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: passwort });

    if (updateError) {
      setError('Passwort konnte nicht geändert werden. Bitte fordere einen neuen Link an.');
      setStatus('ready');
      return;
    }

    setStatus('success');
  }

  if (status === 'checking') {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-24 text-center">
          <p className="text-text-muted">Link wird geprüft …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-20 text-center sm:py-28">
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Link ungültig oder abgelaufen.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Fordere einfach einen neuen Link an.
          </p>
          <Link
            href="/challenge/passwort-vergessen"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Neuen Link anfordern
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-md px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Passwort geändert.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Du kannst dich jetzt mit deinem neuen Passwort einloggen.
          </p>
          <button
            type="button"
            onClick={() => router.push('/challenge/login')}
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Zum Login
          </button>
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
            Neues Passwort setzen
          </h1>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="passwort" className={labelBase}>
              Neues Passwort
            </label>
            <PasswordInput
              id="passwort"
              className={inputBase}
              value={passwort}
              onChange={setPasswort}
              placeholder="Mind. 8 Zeichen"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="passwortWiederholen" className={labelBase}>
              Passwort wiederholen
            </label>
            <PasswordInput
              id="passwortWiederholen"
              className={inputBase}
              value={passwortWiederholen}
              onChange={setPasswortWiederholen}
              placeholder="Nochmal eingeben"
              autoComplete="new-password"
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
            {status === 'submitting' ? 'Wird gespeichert …' : 'Passwort speichern'}
          </button>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
