'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

// ── Styles ────────────────────────────────────────────────────────────────────

const inputBase =
  'w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';
const labelBase = 'mb-1.5 block text-sm font-medium text-text';

// ── Challenge-Typ-Auswahl ─────────────────────────────────────────────────────

interface ChallengeTyp {
  id: string;
  name: string;
  beschreibung: string | null;
}

function useChallengeTypen(): ChallengeTyp[] {
  const [typen, setTypen] = useState<ChallengeTyp[]>([]);
  useEffect(() => {
    getBrowserClient()
      .from('challenge_typen')
      .select('id, name, beschreibung')
      .eq('ist_aktiv', true)
      .order('name', { ascending: true })
      .then(({ data }) => setTypen((data ?? []) as ChallengeTyp[]));
  }, []);
  return typen;
}

// ── E-Mail-Bestätigung (identisches Muster zur B2C-Registrierung) ───────────

type ConfirmState = { checked: boolean; confirmed: boolean; vorname: string | null; error: string | null };

function useEmailConfirmation(): ConfirmState {
  const [state, setState] = useState<ConfirmState>({ checked: false, confirmed: false, vorname: null, error: null });

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      setState((s) => ({ ...s, checked: true }));
      return;
    }
    const params = new URLSearchParams(hash.slice(1));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    const errorDescription = params.get('error_description');

    window.history.replaceState(null, '', window.location.pathname);

    if (errorDescription) {
      setState({ checked: true, confirmed: false, vorname: null, error: decodeURIComponent(errorDescription.replace(/\+/g, ' ')) });
      return;
    }
    if (!accessToken || !refreshToken) {
      setState((s) => ({ ...s, checked: true }));
      return;
    }

    getBrowserClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ data, error }) => {
        if (error || !data.user) {
          setState({ checked: true, confirmed: false, vorname: null, error: 'Bestätigung fehlgeschlagen. Bitte erneut versuchen.' });
          return;
        }
        const vorname = (data.user.user_metadata?.vorname as string | undefined) ?? null;
        setState({ checked: true, confirmed: true, vorname, error: null });
      });
  }, []);

  return state;
}

function ConfirmedScreen({ vorname }: { vorname: string | null }) {
  return (
    <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
        ✓
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
        E-Mail bestätigt{vorname ? `, ${vorname}` : ''}!
      </h1>
      <p className="mt-4 text-base leading-relaxed text-text-muted">
        Dein Studio ist startklar. Ab jetzt kannst du dich einloggen und deine Teilnehmer verwalten.
      </p>
      <Link
        href="/challenge/admin"
        className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
      >
        Zu deinem Studio-Bereich
      </Link>
    </main>
  );
}

// ── Formular ──────────────────────────────────────────────────────────────────

interface FormState {
  studioName: string;
  ansprechpartnerVorname: string;
  ansprechpartnerNachname: string;
  email: string;
  telefon: string;
  passwort: string;
  passwort_wdh: string;
  challengeTypId: string;
  dsgvo: boolean;
}

type Status = 'idle' | 'submitting' | 'error';

export default function StudioRegistrierungPage() {
  const router = useRouter();
  const confirmState = useEmailConfirmation();
  const challengeTypen = useChallengeTypen();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    studioName: '',
    ansprechpartnerVorname: '',
    ansprechpartnerNachname: '',
    email: '',
    telefon: '',
    passwort: '',
    passwort_wdh: '',
    challengeTypId: '',
    dsgvo: false,
  });

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate(): string | null {
    if (!form.studioName.trim()) return 'Studioname ist Pflicht.';
    if (!form.ansprechpartnerVorname.trim() || !form.ansprechpartnerNachname.trim()) return 'Vor- und Nachname des Ansprechpartners sind Pflicht.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Gültige E-Mail-Adresse angeben.';
    if (form.passwort.length < 8) return 'Passwort muss mindestens 8 Zeichen haben.';
    if (form.passwort !== form.passwort_wdh) return 'Passwörter stimmen nicht überein.';
    if (!form.challengeTypId) return 'Bitte einen Challenge-Typ auswählen.';
    if (!form.dsgvo) return 'Bitte die Datenschutzbestimmungen akzeptieren.';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validErr = validate();
    if (validErr) {
      setError(validErr);
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/studio/registrierung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioName: form.studioName.trim(),
          ansprechpartnerVorname: form.ansprechpartnerVorname.trim(),
          ansprechpartnerNachname: form.ansprechpartnerNachname.trim(),
          email: form.email.trim(),
          telefon: form.telefon.trim() || undefined,
          passwort: form.passwort,
          challengeTypId: form.challengeTypId,
          dsgvo: form.dsgvo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Fehler bei der Registrierung. Bitte erneut versuchen.');
        setStatus('idle');
        return;
      }
      router.push('/studio/bestaetigung');
    } catch {
      setError('Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.');
      setStatus('idle');
    }
  }

  if (confirmState.confirmed) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <ConfirmedScreen vorname={confirmState.vorname} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Für Fitnessstudios</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Studio registrieren.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Komplettes Challenge-System für deine Mitglieder — Aufgaben, Check-ins, Auswertung,
            alles automatisiert. Wähl deinen Challenge-Typ und leg los.
          </p>
          {confirmState.error && (
            <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {confirmState.error} Falls dein Bestätigungslink abgelaufen ist, registriere dich einfach erneut mit derselben E-Mail-Adresse.
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-8">
          {/* Studio */}
          <section>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
              Dein Studio
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="studioName" className={labelBase}>
                  Studioname <span className="text-accent">*</span>
                </label>
                <input
                  id="studioName"
                  className={inputBase}
                  value={form.studioName}
                  onChange={(e) => set('studioName', e.target.value)}
                  placeholder="z.B. FitClub Müller"
                  autoComplete="organization"
                />
              </div>

              <div>
                <label htmlFor="challengeTyp" className={labelBase}>
                  Challenge-Typ <span className="text-accent">*</span>
                </label>
                <select
                  id="challengeTyp"
                  className={inputBase}
                  value={form.challengeTypId}
                  onChange={(e) => set('challengeTypId', e.target.value)}
                >
                  <option value="" disabled>
                    Bitte wählen …
                  </option>
                  {challengeTypen.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                {form.challengeTypId && (
                  <p className="mt-1.5 text-xs text-text-muted">
                    {challengeTypen.find((t) => t.id === form.challengeTypId)?.beschreibung}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Ansprechpartner */}
          <section>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
              Ansprechpartner
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ansprechpartnerVorname" className={labelBase}>
                  Vorname <span className="text-accent">*</span>
                </label>
                <input
                  id="ansprechpartnerVorname"
                  className={inputBase}
                  value={form.ansprechpartnerVorname}
                  onChange={(e) => set('ansprechpartnerVorname', e.target.value)}
                  placeholder="Max"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="ansprechpartnerNachname" className={labelBase}>
                  Nachname <span className="text-accent">*</span>
                </label>
                <input
                  id="ansprechpartnerNachname"
                  className={inputBase}
                  value={form.ansprechpartnerNachname}
                  onChange={(e) => set('ansprechpartnerNachname', e.target.value)}
                  placeholder="Müller"
                  autoComplete="family-name"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className={labelBase}>
                  E-Mail <span className="text-accent">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputBase}
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="max@fitclub-mueller.de"
                  autoComplete="email"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="telefon" className={labelBase}>
                  Telefon <span className="text-text-muted">(optional)</span>
                </label>
                <input
                  id="telefon"
                  type="tel"
                  className={inputBase}
                  value={form.telefon}
                  onChange={(e) => set('telefon', e.target.value)}
                  placeholder="+49 170 000 0000"
                  autoComplete="tel"
                />
              </div>
              <div>
                <label htmlFor="passwort" className={labelBase}>
                  Passwort <span className="text-accent">*</span>
                </label>
                <input
                  id="passwort"
                  type="password"
                  className={inputBase}
                  value={form.passwort}
                  onChange={(e) => set('passwort', e.target.value)}
                  placeholder="Mindestens 8 Zeichen"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="passwort_wdh" className={labelBase}>
                  Passwort wiederholen <span className="text-accent">*</span>
                </label>
                <input
                  id="passwort_wdh"
                  type="password"
                  className={inputBase}
                  value={form.passwort_wdh}
                  onChange={(e) => set('passwort_wdh', e.target.value)}
                  placeholder="Nochmal eingeben"
                  autoComplete="new-password"
                />
                {form.passwort_wdh && form.passwort !== form.passwort_wdh && (
                  <p className="mt-1 text-xs text-red-500">Passwörter stimmen nicht überein.</p>
                )}
              </div>
            </div>
          </section>

          {/* DSGVO */}
          <section>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
              Einwilligung
            </h2>
            <label className="flex cursor-pointer items-start gap-3">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={form.dsgvo}
                  onChange={(e) => set('dsgvo', e.target.checked)}
                  required
                />
                <div className="flex h-5 w-5 items-center justify-center rounded border border-outline bg-bg transition peer-checked:border-accent peer-checked:bg-accent">
                  {form.dsgvo && (
                    <svg className="h-3 w-3 text-on-accent" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
              <p className="text-sm text-text-muted">
                Ich habe die{' '}
                <Link href="/datenschutz" className="underline hover:text-text">
                  Datenschutzerklärung
                </Link>{' '}
                gelesen und akzeptiere sie. <span className="text-accent">*</span>
              </p>
            </label>
          </section>

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
            {status === 'submitting' ? 'Wird angelegt …' : 'Studio registrieren'}
          </button>

          <p className="text-center text-sm text-text-muted">
            Bereits registriert?{' '}
            <Link href="/challenge/login" className="font-medium text-accent hover:underline">
              Einloggen
            </Link>
          </p>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
