'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

interface AdminUser {
  id: string;
  vorname: string;
  nachname: string;
  email: string;
  ist_admin: boolean;
  created_at: string;
  challenge_name: string | null;
  status: string | null;
  gesamt_score: number;
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
      const accessToken = sessionData.session?.access_token;
      if (!accessToken) {
        router.push('/challenge/login');
        return;
      }

      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (cancelled) return;

      if (res.status === 403) {
        router.push('/challenge/dashboard');
        return;
      }
      if (!res.ok) {
        setError('User konnten nicht geladen werden.');
        setLoading(false);
        return;
      }

      const json = await res.json();
      setUsers(json.users);
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Masteradmin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Alle Teilnehmer
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            {users ? `${users.length} registrierte User.` : ''}
          </p>
          <Link
            href="/challenge/admin/checkin-test"
            className="mt-4 inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
          >
            Check-in-Fragen testen →
          </Link>
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
                  <th className="px-4 py-3 font-medium">Registriert</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-outline/30 last:border-b-0">
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
                    <td className="px-4 py-3 text-right font-medium text-text">{u.gesamt_score}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {new Date(u.created_at).toLocaleDateString('de-DE')}
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
