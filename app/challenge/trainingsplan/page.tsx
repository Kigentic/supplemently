'use client';

// Trainingsplan: aus den 13 kuratierten Plänen (M1-M5, F1-F8) wird per
// Geschlecht + Trainingslevel (Onboarding) + Fokus (Onboarding, im
// Check-in überschreibbar) über trainingsplan_zuordnung der passende Plan
// geladen. Reine Nachschlagetabelle, keine dynamische Berechnung.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { getChallengeSchedule } from '@/lib/challengeSchedule';
import { mapGeschlecht, mapTrainingslevel, mapFokus, type TrainingsplanFokus } from '@/lib/trainingsplan';

interface Phase {
  nummer: number;
  wochen_von: number;
  wochen_bis: number;
  ziel: string;
}

interface Uebung {
  id: string;
  name: string;
  saetze: number | null;
  wiederholungen: string | null;
  pause_sekunden: number | null;
  varianten: string | null;
}

interface PlanData {
  name: string;
  zielgruppe: string;
  fokusText: string;
  frequenz: string;
  nettoMinuten: number;
  pauseHinweis: string;
  voraussetzung: string | null;
  phasen: Phase[];
  trainerHinweise: string[];
  uebungen: Uebung[];
  currentWeek: number;
}

const FOKUS_OPTIONEN: { value: TrainingsplanFokus; label: string; weiblichNur?: boolean }[] = [
  { value: 'kein', label: 'Kein spezieller Fokus' },
  { value: 'ruecken', label: 'Rücken & Haltung' },
  { value: 'beine_po', label: 'Beine & Po', weiblichNur: true },
  { value: 'bauch_core', label: 'Bauch & Core', weiblichNur: true },
];

export default function TrainingsplanPage() {
  const router = useRouter();
  const [data, setData] = useState<PlanData | null>(null);
  const [gewuenscht, setGewuenscht] = useState<boolean | null>(null);
  const [geschlechtWeiblich, setGeschlechtWeiblich] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingFokus, setSavingFokus] = useState(false);
  const [showFokusPicker, setShowFokusPicker] = useState(false);

  async function load() {
    const supabase = getBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      router.push('/challenge/login');
      return;
    }

    const { data: teilnahme } = (await supabase
      .from('challenge_teilnahmen')
      .select('trainingsplan_gewuenscht, trainingsplan_fokus, onboarding_antworten, challenges ( start_datum, wochen_anzahl )')
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false })
      .limit(1)
      .maybeSingle()) as { data: any };

    const challenge = Array.isArray(teilnahme?.challenges) ? teilnahme?.challenges[0] : teilnahme?.challenges;
    const antworten = (teilnahme?.onboarding_antworten ?? {}) as { geschlecht?: string; trainingslevel?: string };
    const geschlecht = mapGeschlecht(antworten.geschlecht);
    setGeschlechtWeiblich(geschlecht === 'weiblich');

    if (!teilnahme?.trainingsplan_gewuenscht) {
      setGewuenscht(false);
      setLoading(false);
      return;
    }
    setGewuenscht(true);

    const level = mapTrainingslevel(antworten.trainingslevel);
    const fokus = mapFokus(teilnahme.trainingsplan_fokus);

    const wochenAnzahl = challenge?.wochen_anzahl ?? 8;
    const currentWeek = challenge?.start_datum ? getChallengeSchedule(challenge.start_datum, wochenAnzahl).currentWeek : 1;

    const { data: zuordnung } = (await supabase
      .from('trainingsplan_zuordnung')
      .select('trainingsplan_id')
      .match({ geschlecht, level, fokus })
      .maybeSingle()) as { data: { trainingsplan_id: string } | null };

    // Fallback, falls die spezifische Fokus-Kombination (noch) keinen Plan hat.
    const zuordnungFallback =
      zuordnung ??
      ((
        await supabase.from('trainingsplan_zuordnung').select('trainingsplan_id').match({ geschlecht, level, fokus: 'kein' }).maybeSingle()
      ).data as { trainingsplan_id: string } | null);

    if (!zuordnungFallback) {
      setError('Für dein Profil ist noch kein Trainingsplan hinterlegt.');
      setLoading(false);
      return;
    }

    const { data: plan } = (await supabase
      .from('trainingsplaene')
      .select('name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise')
      .eq('id', zuordnungFallback.trainingsplan_id)
      .single()) as { data: any };

    const { data: uebungenRaw } = (await supabase
      .from('trainingsplan_uebungen')
      .select('id, name, saetze, wiederholungen, pause_sekunden, uebungsbibliothek ( varianten )')
      .eq('trainingsplan_id', zuordnungFallback.trainingsplan_id)
      .order('sort_order', { ascending: true })) as { data: any[] | null };

    const uebungen: Uebung[] = (uebungenRaw ?? []).map((u) => {
      const bib = Array.isArray(u.uebungsbibliothek) ? u.uebungsbibliothek[0] : u.uebungsbibliothek;
      return { ...u, varianten: bib?.varianten ?? null };
    });

    setData({
      name: plan.name,
      zielgruppe: plan.zielgruppe,
      fokusText: plan.fokus_text,
      frequenz: plan.frequenz,
      nettoMinuten: plan.netto_minuten,
      pauseHinweis: plan.pause_hinweis,
      voraussetzung: plan.voraussetzung,
      phasen: plan.phasen,
      trainerHinweise: plan.trainer_hinweise,
      uebungen,
      currentWeek,
    });
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function savePraeferenz(gewuenschtNeu: boolean, fokusNeu?: TrainingsplanFokus) {
    setSavingFokus(true);
    const supabase = getBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setSavingFokus(false);
      return;
    }
    await fetch('/api/challenge/trainingsplan-praeferenz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ gewuenscht: gewuenschtNeu, fokus: fokusNeu }),
    });
    setSavingFokus(false);
    setShowFokusPicker(false);
    setLoading(true);
    await load();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Trainingsplan wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (gewuenscht === false) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-xl px-5 py-20 text-center sm:py-28">
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">Kein Trainingsplan aktiv.</h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Du hast beim Onboarding keinen fertigen Trainingsplan gewählt. Kein Problem — du kannst
            das jederzeit nachholen.
          </p>
          <button
            type="button"
            disabled={savingFokus}
            onClick={() => savePraeferenz(true, 'kein')}
            className="mt-8 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:opacity-60"
          >
            {savingFokus ? 'Wird aktiviert …' : 'Ja, Trainingsplan aktivieren'}
          </button>
          <div className="mt-6">
            <Link href="/challenge/wochenansicht" className="text-sm text-accent hover:underline">
              ← Zurück zur Wochenansicht
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const aktuellePhase = data?.phasen.find((p) => data.currentWeek >= p.wochen_von && data.currentWeek <= p.wochen_bis) ?? data?.phasen[0];
  const sichtbareFokusOptionen = FOKUS_OPTIONEN.filter((o) => !o.weiblichNur || geschlechtWeiblich);

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {aktuellePhase ? `Phase ${aktuellePhase.nummer} · Woche ${aktuellePhase.wochen_von}–${aktuellePhase.wochen_bis}` : 'Trainingsplan'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">{data?.name ?? 'Dein Trainingsplan'}</h1>
          {data && (
            <>
              <p className="mt-3 text-base leading-relaxed text-text-muted">{data.zielgruppe}</p>
              <p className="mt-3 text-sm text-text-muted">
                {data.fokusText} · {data.frequenz} · ca. {data.nettoMinuten} Min. netto · Pause {data.pauseHinweis}
              </p>
              {aktuellePhase && (
                <p className="mt-3 rounded-lg bg-surface px-3.5 py-2.5 text-sm text-text">
                  <span className="font-medium">Ziel dieser Phase:</span> {aktuellePhase.ziel}
                </p>
              )}
              {data.voraussetzung && (
                <div role="alert" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  ⚠ {data.voraussetzung}
                </div>
              )}
            </>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link href="/challenge/wochenansicht" className="text-sm text-accent hover:underline">
              ← Zurück zur Wochenansicht
            </Link>
            <button type="button" onClick={() => setShowFokusPicker((v) => !v)} className="text-sm text-text-muted hover:underline">
              Fokus ändern
            </button>
          </div>

          {showFokusPicker && (
            <div className="mt-4 rounded-xl border border-outline/50 bg-surface p-4">
              <p className="mb-3 text-sm font-medium text-text">Anderen Fokus wählen:</p>
              <div className="flex flex-wrap gap-2">
                {sichtbareFokusOptionen.map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    disabled={savingFokus}
                    onClick={() => savePraeferenz(true, o.value)}
                    className="rounded-full border border-outline bg-bg px-4 py-2 text-sm font-medium text-text transition hover:border-accent disabled:opacity-60"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <>
            <div className="space-y-3">
              {data.uebungen.map((u) => (
                <div key={u.id} className="rounded-2xl border border-outline/50 bg-surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold text-text">{u.name}</p>
                    <p className="text-sm text-text-muted">
                      {[u.saetze ? `${u.saetze} Sätze` : null, u.wiederholungen, u.pause_sekunden ? `${u.pause_sekunden}s Pause` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  {u.varianten && (
                    <p className="mt-2 text-xs text-text-muted">
                      <span className="font-medium">Varianten:</span> {u.varianten}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {data.trainerHinweise.length > 0 && (
              <div className="mt-10">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-text-muted">Trainer-Hinweise</h2>
                <ul className="space-y-2.5">
                  {data.trainerHinweise.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
