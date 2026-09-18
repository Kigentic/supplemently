'use client';

// Masteradmin: Teilnehmer EINES Studios (Drilldown von /challenge/admin/studios).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

interface Teilnehmer {
  teilnahmeId: string;
  userId: string;
  vorname: string;
  nachname: string;
  email: string;
  challengeName: string | null;
  status: string;
  gesamtScore: number;
  joinedAt: string;
}

const STATUS_LABEL: Record<string, string> = {
  pre_registered: 'Registriert',
  aktiv: 'Aktiv',
  abgeschlossen: 'Abgeschlossen',
  abgebrochen: 'Abgebrochen',
  gesperrt: 'Gesperrt',
};

const STATUS_STYLE: Record<string, string> = {
  pre_registered: 'bg-outline/20 text-text-muted',
  aktiv: 'bg-accent/10 text-accent',
  abgeschlossen: 'bg-emerald-500/10 text-emerald-700',
  abgebrochen: 'bg-red-400/10 text-red-600',
  gesperrt: 'bg-red-500/10 text-red-600',
};

export default function StudioTeilnehmerPage() {
  const router = useRouter();
  const params = useParams<{ studioId: string }>();
  const [studioName, setStudioName] = useState<string | null>(null);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!params?.studioId) return;
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

      const res = await fetch(`/api/admin/studios/${params.studioId}/teilnehmer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;

      if (res.status === 403) {
        router.push('/challenge/admin');
        return;
      }
      if (!res.ok) {
        setError('Teilnehmer konnten nicht geladen werden.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setStudioName(json.studioName);
      setTeilnehmer(json.teilnehmer);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params?.studioId, router]);

  async function onFreischalten(t: Teilnehmer) {
    if (!accessToken) return;
    setActionLoading(t.teilnahmeId);
    try {
      const res = await fetch(`/api/admin/teilnahme/${t.teilnahmeId}/freischalten`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setTeilnehmer((prev) => prev?.map((x) => (x.teilnahmeId === t.teilnahmeId ? { ...x, status: 'aktiv' } : x)) ?? prev);
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function onSperren(t: Teilnehmer) {
    if (!accessToken) return;
    const confirmed = window.confirm(`${t.vorname} ${t.nachname} sperren? Zugang zur Challenge wird sofort entzogen.`);
    if (!confirmed) return;
    setActionLoading(t.teilnahmeId);
    try {
      const res = await fetch(`/api/admin/teilnahme/${t.teilnahmeId}/sperren`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error ?? 'Sperren fehlgeschlagen.');
        return;
      }
      setTeilnehmer((prev) => prev?.map((x) => (x.teilnahmeId === t.teilnahmeId ? { ...x, status: 'gesperrt' } : x)) ?? prev);
    } finally {
      setActionLoading(null);
    }
  }

  async function onDelete(t: Teilnehmer) {
    if (!accessToken) return;
    const confirmed = window.confirm(
      `${t.vorname} ${t.nachname} (${t.email}) wirklich unwiderruflich löschen? Alle Challenge-Daten gehen dabei verloren.`
    );
    if (!confirmed) return;
    setActionLoading(t.teilnahmeId);
    try {
      const res = await fetch(`/api/admin/users/${t.userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error ?? 'Löschen fehlgeschlagen.');
        return;
      }
      setTeilnehmer((prev) => prev?.filter((x) => x.teilnahmeId !== t.teilnahmeId) ?? prev);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-5xl px-5 py-24 text-center">
          <p className="text-text-muted">Teilnehmer werden geladen …</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Masteradmin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            {studioName ?? 'Studio'}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            {teilnehmer ? `${teilnehmer.length} Teilnehmer.` : ''}
          </p>
          <div className="mt-4">
            <Link
              href="/challenge/admin/studios"
              className="inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
            >
              ← Alle Studios
            </Link>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {teilnehmer && teilnehmer.length === 0 && (
          <p className="rounded-xl border border-outline/40 bg-surface p-6 text-center text-text-muted">
            Noch keine Teilnehmer in diesem Studio.
          </p>
        )}

        {teilnehmer && teilnehmer.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-outline/50">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline/50 bg-surface text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">E-Mail</th>
                  <th className="px-4 py-3 font-medium">Challenge</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Score</th>
                  <th className="px-4 py-3 font-medium">Registriert</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {teilnehmer.map((t) => (
                  <tr key={t.teilnahmeId} className="border-b border-outline/30 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-text">{t.vorname} {t.nachname}</td>
                    <td className="px-4 py-3 text-text-muted">{t.email}</td>
                    <td className="px-4 py-3 text-text-muted">{t.challengeName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[t.status] ?? 'bg-outline/20 text-text-muted'}`}>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-text">{t.gesamtScore}</td>
                    <td className="px-4 py-3 text-text-muted">{new Date(t.joinedAt).toLocaleDateString('de-DE')}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {t.status !== 'aktiv' && (
                          <button
                            type="button"
                            onClick={() => onFreischalten(t)}
                            disabled={actionLoading === t.teilnahmeId}
                            className="whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Freischalten
                          </button>
                        )}
                        {t.status !== 'gesperrt' && (
                          <button
                            type="button"
                            onClick={() => onSperren(t)}
                            disabled={actionLoading === t.teilnahmeId}
                            className="whitespace-nowrap rounded-full border border-outline px-3 py-1.5 text-xs font-semibold text-text transition hover:border-text disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Sperren
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDelete(t)}
                          disabled={actionLoading === t.teilnahmeId}
                          className="whitespace-nowrap rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
