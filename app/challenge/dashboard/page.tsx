'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

// ── Wochen-Accordion ──────────────────────────────────────────────────────────

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WeekAccordionItem({
  woche,
  status,
  open,
  onToggle,
}: {
  woche: number;
  status: 'vergangen' | 'aktuell' | 'kommend';
  open: boolean;
  onToggle: () => void;
}) {
  const statusLabel = { vergangen: 'Abgeschlossen', aktuell: 'Diese Woche', kommend: 'Bald' }[status];
  const statusStyle = {
    vergangen: 'bg-outline/30 text-text-muted',
    aktuell: 'bg-accent/10 text-accent',
    kommend: 'bg-outline/20 text-text-muted',
  }[status];

  return (
    <div className="border-b border-outline/40 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <div className="flex items-center gap-3.5">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
              status === 'aktuell' ? 'bg-accent text-on-accent' : 'bg-outline/30 text-text-muted'
            }`}
          >
            {woche}
          </span>
          <span className="font-semibold text-text">Woche {woche}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>{statusLabel}</span>
        </div>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="pb-6 pl-12 pr-4 text-sm leading-relaxed text-text-muted">
          {status === 'kommend'
            ? 'Deine Aufgaben für diese Woche werden montags freigeschaltet, sobald es soweit ist.'
            : status === 'aktuell'
              ? 'Deine Aufgaben für diese Woche folgen in Kürze.'
              : 'Rückblick für diese Woche folgt in Kürze.'}
        </div>
      )}
    </div>
  );
}

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
  const [openWeek, setOpenWeek] = useState<number | null>(null);

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
      setOpenWeek(currentWeek);
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
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Dashboard wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

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

        {/* Wochen-Accordion */}
        <div className="rounded-2xl bg-surface px-6">
          {Array.from({ length: data.wochenAnzahl }, (_, i) => i + 1).map((woche) => (
            <WeekAccordionItem
              key={woche}
              woche={woche}
              status={woche < data.currentWeek ? 'vergangen' : woche === data.currentWeek ? 'aktuell' : 'kommend'}
              open={openWeek === woche}
              onToggle={() => setOpenWeek((w) => (w === woche ? null : woche))}
            />
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
