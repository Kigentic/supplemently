// Affiliate-Matching für die 3 Touchpoints der 8-Wochen-Challenge (siehe
// GAMEPLAN Kap. 12): nach Onboarding, auf der Wochenseite, nach Check-in.
// Bewusst schlank gehalten (kein Score-Threshold-System wie bei den
// Supplement-Empfehlungen in lib/matching.ts) — pro Touchpoint reicht eine
// Top-1/Top-2-Auswahl nach Tag-Überschneidung.
import type { Answers } from './questions';

export interface AffiliateLink {
  id: string;
  partner_name: string;
  produkt_name: string;
  kategorie: string;
  beschreibung: string | null;
  url: string;
  bild_url: string | null;
  trigger_tags: string[];
  woche: number | null;
  rabattcode: string | null;
}

function scoreByTags(link: AffiliateLink, tags: Set<string>): number {
  return link.trigger_tags.reduce((sum, t) => sum + (tags.has(t) ? 1 : 0), 0);
}

function rankByTags(links: AffiliateLink[], tags: string[], max: number): AffiliateLink[] {
  const tagSet = new Set(tags);
  return [...links].sort((a, b) => scoreByTags(b, tagSet) - scoreByTags(a, tagSet)).slice(0, max);
}

// ── Touchpoint 1 — direkt nach dem Onboarding-Fragebogen ────────────────────

export function tagsFromOnboarding(answers: Partial<Answers>): string[] {
  const tags: string[] = [];

  if (answers.schlaf_durchschlafen === 'haeufig' || answers.schlaf_durchschlafen === 'einschlafen' || answers.aufwachgefuehl === 'unausgeschlafen') {
    tags.push('schlecht_geschlafen', 'schlafqualitaet', 'regeneration');
  }
  if (answers.stresslevel === 'hoch' || answers.entspannung === 'kaum' || answers.gedanken_abschalten === 'selten') {
    tags.push('stress');
  }
  if (answers.trainingslevel === 'regelmaessig' || answers.trainingslevel === 'intensiv' || answers.trainingsziel === 'muskelaufbau') {
    tags.push('training', 'krafttraining');
  }
  if (answers.trainingsziel === 'performance' || answers.trainingslevel === 'intensiv') {
    tags.push('bewegung', 'mobility');
  }
  if (answers.gelenk_probleme && answers.gelenk_probleme !== 'keine') {
    tags.push('mobility', 'verspannung');
  }
  if (tags.length === 0) tags.push('bewegung', 'alltag');

  return tags;
}

export function matchForOnboarding(links: AffiliateLink[], answers: Partial<Answers>, max = 2): AffiliateLink[] {
  return rankByTags(links, tagsFromOnboarding(answers), max);
}

// ── Touchpoint 2 — Wochenseite, passend zur Wochen-Thematik ─────────────────

export function matchForWeek(links: AffiliateLink[], weekNum: number, max = 1): AffiliateLink[] {
  const weekSpecific = links.filter((l) => l.woche === weekNum);
  const pool = weekSpecific.length > 0 ? weekSpecific : links.filter((l) => l.woche === null);
  return pool.slice(0, max);
}

// ── Touchpoint 3 — nach dem Wochen-Check-in, basierend auf den Antworten ────

export function tagsFromCheckin(opts: { wohlbefinden: number; schwierigkeit: number }): string[] {
  const tags: string[] = [];
  if (opts.wohlbefinden <= 4) tags.push('schlecht_geschlafen', 'stress', 'regeneration');
  if (opts.schwierigkeit >= 7) tags.push('stress', 'verspannung');
  if (opts.wohlbefinden >= 8 && opts.schwierigkeit <= 4) tags.push('training', 'krafttraining', 'bewegung');
  if (tags.length === 0) tags.push('mobility', 'alltag');
  return tags;
}

export function matchForCheckin(
  links: AffiliateLink[],
  opts: { weekNum: number; wohlbefinden: number; schwierigkeit: number },
  max = 2
): AffiliateLink[] {
  const weekPool = links.filter((l) => l.woche === opts.weekNum || l.woche === null);
  const pool = weekPool.length > 0 ? weekPool : links;
  return rankByTags(pool, tagsFromCheckin(opts), max);
}
