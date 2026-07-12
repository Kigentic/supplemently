'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '../_components/SiteHeader';
import SiteFooter from '../_components/SiteFooter';
import { FRAGEN_MAP, GRUPPEN, type Answers } from '@/lib/questions';

type FormState = Record<string, any>;

const initial: FormState = {
  geschlecht: '',
  alter: '',
  groesse: '',
  gewicht: '',
  koerperform: '',
  trainingslevel: '',
  trainingsziel: '',
  ernaehrungsstil: '',
  restriktionen: [] as string[],
  kochverhalten: '',
  mahlzeiten_pro_tag: '',
  auswaerts_essen: '',
  alkohol: '',
  raucher: '',
  schlafdauer: '',
  aufwachgefuehl: '',
  schlaf_durchschlafen: '',
  stresslevel: '',
  entspannung: '',
  gedanken_abschalten: '',
  verdauung_blaeungen: '',
  heisshunger: '',
  medikamente: [] as string[],
  aktuelle_supplements: '',
};

const inputBase =
  'rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
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

// ── Body-Type-Icons ──────────────────────────────────────────────────────────

function BodyMaleSchlank() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M14,17 Q20,15 26,17 L25,50 Q20,53 15,50 Z" />
      <rect x="13" y="49" width="6" height="24" rx="3" />
      <rect x="21" y="49" width="6" height="24" rx="3" />
    </svg>
  );
}
function BodyMaleNormal() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M10,17 Q20,14 30,17 L28,50 Q20,54 12,50 Z" />
      <rect x="11" y="49" width="7" height="24" rx="3" />
      <rect x="22" y="49" width="7" height="24" rx="3" />
    </svg>
  );
}
function BodyMaleUntersetzt() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M5,17 Q20,13 35,17 L33,48 Q20,53 7,48 Z" />
      <rect x="7" y="47" width="9" height="24" rx="4" />
      <rect x="24" y="47" width="9" height="24" rx="4" />
    </svg>
  );
}
function BodyMaleFett() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M11,17 Q20,14 29,17 L33,36 Q34,52 20,55 Q6,52 7,36 Z" />
      <rect x="9" y="51" width="8" height="22" rx="3" />
      <rect x="23" y="51" width="8" height="22" rx="3" />
    </svg>
  );
}

function BodyFemaleSchlank() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M15,17 Q20,15 25,17 L24,31 Q20,34 20,34 Q20,34 16,31 Z" />
      <path d="M15,34 Q20,31 25,34 L26,50 Q20,55 14,50 Z" />
      <rect x="13" y="49" width="6" height="24" rx="3" />
      <rect x="21" y="49" width="6" height="24" rx="3" />
    </svg>
  );
}
function BodyFemaleNormal() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M12,17 Q20,14 28,17 L26,31 Q20,35 20,35 Q20,35 14,31 Z" />
      <path d="M13,35 Q20,32 27,35 L29,50 Q20,56 11,50 Z" />
      <rect x="11" y="49" width="7" height="24" rx="3" />
      <rect x="22" y="49" width="7" height="24" rx="3" />
    </svg>
  );
}
function BodyFemaleUntersetzt() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <path d="M13,17 Q20,14 27,17 L25,31 Q20,34 20,34 Q20,34 15,31 Z" />
      <path d="M9,34 Q20,30 31,34 L33,50 Q20,57 7,50 Z" />
      <rect x="9" y="49" width="8" height="24" rx="4" />
      <rect x="23" y="49" width="8" height="24" rx="4" />
    </svg>
  );
}
function BodyFemaleFett() {
  return (
    <svg viewBox="0 0 40 80" fill="currentColor" className="h-14 w-auto">
      <circle cx="20" cy="9" r="7" />
      <ellipse cx="20" cy="39" rx="16" ry="19" />
      <rect x="10" y="54" width="7" height="20" rx="3" />
      <rect x="23" y="54" width="7" height="20" rx="3" />
    </svg>
  );
}

const BODY_TYPES = [
  { value: 'schlank',    label: 'Schlank' },
  { value: 'normal',     label: 'Normal' },
  { value: 'untersetzt', label: 'Untersetzt' },
  { value: 'fett',       label: 'Mollig' },
] as const;

const BODY_ICONS: Record<string, Record<string, React.ReactNode>> = {
  männlich: {
    schlank:    <BodyMaleSchlank />,
    normal:     <BodyMaleNormal />,
    untersetzt: <BodyMaleUntersetzt />,
    fett:       <BodyMaleFett />,
  },
  weiblich: {
    schlank:    <BodyFemaleSchlank />,
    normal:     <BodyFemaleNormal />,
    untersetzt: <BodyFemaleUntersetzt />,
    fett:       <BodyFemaleFett />,
  },
};

function BodyTypeSelector({
  selected,
  geschlecht,
  onChange,
}: {
  selected: string;
  geschlecht: string;
  onChange: (v: string) => void;
}) {
  const icons = BODY_ICONS[geschlecht] ?? BODY_ICONS['männlich'];
  return (
    <div className="flex gap-3">
      {BODY_TYPES.map(({ value, label }) => {
        const active = selected === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onChange(selected === value ? '' : value)}
            aria-pressed={active}
            className={
              'flex flex-1 flex-col items-center gap-2 rounded-xl border px-2 py-3 transition ' +
              (active
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-outline bg-bg text-text-muted hover:border-text hover:text-text')
            }
          >
            {icons[value]}
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function QuestionBlock({
  nr,
  frage,
  optional,
  children,
}: {
  nr: number;
  frage: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-outline/50 py-6 first:pt-0 last:border-b-0 last:pb-0">
      <p className="mb-3 text-sm font-semibold text-text">
        <span className="mr-2 text-accent">{String(nr).padStart(2, '0')}</span>
        {frage}
        {optional && (
          <span className="ml-2 text-xs font-normal text-text-muted">(optional)</span>
        )}
      </p>
      {children}
    </div>
  );
}

function validateStep(step: number, form: FormState): string | null {
  const gruppe = GRUPPEN[step];
  for (const id of gruppe.frageIds) {
    const frage = FRAGEN_MAP.get(id);
    if (!frage || frage.optional) continue;
    if (id === 'restriktionen' || id === 'medikamente') continue;

    if (frage.typ === 'number') {
      if (!form[id] && form[id] !== 0) return `Bitte "${frage.frage}" ausfüllen.`;
      const v = Number(form[id]);
      if (isNaN(v)) return `Bitte eine gültige Zahl eingeben.`;
      if (frage.min !== undefined && v < frage.min)
        return `Wert muss mindestens ${frage.min} sein.`;
      if (frage.max !== undefined && v > frage.max)
        return `Wert darf höchstens ${frage.max} sein.`;
    } else if (frage.typ === 'single') {
      if (!form[id]) return `Bitte bei "${frage.frage}" eine Antwort wählen.`;
    } else if (frage.typ === 'body_type') {
      if (!form[id]) return 'Bitte deine Körperform auswählen.';
    }
  }
  return null;
}

export default function FragebogenPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [animKey, setAnimKey] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  const totalSteps = GRUPPEN.length;
  const gruppe = GRUPPEN[step];
  const isLast = step === totalSteps - 1;
  const progress = ((step + 1) / totalSteps) * 100;

  function setField(id: string, value: any) {
    setForm((f) => ({ ...f, [id]: value }));
    setStepError(null);
  }

  function toggleMulti(field: string, value: string) {
    setForm((f) => {
      let list: string[] = Array.isArray(f[field]) ? [...f[field]] : [];
      const checked = !list.includes(value);
      if (value === 'keine') {
        return { ...f, [field]: checked ? ['keine'] : [] };
      }
      list = list.filter((r) => r !== 'keine');
      if (checked) list.push(value);
      else list = list.filter((r) => r !== value);
      return { ...f, [field]: list };
    });
    setStepError(null);
  }

  function goNext() {
    const err = validateStep(step, form);
    if (err) { setStepError(err); return; }
    setStepError(null);
    setDirection(1);
    setAnimKey((k) => k + 1);
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goBack() {
    setStepError(null);
    setDirection(-1);
    setAnimKey((k) => k + 1);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onSubmit() {
    const err = validateStep(step, form);
    if (err) { setStepError(err); return; }
    if (!disclaimerChecked) {
      setSubmitError('Bitte bestätige den Hinweis zur ärztlichen Beratung.');
      return;
    }

    const restriktionen =
      Array.isArray(form.restriktionen) && form.restriktionen.length
        ? form.restriktionen
        : ['keine'];
    const medikamente =
      Array.isArray(form.medikamente) && form.medikamente.length
        ? form.medikamente
        : ['keine'];

    const antworten: Answers = {
      geschlecht: form.geschlecht,
      alter: Number(form.alter),
      groesse: Number(form.groesse),
      gewicht: Number(form.gewicht),
      koerperform: form.koerperform,
      trainingslevel: form.trainingslevel,
      trainingsziel: form.trainingsziel,
      ernaehrungsstil: form.ernaehrungsstil,
      restriktionen,
      kochverhalten: form.kochverhalten,
      mahlzeiten_pro_tag: form.mahlzeiten_pro_tag,
      auswaerts_essen: form.auswaerts_essen,
      alkohol: form.alkohol,
      raucher: form.raucher,
      schlafdauer: Number(form.schlafdauer),
      aufwachgefuehl: form.aufwachgefuehl,
      schlaf_durchschlafen: form.schlaf_durchschlafen,
      stresslevel: form.stresslevel,
      entspannung: form.entspannung,
      gedanken_abschalten: form.gedanken_abschalten,
      verdauung_blaeungen: form.verdauung_blaeungen,
      heisshunger: form.heisshunger,
      medikamente,
      aktuelle_supplements: String(form.aktuelle_supplements || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    setSubmitError(null);

    let sessionId: string | null = null;

    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ antworten }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        setSubmitError('Server-Antwort konnte nicht gelesen werden.');
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setSubmitError(data?.error || 'Fehler beim Absenden.');
        setSubmitting(false);
        return;
      }
      if (!data.session_id) {
        setSubmitError('Ergebnis konnte nicht gespeichert werden.');
        setSubmitting(false);
        return;
      }

      sessionId = data.session_id;
    } catch (e) {
      const msg = e instanceof TypeError ? 'Server nicht erreichbar.' : 'Unbekannter Fehler beim Absenden.';
      setSubmitError(msg);
      setSubmitting(false);
      return;
    }

    // router.push() außerhalb des try-catch — Next.js-Navigation darf nicht abgefangen werden.
    router.push(`/ergebnis/${sessionId}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        {/* Headline */}
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Persönlicher Check
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Dein individueller Nährstoff-Check
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-muted">
            Kurze Fragen zu Alltag, Ernährung und Training — am Ende erhältst du eine klare
            Empfehlung, was für dich wirklich sinnvoll ist.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-surface p-6 sm:p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Schritt {step + 1} von {totalSteps}
              </span>
              <span className="text-sm font-semibold text-text">{gruppe.titel}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-outline/40">
              <div
                className="h-1.5 rounded-full bg-accent transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Fragen — mit Slide-Animation */}
          <div
            key={animKey}
            className={direction > 0 ? 'animate-step-forward' : 'animate-step-back'}
          >
            {gruppe.frageIds.map((id, i) => {
              const frage = FRAGEN_MAP.get(id);
              if (!frage) return null;
              return (
                <QuestionBlock
                  key={id}
                  nr={i + 1}
                  frage={frage.frage}
                  optional={frage.optional}
                >
                  {frage.typ === 'number' && (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={frage.min}
                        max={frage.max}
                        value={form[id]}
                        onChange={(e) => setField(id, e.target.value)}
                        placeholder={frage.placeholder}
                        className={inputBase + ' w-32'}
                      />
                      {frage.einheit && (
                        <span className="text-sm text-text-muted">{frage.einheit}</span>
                      )}
                    </div>
                  )}

                  {frage.typ === 'single' && (
                    <div className="flex flex-wrap gap-2.5">
                      {(frage.optionen ?? []).map((opt) => (
                        <OptionPill
                          key={opt.value}
                          label={opt.label}
                          selected={form[id] === opt.value}
                          onClick={() =>
                            setField(id, form[id] === opt.value ? '' : opt.value)
                          }
                        />
                      ))}
                    </div>
                  )}

                  {frage.typ === 'multi' && (
                    <div className="flex flex-wrap gap-2.5">
                      {(frage.optionen ?? []).map((opt) => (
                        <OptionPill
                          key={opt.value}
                          label={opt.label}
                          selected={
                            Array.isArray(form[id]) && form[id].includes(opt.value)
                          }
                          onClick={() => toggleMulti(id, opt.value)}
                        />
                      ))}
                    </div>
                  )}

                  {frage.typ === 'multi_freetext' && (
                    <input
                      type="text"
                      placeholder={frage.placeholder}
                      value={form[id]}
                      onChange={(e) => setField(id, e.target.value)}
                      className={inputBase + ' w-full'}
                    />
                  )}

                  {frage.typ === 'body_type' && (
                    <BodyTypeSelector
                      selected={form.koerperform}
                      geschlecht={form.geschlecht}
                      onChange={(v) => setField('koerperform', v)}
                    />
                  )}
                </QuestionBlock>
              );
            })}
          </div>

          {/* Disclaimer-Checkbox (nur letzter Schritt) */}
          {isLast && (
            <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-outline/60 bg-bg p-4">
              <input
                type="checkbox"
                checked={disclaimerChecked}
                onChange={(e) => {
                  setDisclaimerChecked(e.target.checked);
                  if (submitError) setSubmitError(null);
                }}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-accent"
              />
              <span className="text-sm leading-relaxed text-text-muted">
                Ich verstehe, dass diese Empfehlungen{' '}
                <strong className="text-text">keine ärztliche Beratung ersetzen</strong> und rein
                informativ sind. Bei gesundheitlichen Beschwerden oder der Einnahme von Medikamenten
                konsultiere ich vor der Einnahme von Nahrungsergänzungsmitteln einen Arzt.
              </span>
            </label>
          )}

          {/* Fehlermeldungen */}
          {(stepError || submitError) && (
            <p role="alert" className="mt-5 text-sm text-red-600">
              {stepError || submitError}
            </p>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text hover:bg-outline/20"
              >
                ← Zurück
              </button>
            ) : (
              <div />
            )}

            {isLast ? (
              <button
                type="button"
                onClick={onSubmit}
                disabled={submitting}
                className="rounded-full bg-accent px-7 py-3 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Wird berechnet …' : 'Empfehlung berechnen'}
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="rounded-full bg-accent px-7 py-3 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
              >
                Weiter →
              </button>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
