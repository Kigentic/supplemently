'use client';

// Value-Equation-Funnel: Gast füllt den Fragebogen aus, BEVOR ein Account
// existiert (Upfit-Muster, siehe Roadmap Phase B). Erst im letzten Schritt
// wird registriert — Fragebogen-Antworten reisen im selben Request mit
// (lib/onboarding.ts wird server-seitig direkt vom Registrierungs-Endpunkt
// aufgerufen, kein zweiter, auth-pflichtiger Request nötig). Geteilt von
// allen drei Challenge-Landingpages (Longevity/Abnehmen/Rücken) — nur
// challengeSlug/challengeName unterscheiden sich pro Seite.
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import PresalesCoachWidget from '@/app/_components/PresalesCoachWidget';
import { FRAGEN_MAP, GRUPPEN, validateFragebogenStep, type Answers } from '@/lib/questions';
import { inputBase, OptionPill, BodyTypeSelector, QuestionBlock } from '@/app/_components/fragebogenUi';

type FormState = Record<string, any>;

const initial: FormState = {
  geschlecht: '',
  alter: '',
  groesse: '',
  gewicht: '',
  koerperform: '',
  trainingslevel: '',
  trainingsziel: '',
  trainingsplan_gewuenscht: '',
  trainingsplan_ort: '',
  trainingsplan_fokus: '',
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

interface RegForm {
  vorname: string;
  nachname: string;
  email: string;
  passwort: string;
  passwort_wdh: string;
  handynummer: string;
  dsgvo_marketing: boolean;
  dsgvo_affiliate: boolean;
}

const initialReg: RegForm = {
  vorname: '',
  nachname: '',
  email: '',
  passwort: '',
  passwort_wdh: '',
  handynummer: '',
  dsgvo_marketing: false,
  dsgvo_affiliate: false,
};

type Phase = 'fragen' | 'promo' | 'registrierung';

function buildAnswers(form: FormState): Answers {
  const restriktionen = Array.isArray(form.restriktionen) && form.restriktionen.length ? form.restriktionen : ['keine'];
  const medikamente = Array.isArray(form.medikamente) && form.medikamente.length ? form.medikamente : ['keine'];
  return {
    geschlecht: form.geschlecht,
    alter: Number(form.alter),
    groesse: Number(form.groesse),
    gewicht: Number(form.gewicht),
    koerperform: form.koerperform,
    trainingslevel: form.trainingslevel,
    trainingsziel: form.trainingsziel,
    trainingsplan_gewuenscht: form.trainingsplan_gewuenscht,
    trainingsplan_ort: form.trainingsplan_gewuenscht === 'ja' ? form.trainingsplan_ort : undefined,
    trainingsplan_fokus: form.trainingsplan_gewuenscht === 'ja' ? form.trainingsplan_fokus : undefined,
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
    gelenk_probleme: form.gelenk_probleme,
    medikamente,
    aktuelle_supplements: String(form.aktuelle_supplements || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

export default function ChallengePlanWizard({
  challengeSlug,
  challengeName,
}: {
  /** Slug in `challenges.slug` — steuert, welche der mehreren offenen Turnkiste-Challenges die Anmeldung trifft. */
  challengeSlug: string;
  /** Anzeigename für Copy, z.B. "Longevity Challenge", "Abnehmen-Challenge", "Rückenfit-Challenge". */
  challengeName: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initial);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [animKey, setAnimKey] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);
  const [phase, setPhase] = useState<Phase>('fragen');

  const [reg, setReg] = useState<RegForm>(initialReg);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      if (value === 'keine') return { ...f, [field]: checked ? ['keine'] : [] };
      list = list.filter((r) => r !== 'keine');
      if (checked) list.push(value);
      else list = list.filter((r) => r !== value);
      return { ...f, [field]: list };
    });
    setStepError(null);
  }

  function setRegField<K extends keyof RegForm>(k: K, v: RegForm[K]) {
    setReg((r) => ({ ...r, [k]: v }));
  }

  function goNext() {
    const err = validateFragebogenStep(step, form);
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

  function goToPromo() {
    const err = validateFragebogenStep(step, form);
    if (err) { setStepError(err); return; }
    if (!disclaimerChecked) {
      setSubmitError('Bitte bestätige den Hinweis zur ärztlichen Beratung.');
      return;
    }
    setStepError(null);
    setSubmitError(null);
    setPhase('promo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToRegistrierung() {
    setSubmitError(null);
    setPhase('registrierung');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function validateReg(): string | null {
    if (!reg.vorname.trim() || !reg.nachname.trim()) return 'Vor- und Nachname sind Pflicht.';
    if (!reg.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reg.email)) return 'Gültige E-Mail-Adresse angeben.';
    if (reg.passwort.length < 8) return 'Passwort muss mindestens 8 Zeichen haben.';
    if (reg.passwort !== reg.passwort_wdh) return 'Passwörter stimmen nicht überein.';
    if (!reg.dsgvo_marketing) return 'Bitte die Teilnahmebedingungen akzeptieren.';
    if (!reg.dsgvo_affiliate) return 'Bitte die Datenschutzbestimmungen akzeptieren.';
    return null;
  }

  async function onFinish(e: React.FormEvent) {
    e.preventDefault();
    const err = validateReg();
    if (err) { setSubmitError(err); return; }

    setSubmitting(true);
    setSubmitError(null);

    const antworten = buildAnswers(form);

    try {
      const res = await fetch('/api/challenge/registrierung', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: reg.vorname.trim(),
          nachname: reg.nachname.trim(),
          email: reg.email.trim(),
          passwort: reg.passwort,
          handynummer: reg.handynummer.trim() || undefined,
          dsgvo_marketing: reg.dsgvo_marketing,
          dsgvo_affiliate: reg.dsgvo_affiliate,
          antworten,
          challengeSlug,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data?.error ?? 'Fehler bei der Anmeldung. Bitte erneut versuchen.');
        setSubmitting(false);
        return;
      }
      if (data.teilnahmeId) {
        router.push(`/challenge-pass/${data.teilnahmeId}`);
      } else {
        router.push('/challenge/bestaetigung');
      }
    } catch {
      setSubmitError('Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader showNavLinks={false} />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {phase === 'fragen' ? 'Dein Challenge-Plan' : phase === 'promo' ? 'Extra-Tipp' : 'Fast geschafft'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {phase === 'fragen'
              ? 'Erstelle deinen persönlichen Challenge-Plan'
              : phase === 'promo'
                ? 'Bezahlt von deiner Krankenkasse'
                : 'Sichere dir deinen Platz'}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-text-muted">
            {phase === 'fragen'
              ? 'Kurze Fragen zu Alltag, Ernährung und Training — dein individueller Plan steht in 2 Minuten.'
              : phase === 'promo'
                ? 'Bevor es losgeht: ein zertifiziertes Ernährungsprogramm, das die meisten gesetzlichen Krankenkassen komplett übernehmen.'
                : `Dein Plan ist fertig — reserviere jetzt deinen Platz in der ${challengeName}.`}
          </p>
        </div>

        {phase === 'promo' && (
          <div className="rounded-2xl bg-surface p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold text-text">Dein Ernährungsprogramm</h2>
            <p className="mt-1 text-sm text-text-muted">powered by Upfit — zertifiziertes §20-SGB-V-Präventionsprogramm</p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-text-muted">
              Individuelle Ernährungspläne mit über 16.000 Rezepten, abgestimmt auf dein Ziel
              (Abnehmen, Muskelaufbau, Definition). Die meisten Krankenkassen erstatten die Kosten
              zu 100 % — ohne Zusatzkosten für dich.
            </p>
            <a
              href="https://dein-abnehmprogramm.com/ernaehrungsplan-erstellen/?init_section=p"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full bg-accent px-7 py-3 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              Hier gehts zur App →
            </a>

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPhase('fragen')}
                className="rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text hover:bg-outline/20"
              >
                ← Zurück
              </button>
              <button
                type="button"
                onClick={goToRegistrierung}
                className="rounded-full bg-accent px-7 py-3 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
              >
                Weiter zur Anmeldung →
              </button>
            </div>
          </div>
        )}

        {phase === 'registrierung' && (
          <form onSubmit={onFinish} noValidate className="space-y-6 rounded-2xl bg-surface p-6 sm:p-8">
            <div className="rounded-xl border border-accent/25 bg-accent/5 p-4 text-sm text-text">
              Dein Plan basiert auf deinen Antworten und wartet auf dich — nur noch deine Kontaktdaten,
              dann sicherst du dir deinen Platz.
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vorname" className="mb-1.5 block text-sm font-medium text-text">
                  Vorname <span className="text-accent">*</span>
                </label>
                <input id="vorname" className={inputBase + ' w-full'} value={reg.vorname} onChange={(e) => setRegField('vorname', e.target.value)} autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="nachname" className="mb-1.5 block text-sm font-medium text-text">
                  Nachname <span className="text-accent">*</span>
                </label>
                <input id="nachname" className={inputBase + ' w-full'} value={reg.nachname} onChange={(e) => setRegField('nachname', e.target.value)} autoComplete="family-name" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
                  E-Mail <span className="text-accent">*</span>
                </label>
                <input id="email" type="email" className={inputBase + ' w-full'} value={reg.email} onChange={(e) => setRegField('email', e.target.value)} autoComplete="email" placeholder="max@beispiel.de" />
              </div>
              <div>
                <label htmlFor="passwort" className="mb-1.5 block text-sm font-medium text-text">
                  Passwort <span className="text-accent">*</span>
                </label>
                <input id="passwort" type="password" className={inputBase + ' w-full'} value={reg.passwort} onChange={(e) => setRegField('passwort', e.target.value)} autoComplete="new-password" placeholder="Mindestens 8 Zeichen" />
              </div>
              <div>
                <label htmlFor="passwort_wdh" className="mb-1.5 block text-sm font-medium text-text">
                  Passwort wiederholen <span className="text-accent">*</span>
                </label>
                <input id="passwort_wdh" type="password" className={inputBase + ' w-full'} value={reg.passwort_wdh} onChange={(e) => setRegField('passwort_wdh', e.target.value)} autoComplete="new-password" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="handynummer" className="mb-1.5 block text-sm font-medium text-text">
                  Handynummer <span className="text-text-muted">(optional)</span>
                </label>
                <input id="handynummer" type="tel" className={inputBase + ' w-full'} value={reg.handynummer} onChange={(e) => setRegField('handynummer', e.target.value)} autoComplete="tel" placeholder="+49 170 000 0000" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0 accent-accent" checked={reg.dsgvo_marketing} onChange={(e) => setRegField('dsgvo_marketing', e.target.checked)} />
                <p className="text-sm text-text-muted">
                  Ich akzeptiere die{' '}
                  <Link href="/teilnahmebedingungen" className="underline hover:text-text" target="_blank">Teilnahmebedingungen</Link>. <span className="text-accent">*</span>
                </p>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0 accent-accent" checked={reg.dsgvo_affiliate} onChange={(e) => setRegField('dsgvo_affiliate', e.target.checked)} />
                <p className="text-sm text-text-muted">
                  Ich akzeptiere die{' '}
                  <Link href="/datenschutz" className="underline hover:text-text" target="_blank">Datenschutzbestimmungen</Link>. <span className="text-accent">*</span>
                </p>
              </label>
            </div>

            {submitError && (
              <p role="alert" className="text-sm text-red-600">{submitError}</p>
            )}

            <div className="flex items-center justify-between gap-4">
              <button type="button" onClick={() => setPhase('promo')} className="rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text hover:bg-outline/20">
                ← Zurück
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-accent px-7 py-3 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Platz wird reserviert …' : 'Jetzt Platz reservieren'}
              </button>
            </div>

            <p className="text-center text-sm text-text-muted">
              Bereits angemeldet?{' '}
              <Link href="/challenge/login" className="font-medium text-accent hover:underline">Einloggen</Link>
            </p>
          </form>
        )}

        {phase === 'fragen' && (
          <div className="rounded-2xl bg-surface p-6 sm:p-8">
            <div className="mb-8">
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-xs text-text-muted">Schritt {step + 1} von {totalSteps}</span>
                <span className="text-sm font-semibold text-text">{gruppe.titel}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-outline/40">
                <div className="h-1.5 rounded-full bg-accent transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div key={animKey} className={direction > 0 ? 'animate-step-forward' : 'animate-step-back'}>
              {gruppe.frageIds.map((id, i) => {
                const frage = FRAGEN_MAP.get(id);
                if (!frage) return null;
                if (id === 'trainingsplan_ort' && form.trainingsplan_gewuenscht !== 'ja') return null;
                if (id === 'trainingsplan_fokus' && form.trainingsplan_gewuenscht !== 'ja') return null;
                const optionen =
                  id === 'trainingsplan_fokus' && form.geschlecht !== 'weiblich'
                    ? (frage.optionen ?? []).filter((o) => o.value === 'kein' || o.value === 'ruecken' || o.value === 'fatburn')
                    : frage.optionen;
                return (
                  <QuestionBlock key={id} nr={i + 1} frage={frage.frage} optional={frage.optional}>
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
                        {frage.einheit && <span className="text-sm text-text-muted">{frage.einheit}</span>}
                      </div>
                    )}

                    {frage.typ === 'single' && (
                      <div className="flex flex-wrap gap-2.5">
                        {(optionen ?? []).map((opt) => (
                          <OptionPill key={opt.value} label={opt.label} selected={form[id] === opt.value} onClick={() => setField(id, form[id] === opt.value ? '' : opt.value)} />
                        ))}
                      </div>
                    )}

                    {frage.typ === 'multi' && (
                      <div className="flex flex-wrap gap-2.5">
                        {(frage.optionen ?? []).map((opt) => (
                          <OptionPill key={opt.value} label={opt.label} selected={Array.isArray(form[id]) && form[id].includes(opt.value)} onClick={() => toggleMulti(id, opt.value)} />
                        ))}
                      </div>
                    )}

                    {frage.typ === 'multi_freetext' && (
                      <input type="text" placeholder={frage.placeholder} value={form[id]} onChange={(e) => setField(id, e.target.value)} className={inputBase + ' w-full'} />
                    )}

                    {frage.typ === 'body_type' && (
                      <BodyTypeSelector selected={form.koerperform} geschlecht={form.geschlecht} onChange={(v) => setField('koerperform', v)} />
                    )}
                  </QuestionBlock>
                );
              })}
            </div>

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

            {(stepError || submitError) && (
              <p role="alert" className="mt-5 text-sm text-red-600">{stepError || submitError}</p>
            )}

            <div className="mt-8 flex items-center justify-between gap-4">
              {step > 0 ? (
                <button type="button" onClick={goBack} className="rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text hover:bg-outline/20">
                  ← Zurück
                </button>
              ) : <div />}

              <button
                type="button"
                onClick={isLast ? goToPromo : goNext}
                className="rounded-full bg-accent px-7 py-3 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
              >
                Weiter →
              </button>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
      <PresalesCoachWidget />
    </div>
  );
}
