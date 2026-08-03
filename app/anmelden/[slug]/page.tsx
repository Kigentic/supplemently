'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

const inputBase =
  'w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';
const labelBase = 'mb-1.5 block text-sm font-medium text-text';

interface DurchgangInfo {
  name: string;
  studioName: string | null;
  challengeTypName: string | null;
  challengeTypBeschreibung: string | null;
  startDatum: string;
  wochenAnzahl: number;
}

interface FormState {
  vorname: string;
  nachname: string;
  email: string;
  passwort: string;
  passwort_wdh: string;
  handynummer: string;
  dsgvo_marketing: boolean;
  dsgvo_affiliate: boolean;
}

type Status = 'idle' | 'submitting' | 'error';
type ConfirmState = { checked: boolean; confirmed: boolean; error: string | null };

function useEmailConfirmation(): ConfirmState {
  const [state, setState] = useState<ConfirmState>({ checked: false, confirmed: false, error: null });

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
      setState({ checked: true, confirmed: false, error: decodeURIComponent(errorDescription.replace(/\+/g, ' ')) });
      return;
    }
    if (!accessToken || !refreshToken) {
      setState((s) => ({ ...s, checked: true }));
      return;
    }

    getBrowserClient()
      .auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error }) => {
        setState({ checked: true, confirmed: !error, error: error ? 'Bestätigung fehlgeschlagen. Bitte erneut versuchen.' : null });
      });
  }, []);

  return state;
}

export default function DurchgangRegistrierungPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const confirmState = useEmailConfirmation();
  const [info, setInfo] = useState<DurchgangInfo | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);
  const [form, setForm] = useState<FormState>({
    vorname: '',
    nachname: '',
    email: '',
    passwort: '',
    passwort_wdh: '',
    handynummer: '',
    dsgvo_marketing: false,
    dsgvo_affiliate: false,
  });

  useEffect(() => {
    if (!params?.slug) return;
    fetch(`/api/durchgang/${params.slug}/info`)
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setInfoError(json?.error ?? 'Durchgang nicht gefunden.');
          return;
        }
        setInfo(json);
      })
      .catch(() => setInfoError('Server nicht erreichbar.'));
  }, [params?.slug]);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function validate(): string | null {
    if (!form.vorname.trim() || !form.nachname.trim()) return 'Vor- und Nachname sind Pflicht.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Gültige E-Mail-Adresse angeben.';
    if (form.passwort.length < 8) return 'Passwort muss mindestens 8 Zeichen haben.';
    if (form.passwort !== form.passwort_wdh) return 'Passwörter stimmen nicht überein.';
    if (!form.dsgvo_marketing) return 'Einwilligung für E-Mail-Kommunikation ist erforderlich.';
    if (!form.dsgvo_affiliate) return 'Einwilligung für personalisierte Empfehlungen ist erforderlich.';
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
      const res = await fetch(`/api/durchgang/${params?.slug}/registrierung`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: form.vorname.trim(),
          nachname: form.nachname.trim(),
          email: form.email.trim(),
          passwort: form.passwort,
          handynummer: form.handynummer.trim() || undefined,
          dsgvo_marketing: form.dsgvo_marketing,
          dsgvo_affiliate: form.dsgvo_affiliate,
          ref: ref || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Fehler bei der Registrierung. Bitte erneut versuchen.');
        setStatus('idle');
        return;
      }
      setStatus('idle');
      setForm((f) => ({ ...f, passwort: '', passwort_wdh: '' }));
      // Kein Redirect nötig — die Seite zeigt unten die "Mail verschickt"-Bestätigung.
      setRegistered(true);
    } catch {
      setError('Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.');
      setStatus('idle');
    }
  }

  if (confirmState.confirmed) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">E-Mail bestätigt!</h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Dein Studio schaltet dich nach Zahlungseingang frei. Sobald das erledigt ist, kannst du
            dich einloggen und loslegen.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Anmeldung eingegangen.</h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Wir haben dir eine Bestätigungsmail geschickt. Klick auf den Link darin, danach schaltet
            dich dein Studio nach Zahlungseingang frei.
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (infoError) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Nicht gefunden.</h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">{infoError}</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {info?.studioName ?? 'Wird geladen …'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {info?.name ?? 'Anmeldung'}
          </h1>
          {info && (
            <p className="mt-3 text-base leading-relaxed text-text-muted">
              {info.wochenAnzahl} Wochen · Start {new Date(info.startDatum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              {info.challengeTypBeschreibung ? ` — ${info.challengeTypBeschreibung}` : ''}
            </p>
          )}
          {confirmState.error && (
            <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {confirmState.error}
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-8">
          <section>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
              Deine Daten
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vorname" className={labelBase}>
                  Vorname <span className="text-accent">*</span>
                </label>
                <input
                  id="vorname"
                  className={inputBase}
                  value={form.vorname}
                  onChange={(e) => set('vorname', e.target.value)}
                  placeholder="Max"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="nachname" className={labelBase}>
                  Nachname <span className="text-accent">*</span>
                </label>
                <input
                  id="nachname"
                  className={inputBase}
                  value={form.nachname}
                  onChange={(e) => set('nachname', e.target.value)}
                  placeholder="Mustermann"
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
                  placeholder="max@beispiel.de"
                  autoComplete="email"
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
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="handynummer" className={labelBase}>
                  Handynummer <span className="text-text-muted">(optional)</span>
                </label>
                <input
                  id="handynummer"
                  type="tel"
                  className={inputBase}
                  value={form.handynummer}
                  onChange={(e) => set('handynummer', e.target.value)}
                  placeholder="+49 170 000 0000"
                  autoComplete="tel"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
              Einwilligungen
            </h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.dsgvo_marketing}
                  onChange={(e) => set('dsgvo_marketing', e.target.checked)}
                />
                <p className="text-sm text-text-muted">
                  Ich bin einverstanden, Challenge-E-Mails (Aufgaben, Check-in-Erinnerungen,
                  Auswertungen) zu erhalten. <span className="text-accent">*</span>
                </p>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={form.dsgvo_affiliate}
                  onChange={(e) => set('dsgvo_affiliate', e.target.checked)}
                />
                <p className="text-sm text-text-muted">
                  Ich bin einverstanden, personalisierte Produktempfehlungen zu erhalten.{' '}
                  <span className="text-accent">*</span>
                </p>
              </label>
            </div>
          </section>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting' || !info}
            className="w-full rounded-full bg-accent px-7 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? 'Wird angemeldet …' : 'Jetzt anmelden'}
          </button>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
