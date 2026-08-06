'use client';

// Persönliche Supplement-Empfehlung aus dem Onboarding-Fragebogen —
// verlinkt von der Wochenansicht ("Deine Supplement-Empfehlung"-Karte).
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import SupplementEmpfehlungenListe, { buildInsights } from '@/app/_components/SupplementEmpfehlungen';
import { getBrowserClient } from '@/lib/supabaseBrowser';
import type { MatchResult } from '@/lib/matching';
import type { Answers } from '@/lib/questions';

export default function SupplementePage() {
  const router = useRouter();
  const [ergebnis, setErgebnis] = useState<MatchResult | null>(null);
  const [antworten, setAntworten] = useState<Answers | null>(null);
  const [loading, setLoading] = useState(true);

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

      const res = await fetch('/api/challenge/supplement-empfehlung', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (cancelled) return;

      if (res.ok) {
        const json = await res.json();
        setErgebnis(json.ergebnis);
        setAntworten(json.antworten);
      }
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
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const insights = antworten ? buildInsights(antworten) : [];

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader loggedIn />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Deine Auswertung
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Deine Supplement-Empfehlung
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            Basierend auf deinen Angaben im Onboarding-Fragebogen.
          </p>

          {insights.length > 0 && (
            <ul className="mt-5 space-y-2">
              {insights.map((ins, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-text-muted">
                  <span className="mt-0.5 flex-shrink-0 text-accent">→</span>
                  <span>{ins}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {ergebnis ? (
          <>
            <SupplementEmpfehlungenListe ergebnis={ergebnis} />
            <div className="mt-10 rounded-xl border border-outline/50 bg-surface px-5 py-4">
              <p className="text-xs leading-relaxed text-text-muted">{ergebnis.disclaimer}</p>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-outline/60 bg-surface p-8 text-center">
            <p className="text-text-muted">
              Noch keine Empfehlung vorhanden — fülle zuerst den Onboarding-Fragebogen aus.
            </p>
            <Link
              href="/fragebogen"
              className="mt-4 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
            >
              Fragebogen ausfüllen
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
