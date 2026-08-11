'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { habitsUpTo, fetchChallengeWeeks, fetchChallengeTypIdBySlug, LONGEVITY_CHALLENGE_TYP_SLUG, type ChallengeWeek } from '@/lib/challengeWeeks';
import { getChallengeSchedule, formatUnlockDate } from '@/lib/challengeSchedule';
import { TrafficLight, ScalePicker, type Ampel } from '@/app/_components/CheckinControls';
import AnleitungLink from '@/app/_components/AnleitungModal';
import AffiliateProductCard, { type AffiliateProduct } from '@/app/_components/AffiliateProductCard';
import CoachWidget from '@/app/_components/CoachWidget';
import { mapFokus, type TrainingsplanFokus } from '@/lib/trainingsplan';

interface CheckinData {
  teilnahmeId: string;
  woche: number;
  isCatchUp: boolean;
  alreadySubmitted: boolean;
  unlocked: boolean;
  unlockDate: Date;
  trainingsplanAktiv: boolean;
  trainingsplanFokus: TrainingsplanFokus;
  geschlechtWeiblich: boolean;
}

const FOKUS_OPTIONEN: { value: TrainingsplanFokus; label: string; weiblichNur?: boolean }[] = [
  { value: 'kein', label: 'Kein spezieller Fokus' },
  { value: 'ruecken', label: 'Rücken & Haltung' },
  { value: 'beine_po', label: 'Beine & Po', weiblichNur: true },
  { value: 'bauch_core', label: 'Bauch & Core', weiblichNur: true },
];

export default function CheckinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg">
          <SiteHeader loggedIn />
          <main className="mx-auto max-w-2xl px-5 py-24 text-center">
            <p className="text-text-muted">Check-in wird geladen …</p>
          </main>
          <SiteFooter />
        </div>
      }
    >
      <CheckinPageInner />
    </Suspense>
  );
}

function CheckinPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<CheckinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [weeks, setWeeks] = useState<ChallengeWeek[]>([]);

  const [habitStatus, setHabitStatus] = useState<Record<string, Ampel>>({});
  const [wohlbefinden, setWohlbefinden] = useState<number | null>(null);
  const [schwierigkeit, setSchwierigkeit] = useState<number | null>(null);
  const [erfolg, setErfolg] = useState('');
  const [planKlar, setPlanKlar] = useState<'ja' | 'wechseln' | null>(null);
  const [neuerFokus, setNeuerFokus] = useState<TrainingsplanFokus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [scoreResult, setScoreResult] = useState<number | null>(null);
  const [scoreDelta, setScoreDelta] = useState<number | null>(null);
  const [affiliateEmpfehlungen, setAffiliateEmpfehlungen] = useState<AffiliateProduct[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.push('/challenge/login');
        return;
      }

      const [{ data: teilnahme }, { data: profile }] = await Promise.all([
        supabase
          .from('challenge_teilnahmen')
          .select('id, status, trainingsplan_gewuenscht, trainingsplan_fokus, onboarding_antworten, gestartet_at, challenges ( start_datum, wochen_anzahl, challenge_typ_id )')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from('profiles').select('ist_admin').eq('id', user.id).maybeSingle(),
      ]) as [{ data: any }, { data: { ist_admin: boolean } | null }];

      if (cancelled) return;

      if (!teilnahme) {
        router.push('/fragebogen');
        return;
      }
      if (teilnahme.status === 'pre_registered' || !teilnahme.onboarding_antworten) {
        router.push('/fragebogen');
        return;
      }

      const isAdmin = !!profile?.ist_admin;
      const challenge = Array.isArray(teilnahme.challenges) ? teilnahme.challenges[0] : teilnahme.challenges;
      const wochenAnzahl = challenge?.wochen_anzahl ?? 8;
      const startAnchor = teilnahme.gestartet_at ?? challenge?.start_datum;
      const schedule = startAnchor
        ? getChallengeSchedule(startAnchor, wochenAnzahl)
        : { currentWeek: 1, checkinUnlocked: false, checkinUnlockDate: new Date() };
      const currentWeek = schedule.currentWeek;

      // ?woche= erlaubt das Nachholen verpasster Wochen (Link aus der
      // Wochenansicht) — alles zwischen 1 und der aktuellen Woche ist gültig,
      // sonst Fallback auf die laufende Woche.
      const requestedWoche = Number(searchParams.get('woche'));
      const woche =
        Number.isInteger(requestedWoche) && requestedWoche >= 1 && requestedWoche <= currentWeek
          ? requestedWoche
          : currentWeek;
      const isCatchUp = woche < currentWeek;

      const { data: existingCheckin } = await supabase
        .from('wochencheckins')
        .select('id')
        .eq('teilnahme_id', teilnahme.id)
        .eq('woche', woche)
        .maybeSingle();

      const challengeTypId = challenge?.challenge_typ_id ?? (await fetchChallengeTypIdBySlug(supabase, LONGEVITY_CHALLENGE_TYP_SLUG));
      const loadedWeeks = challengeTypId ? await fetchChallengeWeeks(supabase, challengeTypId) : [];

      if (cancelled) return;

      const antworten = (teilnahme.onboarding_antworten ?? {}) as { geschlecht?: string };

      setWeeks(loadedWeeks);
      setData({
        teilnahmeId: teilnahme.id,
        woche,
        isCatchUp,
        alreadySubmitted: !!existingCheckin,
        unlocked: isAdmin || isCatchUp || schedule.checkinUnlocked,
        unlockDate: schedule.checkinUnlockDate,
        trainingsplanAktiv: !!teilnahme.trainingsplan_gewuenscht,
        trainingsplanFokus: mapFokus(teilnahme.trainingsplan_fokus),
        geschlechtWeiblich: antworten.geschlecht === 'weiblich',
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  const weekGroups = data ? habitsUpTo(weeks, data.woche) : [];
  const allHabitKeys = weekGroups.flatMap((g) => g.items.map((i) => i.key));
  const allAnswered = allHabitKeys.length > 0 && allHabitKeys.every((k) => habitStatus[k]);

  async function onSubmit() {
    setError(null);
    if (!allAnswered) {
      setError('Bitte für jede Gewohnheit eine Ampel auswählen.');
      return;
    }
    if (wohlbefinden === null) {
      setError('Bitte angeben, wie gut du dich diese Woche gefühlt hast.');
      return;
    }
    if (schwierigkeit === null) {
      setError('Bitte angeben, wie schwer die Aufgaben waren.');
      return;
    }

    setStatus('submitting');
    const supabase = getBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken || !data) {
      setError('Session abgelaufen. Bitte neu einloggen.');
      setStatus('idle');
      return;
    }

    // Trainingsplan-Wechsel — best effort, blockiert den Check-in nicht.
    if (data.trainingsplanAktiv && planKlar === 'wechseln' && neuerFokus) {
      try {
        await fetch('/api/challenge/trainingsplan-praeferenz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ gewuenscht: true, fokus: neuerFokus }),
        });
      } catch {
        // ignorieren — Check-in soll trotzdem durchgehen
      }
    }

    try {
      const res = await fetch('/api/challenge/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          woche: data.woche,
          habit_status: habitStatus,
          wohlbefinden,
          schwierigkeit,
          erfolg_freitext: erfolg,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error || 'Check-in konnte nicht gespeichert werden.');
        setStatus('idle');
        return;
      }
      setScoreResult(json.score_woche ?? null);
      setScoreDelta(json.score_delta ?? null);
      setAffiliateEmpfehlungen(json.affiliate_empfehlungen ?? []);
      setStatus('success');
    } catch {
      setError('Server nicht erreichbar. Bitte erneut versuchen.');
      setStatus('idle');
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Check-in wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!data.unlocked) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-outline/20 text-3xl">
            🔒
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Check-in noch nicht offen.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Der Check-in für Woche {data.woche} ist ab {formatUnlockDate(data.unlockDate)} verfügbar.
            Bis dahin: fleißig die Gewohnheiten dieser Woche umsetzen.
          </p>
          <Link
            href="/challenge/wochenansicht"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Zurück zur Wochenansicht
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (data.alreadySubmitted || status === 'success') {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-3xl">
            ✓
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Check-in für Woche {data.woche} ist drin.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            {scoreResult !== null
              ? `Du hast ${scoreResult} Punkte für diese Woche gesammelt.`
              : 'Dein Check-in für diese Woche ist bereits gespeichert.'}
          </p>

          {scoreDelta !== null && (
            <div
              className={`mt-8 rounded-2xl border p-5 text-left ${
                scoreDelta > 0
                  ? 'border-emerald-300/60 bg-emerald-50'
                  : scoreDelta < 0
                    ? 'border-amber-300/60 bg-amber-50'
                    : 'border-outline/60 bg-surface'
              }`}
            >
              <p className={`font-semibold ${scoreDelta > 0 ? 'text-emerald-900' : scoreDelta < 0 ? 'text-amber-900' : 'text-text'}`}>
                {scoreDelta > 0
                  ? `🔥 +${scoreDelta} Punkte gegenüber letzter Woche`
                  : scoreDelta < 0
                    ? `${scoreDelta} Punkte gegenüber letzter Woche`
                    : 'Genauso stark wie letzte Woche'}
              </p>
              <p className={`mt-0.5 text-sm ${scoreDelta > 0 ? 'text-emerald-800' : scoreDelta < 0 ? 'text-amber-800' : 'text-text-muted'}`}>
                {scoreDelta > 0
                  ? 'Weiter so — du wirst besser.'
                  : scoreDelta < 0
                    ? 'Nächste Woche geht wieder bergauf.'
                    : 'Konstanz zahlt sich aus.'}
              </p>
            </div>
          )}

          {affiliateEmpfehlungen.length > 0 && (
            <div className="mt-10 space-y-4 text-left">
              <p className="text-sm font-semibold text-text">Könnte jetzt für dich passen</p>
              {affiliateEmpfehlungen.map((p) => (
                <AffiliateProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <Link
            href="/challenge/wochenansicht"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Zurück zur Wochenansicht
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Wochen-Check-in
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Wie lief Woche {data.woche}?
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Für jede Gewohnheit: komplett umgesetzt, teilweise, oder gar nicht. Ehrlich sein bringt mehr als schön färben.
          </p>
          {data.woche > 1 && (
            <p className="mt-3 rounded-lg bg-surface px-3.5 py-2.5 text-sm text-text-muted">
              <span className="font-medium text-text">Wichtig:</span> Gewohnheiten aus früheren Wochen laufen weiter
              — du bewertest unten also nicht nur die neuen Aufgaben dieser Woche, sondern auch, wie konsequent du
              die alten diese Woche umgesetzt hast. Deine bereits abgeschickten Check-ins ändern sich dadurch nicht.
            </p>
          )}
        </div>

        <div className="space-y-8">
          {weekGroups.map(({ week, items }) => (
            <section key={week.num}>
              <div className="mb-3 flex items-center gap-2.5">
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: week.color, color: week.textColor }}
                >
                  {week.num}
                </span>
                <span className="text-sm font-semibold text-text">{week.theme}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    week.num === data.woche ? 'bg-accent/10 text-accent' : 'bg-outline/20 text-text-muted'
                  }`}
                >
                  {week.num === data.woche ? 'Neu diese Woche' : `Läuft weiter · seit Woche ${week.num}`}
                </span>
              </div>
              <div className="space-y-3 rounded-2xl bg-surface p-5">
                {items.map((item) => (
                  <div key={item.key} className="flex flex-col gap-2 border-b border-outline/40 pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-text">{item.text}</p>
                      {item.anleitungVarianten && (
                        <div className="mt-1">
                          <AnleitungLink varianten={item.anleitungVarianten} contextWeek={data.woche} />
                        </div>
                      )}
                    </div>
                    <TrafficLight
                      value={habitStatus[item.key] ?? null}
                      onChange={(v) => setHabitStatus((s) => ({ ...s, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}

          <section>
            <p className="mb-1 text-sm font-semibold text-text">Wie gut fühlst du dich diese Woche?</p>
            <p className="mb-3 text-xs text-text-muted">1 = richtig schlecht · 10 = topfit</p>
            <ScalePicker value={wohlbefinden} onChange={setWohlbefinden} />
          </section>

          <section>
            <p className="mb-1 text-sm font-semibold text-text">Wie schwer waren die Aufgaben diese Woche?</p>
            <p className="mb-3 text-xs text-text-muted">1 = kinderleicht · 10 = richtig hart</p>
            <ScalePicker value={schwierigkeit} onChange={setSchwierigkeit} />
          </section>

          {data.trainingsplanAktiv && (
            <section>
              <p className="mb-1 text-sm font-semibold text-text">Kommst du mit deinem Trainingsplan klar?</p>
              <p className="mb-3 text-xs text-text-muted">Kein Stress — du kannst den Fokus jederzeit wechseln.</p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => { setPlanKlar('ja'); setNeuerFokus(null); }}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    planKlar === 'ja' ? 'border-accent bg-accent text-on-accent' : 'border-outline bg-bg text-text hover:border-text'
                  }`}
                >
                  Ja, passt
                </button>
                <button
                  type="button"
                  onClick={() => setPlanKlar('wechseln')}
                  className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                    planKlar === 'wechseln' ? 'border-accent bg-accent text-on-accent' : 'border-outline bg-bg text-text hover:border-text'
                  }`}
                >
                  Ich möchte wechseln
                </button>
              </div>

              {planKlar === 'wechseln' && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {FOKUS_OPTIONEN.filter((o) => !o.weiblichNur || data.geschlechtWeiblich).map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setNeuerFokus(o.value)}
                      className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${
                        neuerFokus === o.value ? 'border-accent bg-accent text-on-accent' : 'border-outline bg-bg text-text hover:border-text'
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          <section>
            <label htmlFor="erfolg" className="mb-1.5 block text-sm font-semibold text-text">
              Größter Erfolg diese Woche <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="erfolg"
              rows={3}
              value={erfolg}
              onChange={(e) => setErfolg(e.target.value)}
              className="w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
              placeholder="Was lief richtig gut?"
            />
          </section>

          {error && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={status === 'submitting'}
            className="w-full rounded-full bg-accent px-7 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'submitting' ? 'Wird gespeichert …' : 'Check-in abschicken'}
          </button>
        </div>
      </main>

      <SiteFooter />
      <CoachWidget />
    </div>
  );
}
