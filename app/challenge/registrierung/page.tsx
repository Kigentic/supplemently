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

// ── Formular ──────────────────────────────────────────────────────────────────

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

type Status = 'idle' | 'submitting' | 'success' | 'error';

function PasswordStrength({ pw }: { pw: string }) {
  if (!pw) return null;
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)].filter(Boolean).length;
  const labels = ['Schwach', 'Mäßig', 'Gut', 'Stark'];
  const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'];
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 w-8 rounded-full ${i <= score ? colors[score - 1] : 'bg-outline'}`} />
        ))}
      </div>
      <span className="text-xs text-text-muted">{labels[score - 1] ?? ''}</span>
    </div>
  );
}

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

    // Hash aus der URL entfernen — Tokens sollen nicht in der Adressleiste stehenbleiben.
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
        Dein Account ist aktiv. Als Nächstes füllst du den Fragebogen aus — danach bekommst du
        sofort deinen personalisierten Supplement-Stack.
      </p>
      <Link href="/fragebogen" className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover">
        Jetzt Fragebogen ausfüllen
      </Link>
    </main>
  );
}

export default function RegistrierungPage() {
  const router = useRouter();
  const confirmState = useEmailConfirmation();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
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
    if (validErr) { setError(validErr); return; }

    setStatus('submitting');
    try {
      const res = await fetch('/api/challenge/registrierung', {
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
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Fehler bei der Registrierung. Bitte erneut versuchen.');
        setStatus('error');
        return;
      }
      router.push('/challenge/bestaetigung');
    } catch {
      setError('Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.');
      setStatus('error');
    }
  }

  if (confirmState.confirmed) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <ConfirmedScreen vorname={confirmState.vorname} />
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-xl px-5 py-16 sm:py-20">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Longevity Challenge
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Jetzt anmelden.
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            8 Wochen. Messbare Veränderung. Personalisierte Empfehlungen. Fang heute an.
          </p>
          {confirmState.error && (
            <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {confirmState.error} Falls dein Bestätigungslink abgelaufen ist, registriere dich einfach erneut mit derselben E-Mail-Adresse.
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-8">

          {/* Persönliche Daten */}
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
                <PasswordStrength pw={form.passwort} />
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
                <p className="mt-1 text-xs text-text-muted">Für zukünftige WhatsApp-Erinnerungen (optional).</p>
              </div>
            </div>
          </section>

          {/* Buddy-System */}
          <section>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
              Freunde einladen
            </h2>
            <div className="rounded-xl border border-outline bg-surface p-5">
              <p className="font-medium text-text">Hier kannst du Freunde zur Challenge einladen</p>
              <p className="mt-1.5 text-sm text-text-muted">
                Motiviert euch gegenseitig — ladet euch gemeinsam ein und bekommt Bonuspunkte,
                wenn ihr beide eure Wochen-Check-ins einreicht.
              </p>
              <a
                href="https://wa.me/?text=Hey%21%20M%C3%B6chtest%20Du%20mit%20mir%20zusammen%20die%20Longevity%20Challenge%20machen%3F%20Schau%20mal%20hier%3A%20https%3A%2F%2Fsupplemently.vercel.app%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2.5 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebe57]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.014 2C6.484 2 2 6.463 2 11.966c0 1.99.583 3.845 1.588 5.408L2 22l4.75-1.554a10.02 10.02 0 0 0 5.264 1.485c5.53 0 10.014-4.463 10.014-9.965C22.028 6.463 17.544 2 12.014 2zm0 18.13a8.15 8.15 0 0 1-4.16-1.135l-.298-.177-3.098 1.014.99-3.058-.194-.313a8.086 8.086 0 0 1-1.246-4.327c0-4.482 3.65-8.126 8.146-8.126 4.495 0 8.146 3.644 8.146 8.126 0 4.482-3.651 8.126-8.286 8.126z" />
                </svg>
                Buddies direkt per WhatsApp einladen
              </a>
            </div>
          </section>

          {/* DSGVO */}
          <section>
            <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
              Einwilligungen
            </h2>
            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.dsgvo_marketing}
                    onChange={(e) => set('dsgvo_marketing', e.target.checked)}
                    required
                  />
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-outline bg-bg transition peer-checked:border-accent peer-checked:bg-accent">
                    {form.dsgvo_marketing && (
                      <svg className="h-3 w-3 text-on-accent" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text-muted">
                  Ich bin einverstanden, wöchentliche Challenge-E-Mails (Aufgaben, Check-in-Erinnerungen, Auswertungen) zu erhalten. <span className="text-accent">*</span>
                </p>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={form.dsgvo_affiliate}
                    onChange={(e) => set('dsgvo_affiliate', e.target.checked)}
                    required
                  />
                  <div className="flex h-5 w-5 items-center justify-center rounded border border-outline bg-bg transition peer-checked:border-accent peer-checked:bg-accent">
                    {form.dsgvo_affiliate && (
                      <svg className="h-3 w-3 text-on-accent" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <p className="text-sm text-text-muted">
                  Ich bin einverstanden, personalisierte Produkt- und Supplement-Empfehlungen (inkl. Affiliate-Links) basierend auf meinen Fragebogen-Antworten zu erhalten. <span className="text-accent">*</span>
                </p>
              </label>
              <p className="text-xs text-text-muted">
                Mit der Anmeldung akzeptierst du unsere{' '}
                <Link href="/datenschutz" className="underline hover:text-text">Datenschutzerklärung</Link>.
                Einwilligungen können jederzeit per E-Mail widerrufen werden.
              </p>
            </div>
          </section>

          {/* Fehler */}
          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full rounded-full bg-accent px-7 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? 'Anmeldung läuft …' : 'Jetzt zur Challenge anmelden'}
          </button>

          <p className="text-center text-sm text-text-muted">
            Bereits angemeldet?{' '}
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
