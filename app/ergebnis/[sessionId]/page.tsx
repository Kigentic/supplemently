'use client';

// Supplemently — Ergebnisseite: personalisierte Supplement-Empfehlung.

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import SiteHeader from '@/app/_components/SiteHeader';
import SiteFooter from '@/app/_components/SiteFooter';
import type { MatchResult, Empfehlung } from '@/lib/matching';
import type { Answers } from '@/lib/questions';

// ── Insight-Generator ────────────────────────────────────────────────────────

function buildInsights(a: Answers): string[] {
  const out: string[] = [];

  if (a.ernaehrungsstil === 'vegan')
    out.push('Vegane Ernährung: B12, Eisen und pflanzliches Omega-3 sind kritische Lücken.');
  else if (a.ernaehrungsstil === 'vegetarisch')
    out.push('Vegetarische Ernährung: B12 im Blick behalten, Eisen und Omega-3 können knapp sein.');

  if (a.kochverhalten === 'fertiggerichte')
    out.push('Fertiggerichte dominieren deinen Speiseplan — Mikronährstofflücken sind wahrscheinlich.');

  if (a.alkohol === 'regelmaessig' || a.alkohol === 'taeglich')
    out.push('Regelmäßiger Alkohol verbraucht B-Vitamine, Magnesium und Zink.');

  const schlechterSchlaf =
    a.aufwachgefuehl === 'unausgeschlafen' ||
    a.schlaf_durchschlafen === 'haeufig' ||
    a.schlaf_durchschlafen === 'einschlafen';
  if (schlechterSchlaf || a.schlafdauer < 6)
    out.push('Dein Schlaf ist eingeschränkt — hier gibt es gezielte Ansatzpunkte.');

  if (a.stresslevel === 'hoch' && (a.entspannung === 'kaum' || a.gedanken_abschalten === 'selten'))
    out.push('Hoher Stress, schlechte Abschaltfähigkeit — erhöhter Bedarf an Magnesium und Adapto­genen.');
  else if (a.stresslevel === 'hoch')
    out.push('Hoher Stresslevel erhöht den Magnesiumverbrauch.');

  if (a.verdauung_blaeungen === 'haeufig')
    out.push('Häufige Verdauungsprobleme: Darmbarriere und Mikro­biom können Unterstützung brauchen.');

  if (a.gelenk_probleme === 'chronisch_arthrose')
    out.push('Arthrose diagnostiziert: Kollagen, Glucosamin und Boswellia zeigen hier die stärkste Evidenz.');
  else if (a.gelenk_probleme === 'haeufig')
    out.push('Häufige Gelenkbeschwerden: Kollagen, MSM und Curcumin können entzündlich und strukturell ansetzen.');

  if (a.heisshunger === 'taeglich' || a.heisshunger === 'gelegentlich_suess')
    out.push('Regelmäßiger Heißhunger auf Süßes — Chrom und Magnesium setzen hier an.');

  if (
    (a.trainingslevel === 'intensiv' || a.trainingslevel === 'regelmaessig') &&
    a.trainingsziel === 'muskelaufbau'
  )
    out.push('Intensives Krafttraining mit Muskelaufbauziel: Kreatin ist hier die stärkste Evidenz.');
  else if (a.trainingsziel === 'performance')
    out.push('Performance-Fokus: Citrullin und Kreatin für Ausdauer und Kraft.');

  if (a.medikamente?.includes('pille'))
    out.push('Hormonelle Verhütung erhöht den Bedarf an B-Vitaminen, Magnesium und Zink.');
  if (a.medikamente?.includes('schilddruese'))
    out.push('Schilddrüsenmedikamente: Selen und Zink sind besonders relevant.');

  return out.slice(0, 3);
}

// ── Supplement-Karte ─────────────────────────────────────────────────────────

type TierStyle = { dot: string; badge: string; badgeText: string; rankBg: string; rankText: string };

const TIER_STYLES: Record<'basis' | 'advanced' | 'addon', TierStyle> = {
  basis:    { dot: 'bg-accent',         badge: 'bg-accent/10 text-accent',          badgeText: 'Basis',    rankBg: 'bg-accent text-on-accent',      rankText: '' },
  advanced: { dot: 'bg-blue-500',       badge: 'bg-blue-500/10 text-blue-500',      badgeText: 'Advanced', rankBg: 'bg-blue-500 text-white',         rankText: '' },
  addon:    { dot: 'bg-outline',        badge: 'bg-outline/30 text-text-muted',     badgeText: 'Add-on',   rankBg: 'bg-outline/40 text-text-muted',  rankText: '' },
};

function SuppCard({ rank, e, tier }: { rank: number; e: Empfehlung; tier: 'basis' | 'advanced' | 'addon' }) {
  const s = TIER_STYLES[tier];
  return (
    <div className="flex gap-5 rounded-2xl bg-surface p-6 sm:p-7">
      <div className="flex-shrink-0 pt-0.5">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${s.rankBg}`}>
          {String(rank).padStart(2, '0')}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-text">{e.name}</h2>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.badge}`}>{s.badgeText}</span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-text-muted">{e.begruendung}</p>
        {e.bevorzugte_form && (
          <p className="mt-3 text-xs text-text-muted">
            <span className="font-medium text-text">Empfohlene Form:</span>{' '}
            {e.bevorzugte_form.split(';')[0].trim()}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Tier-Sektion ──────────────────────────────────────────────────────────────

const TIER_META: Record<'basis' | 'advanced' | 'addon', { title: string; desc: string; dotColor: string }> = {
  basis:    { title: 'Basis',    desc: 'Essenzielle Grundversorgung — für jeden sinnvoll.',             dotColor: 'bg-accent' },
  advanced: { title: 'Advanced', desc: 'Gezielte Unterstützung für dein spezifisches Profil.',          dotColor: 'bg-blue-500' },
  addon:    { title: 'Add-on',   desc: 'Optionale Ergänzungen für zusätzlichen Nutzen.',               dotColor: 'bg-outline' },
};

function TierSection({
  tier,
  items,
  startRank,
}: {
  tier: 'basis' | 'advanced' | 'addon';
  items: Empfehlung[];
  startRank: number;
}) {
  if (items.length === 0) return null;
  const meta = TIER_META[tier];
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${meta.dotColor}`} />
        <div>
          <span className="text-sm font-semibold text-text">{meta.title}</span>
          <span className="ml-2 text-xs text-text-muted">{meta.desc}</span>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((e, i) => (
          <SuppCard key={e.id} rank={startRank + i} e={e} tier={tier} />
        ))}
      </div>
    </div>
  );
}

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
  const basis = ergebnis.basis ?? [];
  const advanced = ergebnis.advanced ?? [];
  const addon = ergebnis.addon ?? [];
  const total = basis.length + advanced.length + addon.length;

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
              ? `Für dein Profil machen ${total} Supplement${total === 1 ? '' : 's'} Sinn — aufgeteilt in drei Stufen.`
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
        {total > 0 ? (
          <div className="space-y-10">
            <TierSection tier="basis"    items={basis}    startRank={1} />
            <TierSection tier="advanced" items={advanced} startRank={basis.length + 1} />
            <TierSection tier="addon"    items={addon}    startRank={basis.length + advanced.length + 1} />
          </div>
        ) : (
          <div className="rounded-2xl bg-surface p-8 text-center text-text-muted">
            Keine Empfehlungen für dein Profil.
          </div>
        )}

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
