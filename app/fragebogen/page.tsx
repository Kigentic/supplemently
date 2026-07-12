'use client';

// Supplemently — Fragebogen (Stage 3, nur Funktion, kein Styling).
// Ein Formular auf einer Seite (technisch einfachste Variante).

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function FragebogenPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setField(id: string, value: any) {
    setForm((f) => ({ ...f, [id]: value }));
  }

  function toggleRestriktion(value: string, checked: boolean) {
    setForm((f) => {
      let list: string[] = Array.isArray(f.restriktionen) ? [...f.restriktionen] : [];
      if (value === 'keine') {
        // "keine" schließt andere aus
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
    <main>
      <h1>Fragebogen</h1>
      <form onSubmit={onSubmit}>
        {FRAGEN.map((frage) => (
          <fieldset key={frage.id} style={{ marginBottom: '1rem' }}>
            <legend>{frage.frage}</legend>

            {frage.typ === 'number' && (
              <input
                type="number"
                min={14}
                max={120}
                required
                value={form[frage.id]}
                onChange={(e) => setField(frage.id, e.target.value)}
              />
            )}

            {frage.typ === 'single' &&
              frage.optionen.map((opt) => (
                <label key={opt.value} style={{ display: 'block' }}>
                  <input
                    type="radio"
                    name={frage.id}
                    value={opt.value}
                    checked={form[frage.id] === opt.value}
                    onChange={(e) => setField(frage.id, e.target.value)}
                  />{' '}
                  {opt.label}
                </label>
              ))}

            {frage.typ === 'multi' &&
              frage.optionen.map((opt) => (
                <label key={opt.value} style={{ display: 'block' }}>
                  <input
                    type="checkbox"
                    name={frage.id}
                    value={opt.value}
                    checked={
                      Array.isArray(form[frage.id]) && form[frage.id].includes(opt.value)
                    }
                    onChange={(e) => toggleRestriktion(opt.value, e.target.checked)}
                  />{' '}
                  {opt.label}
                </label>
              ))}

            {frage.typ === 'multi_freetext' && (
              <input
                type="text"
                placeholder="z. B. Vitamin D3, Kreatin (Komma-getrennt)"
                value={form[frage.id]}
                onChange={(e) => setField(frage.id, e.target.value)}
                style={{ width: '20rem' }}
              />
            )}
          </fieldset>
        ))}

        {error && <p style={{ color: 'red' }} role="alert">{error}</p>}

        <button type="submit" disabled={submitting}>
          {submitting ? 'Wird berechnet …' : 'Empfehlung berechnen'}
        </button>
      </form>
    </main>
  );
}
