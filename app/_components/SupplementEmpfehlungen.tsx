// Gemeinsame Darstellung der Supplement-Empfehlung (Tier-Karten) — genutzt
// von der anonymen Ergebnisseite (/ergebnis/[sessionId]) und der
// eingeloggten Challenge-Ansicht (/challenge/supplemente).
import type { MatchResult, Empfehlung } from '@/lib/matching';
import type { Answers } from '@/lib/questions';

// ── Insight-Generator ────────────────────────────────────────────────────────

export function buildInsights(a: Answers): string[] {
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

type TierKey = 'immer' | 'basis' | 'specials' | 'addon';
type TierStyle = { dot: string; badge: string; badgeText: string; rankBg: string };

const TIER_STYLES: Record<TierKey, TierStyle> = {
  immer:   { dot: 'bg-amber-500',   badge: 'bg-amber-500/10 text-amber-600',    badgeText: 'Must-have', rankBg: 'bg-amber-500 text-white' },
  basis:   { dot: 'bg-accent',      badge: 'bg-accent/10 text-accent',          badgeText: 'Basis',     rankBg: 'bg-accent text-on-accent' },
  specials:{ dot: 'bg-blue-500',    badge: 'bg-blue-500/10 text-blue-500',      badgeText: 'Special',   rankBg: 'bg-blue-500 text-white' },
  addon:   { dot: 'bg-outline',     badge: 'bg-outline/30 text-text-muted',     badgeText: 'Add-on',    rankBg: 'bg-outline/40 text-text-muted' },
};

function SuppCard({ rank, e, tier }: { rank: number; e: Empfehlung; tier: TierKey }) {
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

const TIER_META: Record<TierKey, { title: string; desc: string; dotColor: string }> = {
  immer:   { title: 'Die 5 Basics',        desc: 'Für jeden empfohlen — unabhängig von deinem Profil.',     dotColor: 'bg-amber-500' },
  basis:   { title: 'Deine Basics',        desc: 'Personalisierte Grundversorgung basierend auf deinen Angaben.', dotColor: 'bg-accent' },
  specials:{ title: 'Specials',            desc: 'Gezielte Unterstützung für dein spezifisches Profil.',    dotColor: 'bg-blue-500' },
  addon:   { title: 'Add-ons',             desc: 'Optionale Ergänzungen mit zusätzlichem Nutzen.',          dotColor: 'bg-outline' },
};

function TierSection({
  tier,
  items,
  startRank,
}: {
  tier: TierKey;
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

// ── Öffentliche Komponente ────────────────────────────────────────────────────

export default function SupplementEmpfehlungenListe({ ergebnis }: { ergebnis: MatchResult }) {
  const immer = ergebnis.immer ?? [];
  const basis = ergebnis.basis ?? [];
  const specials = ergebnis.specials ?? [];
  const addon = ergebnis.addon ?? [];
  const total = immer.length + basis.length + specials.length + addon.length;

  if (total === 0) {
    return (
      <div className="rounded-2xl bg-surface p-8 text-center text-text-muted">
        Keine Empfehlungen für dein Profil.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <TierSection tier="immer"    items={immer}    startRank={1} />
      <TierSection tier="basis"    items={basis}    startRank={immer.length + 1} />
      <TierSection tier="specials" items={specials} startRank={immer.length + basis.length + 1} />
      <TierSection tier="addon"    items={addon}    startRank={immer.length + basis.length + specials.length + 1} />
    </div>
  );
}
