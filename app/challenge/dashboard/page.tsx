'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import ChallengeWeeksOverview from '@/app/_components/ChallengeWeeksOverview';
import { getBrowserClient } from '@/lib/supabaseBrowser';

// ── Hauptseite ────────────────────────────────────────────────────────────────

interface DashboardData {
  vorname: string;
  challengeName: string | null;
  currentWeek: number;
  wochenAnzahl: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
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
        supabase.from('profiles').select('vorname').eq('id', user.id).maybeSingle(),
        supabase
          .from('challenge_teilnahmen')
          .select('joined_at, challenges ( name, start_datum, wochen_anzahl )')
          .eq('user_id', user.id)
          .order('joined_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]) as [{ data: { vorname: string } | null }, { data: any }];

      if (cancelled) return;

      const challenge = Array.isArray(teilnahme?.challenges) ? teilnahme?.challenges[0] : teilnahme?.challenges;
      const wochenAnzahl = challenge?.wochen_anzahl ?? 8;
      let currentWeek = 1;
      if (challenge?.start_datum) {
        const start = new Date(challenge.start_datum);
        const days = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24));
        currentWeek = Math.min(wochenAnzahl, Math.max(1, Math.floor(days / 7) + 1));
      }

      setData({
        vorname: profile?.vorname ?? 'Du',
        challengeName: challenge?.name ?? null,
        currentWeek,
        wochenAnzahl,
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
          <p className="text-text-muted">Dashboard wird geladen …</p>
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
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Hallo, {data.vorname}!
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Hier ist deine Challenge-Übersicht — Woche {data.currentWeek} von {data.wochenAnzahl}.
          </p>
        </div>

        {/* 8-Wochen Challenge Übersicht */}
        <ChallengeWeeksOverview currentWeek={data.currentWeek} />
      </main>

      <SiteFooter />
    </div>
  );
}
