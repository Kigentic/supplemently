'use client';

// Supplemently — Ergebnisseite: personalisierte Supplement-Empfehlung.

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import SupplementEmpfehlungenListe, { buildInsights } from '@/app/_components/SupplementEmpfehlungen';
import type { MatchResult } from '@/lib/matching';
import type { Answers } from '@/lib/questions';

// ── Hauptseite ────────────────────────────────────────────────────────────────

interface SessionData {
  ergebnis: MatchResult;
  antworten: Answers;
}

export default function ErgebnisPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params?.sessionId ?? '';

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId);
    if (!isUuid) { setNotFound(true); setLoading(false); return; }

    fetch(`/api/session/${sessionId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <p className="text-text-muted">Auswertung wird geladen …</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  // ── Not found ──
  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-bg">
        <SiteHeader />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <h1 className="mb-4 text-2xl font-semibold text-text">Ergebnis nicht gefunden</h1>
          <p className="mb-8 text-text-muted">Zu dieser Session gibt es kein Ergebnis.</p>
          <Link
            href="/fragebogen"
            className="rounded-full bg-accent px-7 py-3 text-base font-semibold text-on-accent transition hover:bg-accent-hover"
          >
            Fragebogen ausfüllen
          </Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { ergebnis, antworten } = data;
  const immer = ergebnis.immer ?? [];
  const basis = ergebnis.basis ?? [];
  const specials = ergebnis.specials ?? [];
  const addon = ergebnis.addon ?? [];
  const total = immer.length + basis.length + specials.length + addon.length;

  const insights = buildInsights(antworten);

  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-5 py-16 sm:py-20">

        {/* Intro */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Deine Auswertung
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text sm:text-4xl">
            Ich habe deine Angaben ausgewertet.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-text-muted">
            {total > 0
              ? `${total} Empfehlungen für dein Profil — von universellen Basics bis zu gezielten Specials.`
              : 'Für dein aktuelles Profil gibt es keine konkreten Empfehlungen.'}
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

        {/* Empfehlungsliste — 3 Sektionen */}
        <SupplementEmpfehlungenListe ergebnis={ergebnis} />

        {/* Disclaimer */}
        <div className="mt-10 rounded-xl border border-outline/50 bg-surface px-5 py-4">
          <p className="text-xs leading-relaxed text-text-muted">{ergebnis.disclaimer}</p>
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/fragebogen"
            className="inline-block rounded-full border border-outline px-6 py-2.5 text-sm font-medium text-text transition hover:border-text hover:bg-outline/20"
          >
            Neuen Check starten
          </Link>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
