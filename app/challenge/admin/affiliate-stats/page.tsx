'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

interface ProduktStat {
  id: string;
  partner_name: string;
  produkt_name: string;
  kategorie: string;
  ist_aktiv: boolean;
  rabattcode: string | null;
  impressions: number;
  klicks: number;
  ctr: number;
}

interface TouchpointStat {
  kontext: string;
  label: string;
  impressions: number;
  klicks: number;
  ctr: number;
}

export default function AffiliateStatsPage() {
  const router = useRouter();
  const [produkte, setProdukte] = useState<ProduktStat[] | null>(null);
  const [touchpoints, setTouchpoints] = useState<TouchpointStat[]>([]);
  const [scope, setScope] = useState<'all' | 'studio' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = getBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push('/challenge/login');
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        router.push('/challenge/login');
        return;
      }

      const res = await fetch('/api/admin/affiliate-stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;

      if (res.status === 403) {
        router.push('/challenge/wochenansicht');
        return;
      }
      if (!res.ok) {
        setError('Statistik konnte nicht geladen werden.');
        setLoading(false);
        return;
      }

      const json = await res.json();
      setProdukte(json.produkte);
      setTouchpoints(json.touchpoints ?? []);
      setScope(json.scope ?? 'all');
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const gesamtImpressions = produkte?.reduce((s, p) => s + p.impressions, 0) ?? 0;
  const gesamtKlicks = produkte?.reduce((s, p) => s + p.klicks, 0) ?? 0;

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {scope === 'studio' ? 'Studio-Admin' : 'Masteradmin'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Affiliate-Statistik
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Gezeigt vs. geklickt, pro Produkt und pro Touchpoint
            {scope === 'studio' ? ' — nur für dein Studio.' : '.'}
          </p>
          <Link
            href="/challenge/admin"
            className="mt-4 inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
          >
            ← Zurück zur Teilnehmer-Übersicht
          </Link>
        </div>

        {loading && <p className="text-text-muted">Wird geladen …</p>}
        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {produkte && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-outline/50 bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Gezeigt gesamt</p>
                <p className="mt-1 text-2xl font-semibold text-text">{gesamtImpressions}</p>
              </div>
              <div className="rounded-2xl border border-outline/50 bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Geklickt gesamt</p>
                <p className="mt-1 text-2xl font-semibold text-text">{gesamtKlicks}</p>
              </div>
              <div className="rounded-2xl border border-outline/50 bg-surface p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">CTR gesamt</p>
                <p className="mt-1 text-2xl font-semibold text-text">
                  {gesamtImpressions > 0 ? Math.round((gesamtKlicks / gesamtImpressions) * 1000) / 10 : 0}%
                </p>
              </div>
            </div>

            {touchpoints.length > 0 && (
              <div className="mb-10 overflow-x-auto rounded-2xl border border-outline/50">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-outline/50 bg-surface text-xs uppercase tracking-wide text-text-muted">
                      <th className="px-4 py-3 font-medium">Touchpoint</th>
                      <th className="px-4 py-3 font-medium text-right">Gezeigt</th>
                      <th className="px-4 py-3 font-medium text-right">Geklickt</th>
                      <th className="px-4 py-3 font-medium text-right">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {touchpoints.map((t) => (
                      <tr key={t.kontext} className="border-b border-outline/30 last:border-b-0">
                        <td className="px-4 py-3 font-medium text-text">{t.label}</td>
                        <td className="px-4 py-3 text-right text-text-muted">{t.impressions}</td>
                        <td className="px-4 py-3 text-right text-text-muted">{t.klicks}</td>
                        <td className="px-4 py-3 text-right font-medium text-text">{t.ctr}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-outline/50">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-outline/50 bg-surface text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-4 py-3 font-medium">Partner</th>
                    <th className="px-4 py-3 font-medium">Produkt</th>
                    <th className="px-4 py-3 font-medium">Code</th>
                    <th className="px-4 py-3 font-medium text-right">Gezeigt</th>
                    <th className="px-4 py-3 font-medium text-right">Geklickt</th>
                    <th className="px-4 py-3 font-medium text-right">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {produkte
                    .slice()
                    .sort((a, b) => b.klicks - a.klicks)
                    .map((p) => (
                      <tr key={p.id} className="border-b border-outline/30 last:border-b-0">
                        <td className="px-4 py-3 font-medium text-text">{p.partner_name}</td>
                        <td className="px-4 py-3 text-text-muted">{p.produkt_name}</td>
                        <td className="px-4 py-3 text-text-muted">{p.rabattcode ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-text-muted">{p.impressions}</td>
                        <td className="px-4 py-3 text-right text-text-muted">{p.klicks}</td>
                        <td className="px-4 py-3 text-right font-medium text-text">{p.ctr}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
