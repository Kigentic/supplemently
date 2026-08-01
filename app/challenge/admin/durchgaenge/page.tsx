'use client';

// Studio-Admin: neue Challenge-Durchgänge anlegen (Startdatum wählbar, immer
// fest 8 Wochen) und bestehende einsehen. "Durchgang" = ein konkreter Lauf
// einer Challenge mit Start-/Enddatum (siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

const inputBase =
  'w-full rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted ' +
  'outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30';
const labelBase = 'mb-1.5 block text-sm font-medium text-text';

interface Durchgang {
  id: string;
  name: string;
  challengeTypName: string | null;
  startDatum: string;
  endDatum: string;
  wochenAnzahl: number;
  istAktiv: boolean;
  istOffen: boolean;
}

interface ChallengeTypOption {
  id: string;
  name: string;
}

export default function DurchgaengePage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [studioId, setStudioId] = useState<string | null>(null);
  const [typen, setTypen] = useState<ChallengeTypOption[]>([]);
  const [durchgaenge, setDurchgaenge] = useState<Durchgang[] | null>(null);

  const [startDatum, setStartDatum] = useState('');
  const [challengeTypId, setChallengeTypId] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting'>('idle');
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
      setAccessToken(token);

      const { data: studioAdminRow } = await supabase
        .from('studio_admins')
        .select('studio_id')
        .eq('user_id', userData.user.id)
        .limit(1)
        .maybeSingle();

      const resolvedStudioId = (studioAdminRow as { studio_id: string } | null)?.studio_id ?? null;
      if (cancelled) return;

      if (!resolvedStudioId) {
        // Kein Studio zugeordnet — kein Zugriff auf diese Seite.
        router.push('/challenge/admin');
        return;
      }
      setStudioId(resolvedStudioId);

      const { data: buchungen } = await supabase
        .from('studio_challenge_typen')
        .select('challenge_typen ( id, name )')
        .eq('studio_id', resolvedStudioId);

      if (cancelled) return;
      const typenList = (buchungen ?? []).flatMap((b: any) => {
        const t = Array.isArray(b.challenge_typen) ? b.challenge_typen[0] : b.challenge_typen;
        return t ? [{ id: t.id as string, name: t.name as string }] : [];
      });
      setTypen(typenList);
      if (typenList.length === 1) setChallengeTypId(typenList[0].id);

      await loadDurchgaenge(token, resolvedStudioId);
      setChecked(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function loadDurchgaenge(token: string, sId: string) {
    const res = await fetch(`/api/studio/durchgaenge?studioId=${sId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      setDurchgaenge(json.durchgaenge ?? []);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!challengeTypId) {
      setError('Bitte einen Challenge-Typ auswählen.');
      return;
    }
    if (!startDatum) {
      setError('Bitte ein Startdatum wählen.');
      return;
    }
    if (!accessToken || !studioId) return;

    setStatus('submitting');
    try {
      const res = await fetch('/api/studio/durchgaenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ studioId, challengeTypId, startDatum }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json?.error ?? 'Durchgang konnte nicht angelegt werden.');
        setStatus('idle');
        return;
      }
      setStartDatum('');
      await loadDurchgaenge(accessToken, studioId);
      setStatus('idle');
    } catch {
      setError('Netzwerkfehler. Bitte erneut versuchen.');
      setStatus('idle');
    }
  }

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  if (!checked) {
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

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Studio-Admin</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Challenge-Durchgänge
          </h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            Ein Durchgang ist ein konkreter Lauf einer Challenge — du wählst den Starttermin, die
            Dauer ist immer fest 8 Wochen.
          </p>
          <Link
            href="/challenge/admin"
            className="mt-4 inline-block rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
          >
            ← Zurück zur Teilnehmer-Übersicht
          </Link>
        </div>

        <div className="mb-10 rounded-2xl border border-outline/50 bg-surface p-6">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-widest text-text-muted">
            Neuen Durchgang starten
          </h2>

          {typen.length === 0 ? (
            <p className="text-sm text-text-muted">
              Für dein Studio ist noch kein Challenge-Typ gebucht.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label htmlFor="challengeTyp" className={labelBase}>
                  Challenge-Typ
                </label>
                <select
                  id="challengeTyp"
                  className={inputBase}
                  value={challengeTypId}
                  onChange={(e) => setChallengeTypId(e.target.value)}
                >
                  {typen.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="startDatum" className={labelBase}>
                  Startdatum
                </label>
                <input
                  id="startDatum"
                  type="date"
                  className={inputBase}
                  value={startDatum}
                  onChange={(e) => setStartDatum(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="h-[50px] rounded-full bg-accent px-6 text-sm font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'submitting' ? 'Wird angelegt …' : 'Durchgang anlegen'}
              </button>
            </form>
          )}

          {error && (
            <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="overflow-x-auto rounded-2xl border border-outline/50">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-outline/50 bg-surface text-xs uppercase tracking-wide text-text-muted">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Zeitraum</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {durchgaenge && durchgaenge.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-text-muted">
                    Noch kein Durchgang angelegt.
                  </td>
                </tr>
              )}
              {(durchgaenge ?? []).map((d) => (
                <tr key={d.id} className="border-b border-outline/30 last:border-b-0">
                  <td className="px-4 py-3 font-medium text-text">{d.name}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDate(d.startDatum)} – {formatDate(d.endDatum)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.istOffen ? 'bg-accent/10 text-accent' : 'bg-outline/20 text-text-muted'
                      }`}
                    >
                      {d.istOffen ? 'Offen' : 'Geschlossen'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
