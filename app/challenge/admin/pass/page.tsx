'use client';

// Studio-Check-in: QR-Code vom Challenge-Pass scannen (öffnet diese Seite
// direkt mit ?tid=...) oder Code manuell eingeben. Zeigt das vorausgefüllte
// Profil und schaltet mit einem Klick frei — ruft dieselbe Freischalten-
// Route wie die Teilnehmerliste in app/challenge/admin/page.tsx auf.
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import { getBrowserClient } from '@/lib/supabaseBrowser';

interface TeilnahmeInfo {
  id: string;
  status: string;
  reserviertBis: string | null;
  vorname: string | null;
  nachname: string | null;
  email: string | null;
  challengeName: string | null;
  studioName: string | null;
  trainingsplanGewuenscht: boolean | null;
  trainingsplanFokus: string | null;
  trainingsplanOrt: string | null;
}

const FOKUS_LABEL: Record<string, string> = {
  kein: 'Kein spezieller Fokus',
  ruecken: 'Rücken & Haltung',
  beine_po: 'Beine & Po',
  bauch_core: 'Bauch & Core',
  fatburn: 'Fatburn',
};
const ORT_LABEL: Record<string, string> = { studio: 'Im Studio', zuhause: 'Zuhause' };

function CodeEingabe({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = useState('');
  return (
    <div className="rounded-2xl bg-surface p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-text">Code manuell eingeben</h2>
      <p className="mt-1.5 text-sm text-text-muted">
        Falls der QR-Code nicht gescannt werden kann: Teilnahme-Code aus dem Challenge-Pass eintragen.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) onSubmit(code.trim());
        }}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="z.B. 3ef0b2bc-..."
          className="flex-1 rounded-lg border border-outline bg-bg px-4 py-3 text-text placeholder:text-text-muted outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
        >
          Suchen
        </button>
      </form>
    </div>
  );
}

function PassAnsicht({ tid }: { tid: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<TeilnahmeInfo | null>(null);
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const { data: sessionData } = await getBrowserClient().auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        router.push('/challenge/login');
        return;
      }
      try {
        const res = await fetch(`/api/admin/teilnahme/${tid}`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data?.error ?? 'Teilnahme nicht gefunden.');
        } else {
          setInfo(data);
        }
      } catch {
        if (!cancelled) setError('Server nicht erreichbar.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [tid, router]);

  async function onActivate() {
    setActivating(true);
    setError(null);
    const { data: sessionData } = await getBrowserClient().auth.getSession();
    const token = sessionData.session?.access_token;
    try {
      const res = await fetch(`/api/admin/teilnahme/${tid}/freischalten`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? 'Freischalten fehlgeschlagen.');
        setActivating(false);
        return;
      }
      setActivated(true);
    } catch {
      setError('Server nicht erreichbar.');
    } finally {
      setActivating(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl bg-surface p-8 text-center text-sm text-text-muted">Lädt …</div>;
  }
  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700" role="alert">
        {error}
      </div>
    );
  }
  if (!info) return null;

  const name = [info.vorname, info.nachname].filter(Boolean).join(' ') || 'Unbekannt';
  const bereitsAktiv = info.status === 'aktiv';

  return (
    <div className="rounded-2xl bg-surface p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-accent">
        {info.challengeName ?? 'Challenge'} · {info.studioName ?? ''}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-text">{name}</h2>
      <p className="mt-1 text-sm text-text-muted">{info.email}</p>

      {info.trainingsplanGewuenscht && (
        <div className="mt-5 flex flex-wrap gap-2">
          {info.trainingsplanOrt && (
            <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text">
              {ORT_LABEL[info.trainingsplanOrt] ?? info.trainingsplanOrt}
            </span>
          )}
          {info.trainingsplanFokus && (
            <span className="rounded-full bg-bg px-3 py-1 text-xs font-medium text-text">
              {FOKUS_LABEL[info.trainingsplanFokus] ?? info.trainingsplanFokus}
            </span>
          )}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-outline/40 bg-bg p-4">
        <p className="text-sm font-medium text-text">
          Status:{' '}
          <span className={bereitsAktiv || activated ? 'text-green-600' : 'text-accent'}>
            {bereitsAktiv || activated ? 'Aktiv' : 'Reserviert — wartet auf Freischaltung'}
          </span>
        </p>
        {info.reserviertBis && !bereitsAktiv && !activated && (
          <p className="mt-1 text-xs text-text-muted">Reservierung gültig bis {new Date(info.reserviertBis).toLocaleString('de-DE')}</p>
        )}
      </div>

      {!bereitsAktiv && !activated && (
        <button
          type="button"
          onClick={onActivate}
          disabled={activating}
          className="mt-6 w-full rounded-full bg-accent px-7 py-4 text-base font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {activating ? 'Wird freigeschaltet …' : 'Jetzt freischalten'}
        </button>
      )}
      {(bereitsAktiv || activated) && (
        <div className="mt-6 rounded-xl bg-green-50 p-4 text-center text-sm font-medium text-green-700">
          ✓ Teilnahme ist aktiv — die Challenge kann losgehen.
        </div>
      )}
    </div>
  );
}

function PassPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tid = searchParams.get('tid');

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-xl px-5 py-16 sm:py-20">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Studio-Check-in</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">Challenge-Pass aktivieren</h1>
          <p className="mt-3 text-base leading-relaxed text-text-muted">
            QR-Code des Mitglieds gescannt oder Code eingegeben — Profil erscheint direkt, ein Klick aktiviert die Teilnahme.
          </p>
        </div>

        {tid ? (
          <PassAnsicht tid={tid} />
        ) : (
          <CodeEingabe onSubmit={(code) => router.push(`/challenge/admin/pass?tid=${encodeURIComponent(code)}`)} />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

export default function PassPage() {
  return (
    <Suspense fallback={null}>
      <PassPageInner />
    </Suspense>
  );
}
