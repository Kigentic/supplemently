'use client';

// Supplemently — Fragebogen im Design-System der Landingpage.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '../_components/SiteHeader';
import SiteFooter from '../_components/SiteFooter';
import { FRAGEN, type Answers } from '@/lib/questions';

type FormState = Record<string, any>;

const initial: FormState = {
  geschlecht: '',
  alter: '',
  trainingslevel: '',
  trainingsziel: '',
  ernaehrungsstil: '',
  restriktionen: [] as string[],
  schlafqualitaet: '',
  stresslevel: '',
  aktuelle_supplements: '',
};

const inputBase =
  'w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';

function OptionPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={
        'rounded-full border px-4 py-2.5 text-sm font-medium transition ' +
        (selected
          ? 'border-accent bg-accent text-on-accent'
          : 'border-outline bg-bg text-text hover:border-text')
      }
    >
      {label}
    </button>
  );
}

function QuestionBlock({
  nr,
  frage,
  children,
}: {
  nr: number;
  frage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-outline/50 py-7 first:pt-0 last:border-b-0 last:pb-0">
      <p className="mb-3 text-sm font-semibold text-text">
        <span className="mr-2 text-accent">{String(nr).padStart(2, '0')}</span>
        {frage}
      </p>
      {children}
    </div>
  );
}

export default function FragebogenPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField(id: string, value: any) {
    setForm((f) => ({ ...f, [id]: value }));
  }

  function toggleRestriktion(value: string) {
    setForm((f) => {
      let list: string[] = Array.isArray(f.restriktionen) ? [...f.restriktionen] : [];
      const checked = !list.includes(value);
      if (value === 'keine') {
        return { ...f, restriktionen: checked ? ['keine'] : [] };
      }
      list = list.filter((r) => r !== 'keine');
      if (checked) list.push(value);
      else list = list.filter((r) => r !== value);
      return { ...f, restriktionen: list };
    });
  }

  function validate(): string | null {
    if (!form.geschlecht) return 'Bitte Geschlecht wählen.';
    const alter = Number(form.alter);
    if (!form.alter || Number.isNaN(alter)) return 'Bitte ein gültiges Alter (Zahl) angeben.';
    if (alter < 14 || alter > 120) return 'Alter muss zwischen 14 und 120 liegen.';
    if (!form.trainingslevel) return 'Bitte Trainingslevel wählen.';
    if (!form.trainingsziel) return 'Bitte Trainingsziel wählen.';
    if (!form.ernaehrungsstil) return 'Bitte Ernährungsstil wählen.';
    if (!form.schlafqualitaet) return 'Bitte Schlafqualität wählen.';
    if (!form.stresslevel) return 'Bitte Stresslevel wählen.';
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    const antworten: Answers = {
      geschlecht: form.geschlecht,
      alter: Number(form.alter),
      trainingslevel: form.trainingslevel,
      trainingsziel: form.trainingsziel,
      ernaehrungsstil: form.ernaehrungsstil,
      restriktionen: form.restriktionen.length ? form.restriktionen : ['keine'],
      schlafqualitaet: form.schlafqualitaet,
      stresslevel: form.stresslevel,
      aktuelle_supplements: String(form.aktuelle_supplements || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antworten }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Fehler beim Absenden.');
        setSubmitting(false);
        return;
      }
      if (!data.session_id) {
        setError('Ergebnis konnte nicht gespeichert werden (keine Session-ID).');
        setSubmitting(false);
        return;
      }
      router.push(`/ergebnis/${data.session_id}`);
    } catch {
      setError('Netzwerkfehler beim Absenden.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Persönlicher Check
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Dein individueller Nährstoff-Check
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-muted">
            Ein paar kurze Fragen zu Ernährung, Training und Alltag — am Ende erhältst du eine klare
            Empfehlung, was für dich wirklich sinnvoll ist.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-10 rounded-2xl bg-surface p-6 sm:p-8">
          {FRAGEN.map((frage, i) => (
            <QuestionBlock key={frage.id} nr={i + 1} frage={frage.frage}>
              {frage.typ === 'number' && (
                <input
                  type="number"
                  min={14}
                  max={120}
                  required
                  value={form[frage.id]}
                  onChange={(e) => setField(frage.id, e.target.value)}
                  placeholder="z. B. 32"
                  className={inputBase + ' max-w-[10rem]'}
                />
              )}

              {frage.typ === 'single' && (
                <div className="flex flex-wrap gap-2.5">
                  {frage.optionen.map((opt) => (
                    <OptionPill
                      key={opt.value}
                      label={opt.label}
                      selected={form[frage.id] === opt.value}
                      onClick={() => setField(frage.id, opt.value)}
                    />
                  ))}
                </div>
              )}

              {frage.typ === 'multi' && (
                <div className="flex flex-wrap gap-2.5">
                  {frage.optionen.map((opt) => (
                    <OptionPill
                      key={opt.value}
                      label={opt.label}
                      selected={
                        Array.isArray(form[frage.id]) && form[frage.id].includes(opt.value)
                      }
                      onClick={() => toggleRestriktion(opt.value)}
                    />
                  ))}
                </div>
              )}

              {frage.typ === 'multi_freetext' && (
                <input
                  type="text"
                  placeholder="z. B. Vitamin D3, Kreatin (Komma-getrennt)"
                  value={form[frage.id]}
                  onChange={(e) => setField(frage.id, e.target.value)}
                  className={inputBase}
                />
              )}
            </QuestionBlock>
          ))}

          {error && (
            <p role="alert" className="mt-6 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-8 w-full rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {submitting ? 'Wird berechnet …' : 'Empfehlung berechnen'}
          </button>
        </form>
      </main>

      <SiteFooter />
    </div>
  );
}
