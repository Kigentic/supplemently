'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import ChallengeWeeksOverview from '@/app/_components/ChallengeWeeksOverview';
import CoachWidget from '@/app/_components/CoachWidget';
import EmpfehlungCard from '@/app/_components/EmpfehlungCard';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { getChallengeSchedule, formatUnlockDate } from '@/lib/challengeSchedule';
import { fetchChallengeWeeks, fetchChallengeTypIdBySlug, LONGEVITY_CHALLENGE_TYP_SLUG, type ChallengeWeek } from '@/lib/challengeWeeks';

// ── Persönliche Wochenansicht (Aufgaben/Habits der eigenen Challenge-Teilnahme) ──
// War früher unter /challenge/dashboard; dort ist jetzt die
// Studio-Mitgliederübersicht (Rasteransicht mit Anmeldelinks).

interface WochenansichtData {
  vorname: string;
  challengeName: string | null;
  currentWeek: number;
  wochenAnzahl: number;
  checkinDone: boolean;
  checkinUnlocked: boolean;
  checkinUnlockDate: Date;
  missedWeeks: number[];
  isAdmin: boolean;
  weeks: ChallengeWeek[];
}

export default function WochenansichtPage() {
  const router = useRouter();
  const [data, setData] = useState<WochenansichtData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;
      if (!user) {
        router.push('/challenge/registrierung');
        return;
      }

      const [{ data: profile }, { data: teilnahme }] = await Promise.all([
        supabase.from('profiles').select('vorname, ist_admin').eq('id', user.id).maybeSingle(),
        supabase
          .from('challenge_teilnahmen')
          .select('id, joined_at, status, onboarding_antworten, gestartet_at, challenges ( name, start_datum, wochen_anzahl, challenge_typ_id )')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]) as [{ data: { vorname: string; ist_admin: boolean } | null }, { data: any }];

      if (cancelled) return;

      // Onboarding (Fragebogen) noch nicht ausgefüllt — erst dahin schicken,
      // bevor die Wochenansicht gezeigt wird.
      if (teilnahme && !teilnahme.onboarding_antworten) {
        router.push('/fragebogen');
        return;
      }

      const isAdmin = !!profile?.ist_admin;
      const challenge = Array.isArray(teilnahme?.challenges) ? teilnahme?.challenges[0] : teilnahme?.challenges;
      const wochenAnzahl = challenge?.wochen_anzahl ?? 8;
      const startAnchor = teilnahme?.gestartet_at ?? challenge?.start_datum;

      const schedule = startAnchor
        ? getChallengeSchedule(startAnchor, wochenAnzahl)
        : { currentWeek: 1, checkinUnlocked: false, checkinUnlockDate: new Date() };
      const currentWeek = schedule.currentWeek;

      let checkinDone = false;
      let missedWeeks: number[] = [];
      if (teilnahme?.id) {
        const { data: checkins } = await supabase
          .from('wochencheckins')
          .select('woche')
          .eq('teilnahme_id', teilnahme.id)
          .lte('woche', currentWeek);
        const erledigt = new Set((checkins ?? []).map((c: { woche: number }) => c.woche));
        checkinDone = erledigt.has(currentWeek);
        missedWeeks = Array.from({ length: currentWeek - 1 }, (_, i) => i + 1).filter((w) => !erledigt.has(w));
      }

      const challengeTypId = challenge?.challenge_typ_id ?? (await fetchChallengeTypIdBySlug(supabase, LONGEVITY_CHALLENGE_TYP_SLUG));
      const weeks = challengeTypId ? await fetchChallengeWeeks(supabase, challengeTypId) : [];

      if (cancelled) return;

      setData({
        vorname: profile?.vorname ?? 'Du',
        challengeName: challenge?.name ?? null,
        currentWeek,
        wochenAnzahl,
        checkinDone,
        checkinUnlocked: isAdmin || schedule.checkinUnlocked,
        checkinUnlockDate: schedule.checkinUnlockDate,
        missedWeeks,
        isAdmin,
        weeks,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Wochenansicht wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        {/* Begrüßung */}
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {data.challengeName ?? 'Longevity Lifestyle Challenge'}
            {data.isAdmin && <span className="ml-2 rounded-full bg-text/10 px-2 py-0.5 text-[10px] font-semibold normal-case tracking-normal text-text-muted">Masteradmin</span>}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Hallo, {data.vorname}!
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Hier ist deine Challenge-Übersicht — Woche {data.currentWeek} von {data.wochenAnzahl}.
          </p>
        </div>

        {/* Verpasste Check-ins nachholen */}
        {data.missedWeeks.length > 0 && (
          <div className="mb-4 rounded-2xl border border-amber-300/60 bg-amber-50 p-5">
            <p className="font-semibold text-amber-900">
              {data.missedWeeks.length === 1
                ? 'Ein Check-in wartet noch auf dich'
                : `${data.missedWeeks.length} Check-ins warten noch auf dich`}
            </p>
            <p className="mt-0.5 text-sm text-amber-800">
              Kein Stress — die kannst du jederzeit nachholen.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.missedWeeks.map((w) => (
                <Link
                  key={w}
                  href={`/challenge/checkin?woche=${w}`}
                  className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Woche {w} nachholen
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Kompaktes 2x2-Raster: Check-in, Trainingsplan, Supplements, Freunde einladen */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            className={`flex h-full flex-col justify-between gap-4 rounded-2xl border p-5 ${
              data.checkinDone
                ? 'border-outline/60 bg-surface'
                : data.checkinUnlocked
                  ? 'border-accent/30 bg-accent/10'
                  : 'border-outline/60 bg-surface'
            }`}
          >
            <div>
              <p className="font-semibold text-text">
                {data.checkinDone
                  ? `Check-in für Woche ${data.currentWeek} erledigt ✓`
                  : data.checkinUnlocked
                    ? `Wochen-Check-in für Woche ${data.currentWeek} steht an`
                    : `Check-in für Woche ${data.currentWeek} noch nicht offen`}
              </p>
              <p className="mt-0.5 text-sm text-text-muted">
                {data.checkinDone
                  ? "Am Wochenende geht's mit der nächsten Woche weiter."
                  : data.checkinUnlocked
                    ? 'Ampel setzen für deine Gewohnheiten und kurz Feedback geben — dauert 2 Minuten.'
                    : `Verfügbar ab ${formatUnlockDate(data.checkinUnlockDate)}.`}
              </p>
            </div>
            {!data.checkinDone && data.checkinUnlocked && (
              <Link
                href="/challenge/checkin"
                className="self-start rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
              >
                Jetzt Check-in machen
              </Link>
            )}
          </div>

          <Link
            href="/challenge/trainingsplan"
            className="flex h-full items-center justify-between rounded-2xl border border-outline/60 bg-surface p-5 transition hover:border-accent/50"
          >
            <div>
              <p className="font-semibold text-text">Dein Trainingsplan</p>
              <p className="mt-0.5 text-sm text-text-muted">Ca. 60 Min. — angepasst auf dein Level.</p>
            </div>
            <span className="text-accent">→</span>
          </Link>

          <Link
            href="/challenge/supplemente"
            className="flex h-full items-center justify-between rounded-2xl border border-outline/60 bg-surface p-5 transition hover:border-accent/50"
          >
            <div>
              <p className="font-semibold text-text">Deine Supplement-Empfehlung</p>
              <p className="mt-0.5 text-sm text-text-muted">Personalisiert aus deinem Onboarding-Fragebogen.</p>
            </div>
            <span className="text-accent">→</span>
          </Link>

          <EmpfehlungCard />
        </div>

        {/* 8-Wochen Challenge Übersicht — volle Breite */}
        <ChallengeWeeksOverview weeks={data.weeks} currentWeek={data.currentWeek} unlockAll={data.isAdmin} />
      </main>

      <SiteFooter />
      <CoachWidget />
    </div>
  );
}
