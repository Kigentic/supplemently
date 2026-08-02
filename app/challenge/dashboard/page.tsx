'use client';

// Studio-Dashboard: Rasteransicht der eigenen Challenge-Durchgänge inkl.
// Anmeldelink pro Durchgang (zum Teilen mit Interessenten) und Sprungmarken
// zur vollen Teilnehmerliste. Reine Mitglieder ohne Studio-Rolle werden zur
// persönlichen Wochenansicht weitergeleitet (siehe /challenge/wochenansicht,
// die früher unter dieser URL lag).
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import CoachWidget from '@/app/_components/CoachWidget';

interface Durchgang {
  id: string;
  name: string;
  challengeTypName: string | null;
  startDatum: string;
  endDatum: string;
  wochenAnzahl: number;
  istAktiv: boolean;
  istOffen: boolean;
  benoetigtFreischaltung: boolean;
  anmeldeLink: string;
}

export default function StudioDashboardPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [studioName, setStudioName] = useState<string | null>(null);
  const [durchgaenge, setDurchgaenge] = useState<Durchgang[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

      const { data: studioAdminRow } = await supabase
        .from('studio_admins')
        .select('studio_id, studios ( name )')
        .eq('user_id', userData.user.id)
        .limit(1)
        .maybeSingle();

      const resolvedStudioId = (studioAdminRow as { studio_id: string } | null)?.studio_id ?? null;
      if (cancelled) return;

      if (!resolvedStudioId) {
        // Kein Studio zugeordnet — das hier ist kein Studio-Admin, sondern ein
        // normales Mitglied. Für die ist die Wochenansicht relevant.
        router.push('/challenge/wochenansicht');
        return;
      }

      const studios = (studioAdminRow as any)?.studios;
      const studio = Array.isArray(studios) ? studios[0] : studios;
      setStudioName(studio?.name ?? null);

      const res = await fetch(`/api/studio/durchgaenge?studioId=${resolvedStudioId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (!cancelled) setDurchgaenge(json.durchgaenge ?? []);
      }
      if (!cancelled) setChecked(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function copyLink(d: Durchgang) {
    navigator.clipboard.writeText(d.anmeldeLink);
    setCopiedId(d.id);
    setTimeout(() => setCopiedId((cur) => (cur === d.id ? null : cur)), 2000);
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

      <main className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {studioName ?? 'Dein Studio'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
              Mitgliederübersicht
            </h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-text-muted">
              Deine Challenge-Durchgänge auf einen Blick. Anmeldelink kopieren und an Interessenten
              schicken — Registrierungen landen inaktiv im System, bis du sie nach Zahlungseingang
              freischaltest.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              href="/challenge/admin/durchgaenge"
              className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              + Neuer Durchgang
            </Link>
            <Link
              href="/challenge/admin"
              className="rounded-full border border-outline px-5 py-2.5 text-sm font-medium text-text transition hover:border-text"
            >
              Teilnehmerliste
            </Link>
          </div>
        </div>

        {!durchgaenge || durchgaenge.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline/60 bg-surface p-10 text-center">
            <p className="text-text-muted">
              Noch kein Durchgang angelegt. Leg deinen ersten Durchgang an, um einen Anmeldelink zu
              bekommen.
            </p>
            <Link
              href="/challenge/admin/durchgaenge"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              Durchgang anlegen
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {durchgaenge.map((d) => (
              <div key={d.id} className="flex flex-col justify-between rounded-2xl border border-outline/50 bg-surface p-5">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h2 className="font-semibold text-text">{d.name}</h2>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        d.istOffen ? 'bg-accent/10 text-accent' : 'bg-outline/20 text-text-muted'
                      }`}
                    >
                      {d.istOffen ? 'Offen' : 'Geschlossen'}
                    </span>
                  </div>
                  <p className="text-sm text-text-muted">
                    {formatDate(d.startDatum)} – {formatDate(d.endDatum)}
                  </p>
                  {d.challengeTypName && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-text-muted">{d.challengeTypName}</p>
                  )}
                  <p className="mt-4 text-sm text-text-muted">Mitglieder: —</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyLink(d)}
                  className="mt-5 w-full rounded-full border border-outline px-4 py-2.5 text-sm font-medium text-text transition hover:border-text"
                >
                  {copiedId === d.id ? 'Anmeldelink kopiert ✓' : 'Anmeldelink kopieren'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <SiteFooter />
      <CoachWidget />
    </div>
  );
}
