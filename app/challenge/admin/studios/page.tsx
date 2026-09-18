'use client';

// Masteradmin: Top-Level-Übersicht aller registrierten Studios. Von hier aus
// per Klick in die Teilnehmer-Liste eines einzelnen Studios (siehe
// [studioId]/page.tsx). Getrennt von /challenge/admin (das listet Teilnehmer
// flach über alle Studios), weil das bei vielen Studios unübersichtlich wird.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

interface Studio {
  id: string;
  name: string;
  slug: string;
  kontaktEmail: string | null;
  gesperrt: boolean;
  createdAt: string;
  durchgaengeAnzahl: number;
  teilnehmerAnzahl: number;
}

export default function StudiosAdminPage() {
  const router = useRouter();
  const [studios, setStudios] = useState<Studio[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

      const res = await fetch('/api/admin/studios', { headers: { Authorization: `Bearer ${token}` } });
      if (cancelled) return;

      if (res.status === 403) {
        router.push('/challenge/admin');
        return;
      }
      if (!res.ok) {
        setError('Studios konnten nicht geladen werden.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setStudios(json.studios);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onToggleSperren(studio: Studio) {
    if (!accessToken) return;
    const action = studio.gesperrt ? 'freischalten' : 'sperren';
    if (action === 'sperren') {
      const confirmed = window.confirm(
        `${studio.name} wirklich sperren? Alle laufenden Teilnehmer (auch bereits aktive) verlieren sofort den Zugriff, bis du wieder entsperrst.`
      );
      if (!confirmed) return;
    }
    setActionLoading(studio.id);
    try {
      const res = await fetch(`/api/admin/studios/${studio.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error ?? 'Aktion fehlgeschlagen.');
        return;
      }
      setStudios((prev) => prev?.map((s) => (s.id === studio.id ? { ...s, gesperrt: json.gesperrt } : s)) ?? prev);
    } finally {
      setActionLoading(null);
    }
  }

  async function onDelete(studio: Studio) {
    if (!accessToken) return;
    const input = window.prompt(
      `"${studio.name}" (${studio.teilnehmerAnzahl} Teilnehmer, ${studio.durchgaengeAnzahl} Durchgänge) wirklich unwiderruflich löschen — inklusive ALLER Teilnehmer-Accounts?\n\nTippe zur Bestätigung den Studionamen ein:`
    );
    if (input !== studio.name) {
      if (input !== null) alert('Name stimmt nicht überein — abgebrochen.');
      return;
    }
    setActionLoading(studio.id);
    try {
      const res = await fetch(`/api/admin/studios/${studio.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(json?.error ?? 'Löschen fehlgeschlagen.');
        return;
      }
      setStudios((prev) => prev?.filter((s) => s.id !== studio.id) ?? prev);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader loggedIn />
        <main className="mx-auto max-w-5xl px-5 py-24 text-center">
          <p className="text-text-muted">Studios werden geladen …</p>
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
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">Studios</h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            {studios ? `${studios.length} registrierte Studios.` : ''}
          </p>
          <div className="mt-4">
            <Link
              href="/challenge/admin"
              className="inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
            >
              ← Alle Teilnehmer
            </Link>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {studios && studios.length === 0 && (
          <p className="rounded-xl border border-outline/40 bg-surface p-6 text-center text-text-muted">
            Noch keine Studios registriert.
          </p>
        )}

        {studios && studios.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-outline/50">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-outline/50 bg-surface text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-3 font-medium">Studio</th>
                  <th className="px-4 py-3 font-medium">Kontakt</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Durchgänge</th>
                  <th className="px-4 py-3 font-medium text-right">Teilnehmer</th>
                  <th className="px-4 py-3 font-medium">Seit</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {studios.map((s) => (
                  <tr key={s.id} className="border-b border-outline/30 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-text">
                      {s.name}
                      <span className="ml-2 text-xs text-text-muted">/{s.slug}</span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{s.kontaktEmail ?? '—'}</td>
                    <td className="px-4 py-3">
                      {s.gesperrt ? (
                        <span className="rounded-full bg-red-400/10 px-2.5 py-0.5 text-xs font-medium text-red-600">
                          Gesperrt
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                          Aktiv
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-text-muted">{s.durchgaengeAnzahl}</td>
                    <td className="px-4 py-3 text-right text-text-muted">{s.teilnehmerAnzahl}</td>
                    <td className="px-4 py-3 text-text-muted">{new Date(s.createdAt).toLocaleDateString('de-DE')}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={`/challenge/admin/studios/${s.id}`}
                          className="whitespace-nowrap text-xs font-medium text-accent hover:underline"
                        >
                          Teilnehmer →
                        </Link>
                        <button
                          type="button"
                          onClick={() => onToggleSperren(s)}
                          disabled={actionLoading === s.id}
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            s.gesperrt
                              ? 'bg-accent text-on-accent hover:bg-accent-hover'
                              : 'border border-outline text-text hover:border-text'
                          }`}
                        >
                          {actionLoading === s.id ? '…' : s.gesperrt ? 'Freischalten' : 'Sperren'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(s)}
                          disabled={actionLoading === s.id}
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
