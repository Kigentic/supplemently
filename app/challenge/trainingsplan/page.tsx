'use client';

// Trainingsplan: aus dem globalen Repertoire (lib/trainingsplan.ts) wird per
// Geschlecht + gemapptem Trainingslevel (Onboarding-Fragebogen) + Phase
// (Woche 1-4 / 5-8) der passende Plan geladen. Keine Personalisierung pro
// Woche, keine dynamische Berechnung — nur einmal beim Laden aufgelöst.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { getChallengeSchedule } from '@/lib/challengeSchedule';
import { mapGeschlecht, mapTrainingslevel, phaseForWeek, variantForUser } from '@/lib/trainingsplan';

interface Uebung {
  id: string;
  block: 'warmup' | 'haupt' | 'finisher' | 'cooldown';
  name: string;
  saetze: number | null;
  wiederholungen: string | null;
  pause_sekunden: number | null;
  lastvorgabe: string | null;
  hinweis: string | null;
  varianten: string | null;
}

interface PlanData {
  planName: string;
  phase: 1 | 2;
  uebungen: Uebung[];
}

const BLOCK_LABEL: Record<Uebung['block'], string> = {
  warmup: 'Warm-up',
  haupt: 'Hauptteil',
  finisher: 'Finisher',
  cooldown: 'Cooldown',
};
const BLOCK_ORDER: Uebung['block'][] = ['warmup', 'haupt', 'finisher', 'cooldown'];

export default function TrainingsplanPage() {
  const router = useRouter();
  const [data, setData] = useState<PlanData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

      const { data: teilnahme } = (await supabase
        .from('challenge_teilnahmen')
        .select('onboarding_antworten, challenges ( start_datum, wochen_anzahl )')
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle()) as { data: any };

      if (cancelled) return;

      const challenge = Array.isArray(teilnahme?.challenges) ? teilnahme?.challenges[0] : teilnahme?.challenges;
      const antworten = (teilnahme?.onboarding_antworten ?? {}) as { geschlecht?: string; trainingslevel?: string };

      const wochenAnzahl = challenge?.wochen_anzahl ?? 8;
      const currentWeek = challenge?.start_datum
        ? getChallengeSchedule(challenge.start_datum, wochenAnzahl).currentWeek
        : 1;

      const geschlecht = mapGeschlecht(antworten.geschlecht);
      const level = mapTrainingslevel(antworten.trainingslevel);
      const phase = phaseForWeek(currentWeek);
      const variante = variantForUser(user.id);

      const { data: plan } = (await supabase
        .from('trainingsplaene')
        .select('id, name')
        .match({ geschlecht, level, phase, variante })
        .maybeSingle()) as { data: { id: string; name: string } | null };

      if (cancelled) return;

      if (!plan) {
        setError('Für dein Profil ist noch kein Trainingsplan hinterlegt.');
        setLoading(false);
        return;
      }

      const { data: uebungenRaw } = (await supabase
        .from('trainingsplan_uebungen')
        .select('id, block, name, saetze, wiederholungen, pause_sekunden, lastvorgabe, hinweis, uebungsbibliothek ( varianten )')
        .eq('trainingsplan_id', plan.id)
        .order('sort_order', { ascending: true })) as { data: any[] | null };

      if (cancelled) return;

      const uebungen: Uebung[] = (uebungenRaw ?? []).map((u) => {
        const bib = Array.isArray(u.uebungsbibliothek) ? u.uebungsbibliothek[0] : u.uebungsbibliothek;
        return { ...u, varianten: bib?.varianten ?? null };
      });

      setData({ planName: plan.name, phase, uebungen });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

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

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {data ? `Phase ${data.phase} · Woche ${data.phase === 1 ? '1–4' : '5–8'}` : 'Trainingsplan'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {data?.planName ?? 'Dein Trainingsplan'}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Ca. 60 Minuten netto. Gewicht/Widerstand orientiert sich an der Angabe pro Übung, nicht
            an fixen Zahlen — dein Körper kennt sein Limit besser als eine Tabelle.
          </p>
          <Link
            href="/challenge/wochenansicht"
            className="mt-4 inline-block text-sm text-accent hover:underline"
          >
            ← Zurück zur Wochenansicht
          </Link>
        </div>

        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-8">
            {BLOCK_ORDER.map((block) => {
              const items = data.uebungen.filter((u) => u.block === block);
              if (items.length === 0) return null;
              return (
                <div key={block}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-text-muted">
                    {BLOCK_LABEL[block]}
                  </h2>
                  <div className="space-y-3">
                    {items.map((u) => (
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
                        {u.lastvorgabe && <p className="mt-2 text-sm text-text-muted">{u.lastvorgabe}</p>}
                        {u.hinweis && <p className="mt-1 text-sm italic text-text-muted">{u.hinweis}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
