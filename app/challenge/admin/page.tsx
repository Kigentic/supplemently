'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import { CHECKIN_BASISPUNKTE } from '@/lib/challengeScoring';
import CoachWidget from '@/app/_components/CoachWidget';

interface AdminUser {
  id: string;
  teilnahme_id: string | null;
  vorname: string;
  nachname: string;
  email: string;
  ist_admin: boolean;
  created_at: string;
  challenge_name: string | null;
  status: string | null;
  gesamt_score: number;
  max_score: number;
  note_wert: 1 | 2 | 3 | 4 | null;
  note_label: string | null;
}

interface HabitBreakdown {
  text: string;
  ampel: 'gruen' | 'gelb' | 'rot' | null;
  punkte: number;
}

interface WeekBreakdown {
  weekNum: number;
  theme: string;
  items: HabitBreakdown[];
}

interface CheckinBreakdown {
  woche: number;
  scoreWoche: number;
  maxScoreWoche: number;
  note: { wert: 1 | 2 | 3 | 4; label: string };
  wohlbefinden: number;
  schwierigkeit: number;
  erfolgFreitext: string | null;
  gruppen: WeekBreakdown[];
}

const NOTE_STYLE: Record<1 | 2 | 3 | 4, string> = {
  1: 'bg-emerald-500/10 text-emerald-700',
  2: 'bg-lime-500/10 text-lime-700',
  3: 'bg-amber-400/10 text-amber-700',
  4: 'bg-orange-400/10 text-orange-700',
};

const AMPEL_STYLE: Record<'gruen' | 'gelb' | 'rot', { dot: string; label: string }> = {
  gruen: { dot: 'bg-emerald-500', label: 'Komplett' },
  gelb: { dot: 'bg-amber-400', label: 'Teilweise' },
  rot: { dot: 'bg-red-400', label: 'Gar nicht' },
};

function NoteBadge({ wert, label }: { wert: 1 | 2 | 3 | 4; label: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${NOTE_STYLE[wert]}`}>
      {wert} · {label}
    </span>
  );
}

const STATUS_LABEL: Record<string, string> = {
  pre_registered: 'Registriert',
  aktiv: 'Aktiv',
  abgeschlossen: 'Abgeschlossen',
  abgebrochen: 'Abgebrochen',
};

const STATUS_STYLE: Record<string, string> = {
  pre_registered: 'bg-outline/20 text-text-muted',
  aktiv: 'bg-accent/10 text-accent',
  abgeschlossen: 'bg-emerald-500/10 text-emerald-700',
  abgebrochen: 'bg-red-400/10 text-red-600',
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [scope, setScope] = useState<'all' | 'studio' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<CheckinBreakdown[] | null>(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);
  const [freischaltenLoading, setFreischaltenLoading] = useState<string | null>(null);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);

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
      setAccessToken(token);

      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (cancelled) return;

      if (res.status === 403) {
        router.push('/challenge/wochenansicht');
        return;
      }
      if (!res.ok) {
        setError('User konnten nicht geladen werden.');
        setLoading(false);
        return;
      }

      const json = await res.json();
      setUsers(json.users);
      setScope(json.scope ?? 'all');
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function toggleDetails(u: AdminUser) {
    if (!u.teilnahme_id) return;

    if (expandedUserId === u.id) {
      setExpandedUserId(null);
      setBreakdown(null);
      return;
    }

    setExpandedUserId(u.id);
    setBreakdown(null);
    setBreakdownError(null);
    setBreakdownLoading(true);

    try {
      const res = await fetch(`/api/admin/teilnahme/${u.teilnahme_id}/checkins`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBreakdownError(json?.error || 'Check-ins konnten nicht geladen werden.');
        setBreakdownLoading(false);
        return;
      }
      setBreakdown(json.wochen);
      setBreakdownLoading(false);
    } catch {
      setBreakdownError('Server nicht erreichbar.');
      setBreakdownLoading(false);
    }
  }

  async function onFreischalten(u: AdminUser) {
    if (!u.teilnahme_id || !accessToken) return;
    setFreischaltenLoading(u.id);
    try {
      const res = await fetch(`/api/admin/teilnahme/${u.teilnahme_id}/freischalten`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, status: 'aktiv' } : x)) ?? prev);
      }
    } finally {
      setFreischaltenLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-5xl px-5 py-24 text-center">
          <p className="text-text-muted">Admin-Dashboard wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {scope === 'studio' ? 'Studio-Admin' : 'Masteradmin'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {scope === 'studio' ? 'Teilnehmer deines Studios' : 'Alle Teilnehmer'}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            {users
              ? `${users.length} ${scope === 'studio' ? 'Teilnehmer in deinem Studio.' : 'registrierte User.'}`
              : ''}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {scope !== 'studio' && (
              <Link
                href="/challenge/admin/checkin-test"
                className="inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
              >
                Check-in-Fragen testen →
              </Link>
            )}
            <Link
              href="/challenge/admin/affiliate-stats"
              className="inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
            >
              Affiliate-Statistik →
            </Link>
            <Link
              href="/challenge/admin/durchgaenge"
              className="inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
            >
              Challenge-Durchgänge →
            </Link>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {users && (
          <div className="overflow-x-auto rounded-2xl border border-outline/50">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline/50 bg-surface text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">E-Mail</th>
                  <th className="px-4 py-3 font-medium">Challenge</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium">Registriert</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <Fragment key={u.id}>
                    <tr className="border-b border-outline/30 last:border-b-0">
                      <td className="px-4 py-3 font-medium text-text">
                        {u.vorname} {u.nachname}
                        {u.ist_admin && (
                          <span className="ml-2 rounded-full bg-text/10 px-2 py-0.5 text-[10px] font-semibold text-text-muted">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">{u.email}</td>
                      <td className="px-4 py-3 text-text-muted">{u.challenge_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {u.status ? (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[u.status] ?? 'bg-outline/20 text-text-muted'}`}>
                            {STATUS_LABEL[u.status] ?? u.status}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-text">
                        {u.gesamt_score}
                        {u.max_score > 0 && <span className="text-text-muted"> / {u.max_score}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {u.note_wert ? (
                          <NoteBadge wert={u.note_wert} label={u.note_label ?? ''} />
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(u.created_at).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-3">
                          {u.status === 'pre_registered' && (
                            <button
                              type="button"
                              onClick={() => onFreischalten(u)}
                              disabled={freischaltenLoading === u.id}
                              className="whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {freischaltenLoading === u.id ? 'Wird freigeschaltet …' : 'Freischalten'}
                            </button>
                          )}
                          {u.teilnahme_id && (
                            <button
                              type="button"
                              onClick={() => toggleDetails(u)}
                              className="whitespace-nowrap text-xs font-medium text-accent hover:underline"
                            >
                              {expandedUserId === u.id ? 'Schließen ▴' : 'Aufgaben ▾'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedUserId === u.id && (
                      <tr className="border-b border-outline/30 bg-surface/60">
                        <td colSpan={8} className="px-4 py-4">
                          {breakdownLoading && <p className="text-sm text-text-muted">Wird geladen …</p>}
                          {breakdownError && (
                            <p className="text-sm text-red-600">{breakdownError}</p>
                          )}
                          {breakdown && breakdown.length === 0 && (
                            <p className="text-sm text-text-muted">Noch keine Check-ins abgegeben.</p>
                          )}
                          {breakdown && breakdown.length > 0 && (
                            <div className="space-y-5">
                              {breakdown.map((c) => (
                                <div key={c.woche} className="rounded-xl border border-outline/40 bg-bg p-4">
                                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="font-semibold text-text">Woche {c.woche}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-text">
                                        {c.scoreWoche} / {c.maxScoreWoche} Punkte
                                      </span>
                                      <NoteBadge wert={c.note.wert} label={c.note.label} />
                                    </div>
                                  </div>

                                  <div className="space-y-3">
                                    {c.gruppen.map((g) => (
                                      <div key={g.weekNum}>
                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-muted">
                                          Woche {g.weekNum} · {g.theme}
                                        </p>
                                        <ul className="space-y-1">
                                          {g.items.map((item, idx) => (
                                            <li
                                              key={idx}
                                              className="flex items-center justify-between gap-3 text-sm"
                                            >
                                              <span className="flex items-center gap-2 text-text-muted">
                                                {item.ampel && (
                                                  <span
                                                    className={`h-2 w-2 shrink-0 rounded-full ${AMPEL_STYLE[item.ampel].dot}`}
                                                  />
                                                )}
                                                {item.text}
                                              </span>
                                              <span className="shrink-0 whitespace-nowrap font-medium text-text">
                                                {item.ampel ? AMPEL_STYLE[item.ampel].label : '—'} · +{item.punkte}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </div>

                                  <p className="mt-3 border-t border-outline/30 pt-2 text-xs text-text-muted">
                                    Basispunkte fürs Einreichen: +{CHECKIN_BASISPUNKTE}. Wohlbefinden {c.wohlbefinden}/10 ·
                                    Schwierigkeit {c.schwierigkeit}/10
                                    {c.erfolgFreitext && <> · &quot;{c.erfolgFreitext}&quot;</>}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <SiteFooter />
      <CoachWidget />
    </div>
  );
}
