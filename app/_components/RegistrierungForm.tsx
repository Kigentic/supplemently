'use client';

// Supplemently — Lead-Formular "Jetzt Partnerstudio werden".
import { useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputBase =
  'w-full rounded-lg border border-white/10 bg-bg/40 px-4 py-3 text-text placeholder:text-text-muted/70 ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40';

const labelBase = 'mb-1.5 block text-sm font-medium text-text';

export default function RegistrierungForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    studioname: '',
    ansprechpartner: '',
    email: '',
    telefon: '',
    nachricht: '',
  });

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.studioname.trim() || !form.ansprechpartner.trim() || !form.email.trim()) {
      setError('Bitte Studioname, Ansprechpartner und E-Mail ausfüllen.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Bitte eine gültige E-Mail-Adresse angeben.');
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/interessent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Etwas ist schiefgelaufen. Bitte später erneut versuchen.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setError('Netzwerkfehler. Bitte später erneut versuchen.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl bg-surface p-8 text-center shadow-xl ring-1 ring-white/5">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl text-on-accent">
          ✓
        </div>
        <h3 className="font-[family-name:var(--font-heading)] text-2xl text-text">Danke!</h3>
        <p className="mt-2 text-text-muted">
          Wir melden uns innerhalb von 24 Stunden bei dir. Bis dahin: gute Trainingseinheit.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl bg-surface p-6 shadow-xl ring-1 ring-white/5 sm:p-8"
      noValidate
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="studioname" className={labelBase}>
            Studioname <span className="text-accent">*</span>
          </label>
          <input
            id="studioname"
            className={inputBase}
            value={form.studioname}
            onChange={(e) => set('studioname', e.target.value)}
            placeholder="z. B. PowerGym Berlin"
            required
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="ansprechpartner" className={labelBase}>
            Ansprechpartner <span className="text-accent">*</span>
          </label>
          <input
            id="ansprechpartner"
            className={inputBase}
            value={form.ansprechpartner}
            onChange={(e) => set('ansprechpartner', e.target.value)}
            placeholder="Vor- und Nachname"
            required
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="email" className={labelBase}>
            E-Mail <span className="text-accent">*</span>
          </label>
          <input
            id="email"
            type="email"
            className={inputBase}
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="name@studio.de"
            required
          />
        </div>
        <div className="sm:col-span-1">
          <label htmlFor="telefon" className={labelBase}>
            Telefon <span className="text-text-muted">(optional)</span>
          </label>
          <input
            id="telefon"
            type="tel"
            className={inputBase}
            value={form.telefon}
            onChange={(e) => set('telefon', e.target.value)}
            placeholder="+49 …"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="nachricht" className={labelBase}>
            Nachricht <span className="text-text-muted">(optional)</span>
          </label>
          <textarea
            id="nachricht"
            rows={4}
            className={inputBase}
            value={form.nachricht}
            onChange={(e) => set('nachricht', e.target.value)}
            placeholder="Erzähl uns kurz von deinem Studio."
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="mt-6 w-full rounded-xl bg-accent px-6 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === 'submitting' ? 'Wird gesendet …' : 'Jetzt Partnerstudio werden'}
      </button>
      <p className="mt-3 text-xs text-text-muted">
        Kein Account nötig. Wir nutzen deine Daten ausschließlich zur Kontaktaufnahme.
      </p>
    </form>
  );
}
