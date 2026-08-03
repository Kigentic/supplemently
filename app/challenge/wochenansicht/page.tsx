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
          .select('id, joined_at, challenges ( name, start_datum, wochen_anzahl, challenge_typ_id )')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]) as [{ data: { vorname: string; ist_admin: boolean } | null }, { data: any }];

      if (cancelled) return;

      const isAdmin = !!profile?.ist_admin;
      const challenge = Array.isArray(teilnahme?.challenges) ? teilnahme?.challenges[0] : teilnahme?.challenges;
      const wochenAnzahl = challenge?.wochen_anzahl ?? 8;

      const schedule = challenge?.start_datum
        ? getChallengeSchedule(challenge.start_datum, wochenAnzahl)
        : { currentWeek: 1, checkinUnlocked: false, checkinUnlockDate: new Date() };
      const currentWeek = schedule.currentWeek;

      let checkinDone = false;
      if (teilnahme?.id) {
        const { data: checkin } = await supabase
          .from('wochencheckins')
          .select('id')
          .eq('teilnahme_id', teilnahme.id)
          .eq('woche', currentWeek)
          .maybeSingle();
        checkinDone = !!checkin;
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

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        {/* Begrüßung */}
        <div className="mb-10">
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

        {/* Check-in-CTA */}
        <div
          className={`mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center ${
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
              className="shrink-0 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              Jetzt Check-in machen
            </Link>
          )}
        </div>

        <Link
          href="/challenge/trainingsplan"
          className="mb-8 flex items-center justify-between rounded-2xl border border-outline/60 bg-surface p-5 transition hover:border-accent/50"
        >
          <div>
            <p className="font-semibold text-text">Dein Trainingsplan</p>
            <p className="mt-0.5 text-sm text-text-muted">Ca. 60 Min. — angepasst auf dein Level.</p>
          </div>
          <span className="text-accent">→</span>
        </Link>

        <EmpfehlungCard />

        {/* 8-Wochen Challenge Übersicht */}
        <ChallengeWeeksOverview weeks={data.weeks} currentWeek={data.currentWeek} />
      </main>

      <SiteFooter />
      <CoachWidget />
    </div>
  );
}
