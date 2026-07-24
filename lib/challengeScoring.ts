// Zentrale Scoring-Konstanten + Schulnoten-Einschätzung der 8-Wochen-Challenge.
// Einzige Quelle der Wahrheit für Punktwerte — wird sowohl von der
// Check-in-API (Score-Berechnung) als auch vom Masteradmin-Bereich
// (Anzeige/Nachvollziehbarkeit) genutzt, damit beide nie auseinanderlaufen.
import { habitsUpTo } from './challengeWeeks';

export type Ampel = 'gruen' | 'gelb' | 'rot';

export const AMPEL_PUNKTE: Record<Ampel, number> = { gruen: 20, gelb: 10, rot: 0 };
export const CHECKIN_BASISPUNKTE = 10;

/** Maximal erreichbarer Score für den Check-in einer einzelnen Woche (inkl. Carry-Forward-Habits aus Vorwochen). */
export function maxScoreForWeek(week: number): number {
  const habitCount = habitsUpTo(week).reduce((sum, g) => sum + g.items.length, 0);
  return CHECKIN_BASISPUNKTE + habitCount * AMPEL_PUNKTE.gruen;
}

/** Maximal erreichbarer Gesamt-Score, wenn alle Check-ins bis einschließlich `uptoWeek` perfekt (alles grün) abgegeben wurden. */
export function maxGesamtScore(uptoWeek: number): number {
  let total = 0;
  for (let w = 1; w <= uptoWeek; w++) total += maxScoreForWeek(w);
  return total;
}

export interface Note {
  wert: 1 | 2 | 3 | 4;
  label: string;
}

/**
 * Schulnoten-Stufen 1 (Sehr gut) bis 4 (Ausreichend) — bewusst nach unten bei
 * "Ausreichend" gedeckelt statt bis "mangelhaft"/"ungenügend" runterzugehen.
 * Das Ziel ist eine realistische Einordnung, kein demotivierendes Abstrafen.
 */
const NOTEN_STUFEN: { minAnteil: number; wert: 1 | 2 | 3 | 4; label: string }[] = [
  { minAnteil: 0.9, wert: 1, label: 'Sehr gut' },
  { minAnteil: 0.75, wert: 2, label: 'Gut' },
  { minAnteil: 0.55, wert: 3, label: 'Befriedigend' },
  { minAnteil: 0, wert: 4, label: 'Ausreichend' },
];

export function noteFuer(score: number, maxScore: number): Note {
  const anteil = maxScore > 0 ? Math.min(1, score / maxScore) : 0;
  const stufe = NOTEN_STUFEN.find((s) => anteil >= s.minAnteil) ?? NOTEN_STUFEN[NOTEN_STUFEN.length - 1];
  return { wert: stufe.wert, label: stufe.label };
}
