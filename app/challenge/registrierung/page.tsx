'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';

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
  buddy_gewuenscht: boolean;
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

export default function RegistrierungPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    vorname: '',
    nachname: '',
    email: '',
    passwort: '',
    passwort_wdh: '',
    handynummer: '',
    buddy_gewuenscht: false,
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
          buddy_gewuenscht: form.buddy_gewuenscht,
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
              Buddy-System
            </h2>
            <label className="flex cursor-pointer items-start gap-4 rounded-xl border border-outline bg-surface p-4 transition hover:border-accent/50">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={form.buddy_gewuenscht}
                  onChange={(e) => set('buddy_gewuenscht', e.target.checked)}
                />
                <div className="flex h-5 w-5 items-center justify-center rounded border border-outline bg-bg transition peer-checked:border-accent peer-checked:bg-accent">
                  {form.buddy_gewuenscht && (
                    <svg className="h-3 w-3 text-on-accent" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <div>
                <p className="font-medium text-text">Ich möchte einen Challenge-Buddy</p>
                <p className="mt-0.5 text-sm text-text-muted">
                  Wir matchen dich mit einem anderen Teilnehmer. Ihr motiviert euch gegenseitig — und bekommt Bonuspunkte wenn ihr beide euren Check-in einreicht.
                </p>
              </div>
            </label>
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
