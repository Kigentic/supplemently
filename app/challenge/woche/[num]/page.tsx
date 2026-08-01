'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { fetchChallengeWeeks, fetchChallengeTypIdBySlug, LONGEVITY_CHALLENGE_TYP_SLUG, ICON_MAP, type ChallengeWeek } from '@/lib/challengeWeeks';
import AnleitungLink from '@/app/_components/AnleitungModal';
import AffiliateProductCard, { type AffiliateProduct } from '@/app/_components/AffiliateProductCard';

export default function WochenDetailPage() {
  const params = useParams<{ num: string }>();
  const router = useRouter();
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [weeksLoading, setWeeksLoading] = useState(true);
  const [weeks, setWeeks] = useState<ChallengeWeek[]>([]);
  const [empfehlungen, setEmpfehlungen] = useState<AffiliateProduct[]>([]);

  useEffect(() => {
    getBrowserClient()
      .auth.getUser()
      .then(async ({ data }) => {
        if (!data.user) {
          router.push('/challenge/login');
          return;
        }
        setCheckedAuth(true);

        const supabase = getBrowserClient();
        const challengeTypId = await fetchChallengeTypIdBySlug(supabase, LONGEVITY_CHALLENGE_TYP_SLUG);
        if (challengeTypId) {
          setWeeks(await fetchChallengeWeeks(supabase, challengeTypId));
        }
        setWeeksLoading(false);

        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) return;
        const res = await fetch(`/api/challenge/woche/${params?.num}/empfehlung`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setEmpfehlungen(json.empfehlungen ?? []);
        }
      });
  }, [router, params?.num]);

  const num = Number(params?.num);
  const week = weeks.find((w) => w.num === num);

  if (!checkedAuth || weeksLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!week) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="text-2xl font-semibold text-text">Woche nicht gefunden.</h1>
          <Link href="/challenge/wochenansicht" className="mt-6 inline-block text-accent hover:underline">
            Zurück zum Dashboard
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const Icon = ICON_MAP[week.icon_name];

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <Link href="/challenge/wochenansicht" className="text-sm text-text-muted hover:text-text">
          ← Zurück zum Dashboard
        </Link>

        {/* Wochen-Header */}
        <div
          className="mt-6 flex items-center gap-3 rounded-xl px-5 py-4"
          style={{ backgroundColor: week.color }}
        >
          <Icon size={22} stroke={1.75} color={week.textColor} aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: week.textColor }}>
              Woche {week.num}
            </p>
            <p className="text-lg font-semibold" style={{ color: week.textColor }}>
              {week.theme}
            </p>
          </div>
        </div>

        <p className="mt-4 text-base italic leading-relaxed text-text-muted">{week.motto}</p>

        <h1 className="mt-10 text-2xl font-semibold tracking-tight text-text">
          Warum diese Aufgaben wichtig sind
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Jede Gewohnheit dieser Woche hat einen konkreten Grund — kein Selbstzweck, sondern messbarer
          Effekt auf Gesundheit, Energie oder Fortschritt.
        </p>

        <div className="mt-8 space-y-4">
          {week.habits.map((habit, i) => (
            <div key={habit.text} className="rounded-2xl bg-surface p-6">
              <div className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: week.color, color: week.textColor }}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-text">{habit.text}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{habit.why}</p>
                  {habit.anleitungVarianten && (
                    <div className="mt-3">
                      <AnleitungLink varianten={habit.anleitungVarianten} contextWeek={week.num} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {empfehlungen.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold text-text">Passt zu dieser Woche</h2>
            {empfehlungen.map((p) => (
              <AffiliateProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/challenge/wochenansicht"
            className="inline-block rounded-full bg-accent px-8 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
