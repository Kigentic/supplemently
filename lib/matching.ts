// Supplemently — Matching-/Scoring-Logik (Stage 2)
// Regelbasiert, kein LLM. Pur & testbar: Input (Answers + Supplements) -> Result.
// Keine UI-, keine DB-Abhängigkeit in diesem Modul.

import type { Answers } from './questions';
import { DISCLAIMER } from './disclaimer';

// Subset einer supplements-Zeile (DB), das die Logik braucht.
export interface Supplement {
  id: string;
  name: string;
  kategorie: string | null;
  zielgruppe: string[];
  wirkung: string | null;
  dosierung_empfehlung: string | null;
  kontraindikationen: string | null;
  evidenzlevel: number | null;
  ist_kombipraeparat: boolean;
  inhaltsstoffe: Array<{ name: string; menge_mg?: number }> | unknown;
}

export interface Empfehlung {
  id: string;
  name: string;
  score: number;
  begruendung: string;      // 1-2 Sätze, Platzhalter-Text (kein LLM in Stage 2)
  dosierung: string | null; // aus DB
}

export interface MatchResult {
  essenziell: Empfehlung[];
  optional: Empfehlung[];
  disclaimer: string;
  meta: {
    ausgeschlossen: Array<{ name: string; grund: string }>;
    schwellen: { essenziell: number; optional: number };
  };
}

// Schwellenwerte + Caps.
const THRESHOLD_ESSENZIELL = 3.0;
const THRESHOLD_OPTIONAL = 1.5;
const MAX_ESSENZIELL = 4;
const MAX_OPTIONAL = 2;

// --- Helfer -----------------------------------------------------------------

const norm = (s: string) => s.toLowerCase();

// Erkennt ein Supplement anhand von Namens-Keywords (robust ggü. exakten Namen).
function is(supp: Supplement, ...keys: string[]): boolean {
  const n = norm(supp.name);
  return keys.some((k) => n.includes(k));
}

function ingredientNames(supp: Supplement): string[] {
  if (!Array.isArray(supp.inhaltsstoffe)) return [];
  return (supp.inhaltsstoffe as Array<{ name?: string }>)
    .map((i) => (i?.name ? norm(i.name) : ''))
    .filter(Boolean);
}

// Allergen-Keywords je Restriktion.
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  laktose: ['laktose', 'milch', 'molke', 'whey', 'casein'],
  gluten: ['gluten', 'weizen', 'gerste'],
  nuesse: ['nuss', 'nüsse', 'nuesse', 'erdnuss', 'mandel', 'cashew'],
};

// --- Ergebnis-Akkumulator ---------------------------------------------------

interface Acc {
  score: number;
  gruende: string[];
}

// --- Hauptfunktion ----------------------------------------------------------

export function match(answers: Answers, supplements: Supplement[]): MatchResult {
  const ausgeschlossen: Array<{ name: string; grund: string }> = [];
  const scored: Array<{ supp: Supplement; acc: Acc }> = [];

  const restr = answers.restriktionen ?? ['keine'];
  const alreadyTaking = (answers.aktuelle_supplements ?? []).map(norm);

  for (const supp of supplements) {
    // 1) Zielgruppe-Filter (Geschlecht).
    const zg = supp.zielgruppe ?? [];
    if (zg.length && !zg.includes('alle') && !zg.includes(answers.geschlecht)) {
      ausgeschlossen.push({ name: supp.name, grund: `Zielgruppe (${zg.join('/')}) passt nicht zum Geschlecht` });
      continue;
    }

    // 2) Allergie-/Restriktions-Ausschluss.
    const haystack = [norm(supp.name), norm(supp.kontraindikationen ?? ''), ...ingredientNames(supp)].join(' ');
    let excluded = false;
    for (const r of restr) {
      if (r === 'keine') continue;
      const kws = ALLERGEN_KEYWORDS[r] ?? [];
      if (kws.some((k) => haystack.includes(k))) {
        ausgeschlossen.push({ name: supp.name, grund: `Enthält mögliches Allergen (${r})` });
        excluded = true;
        break;
      }
    }
    if (excluded) continue;

    // 3) Bereits eingenommen -> nicht erneut empfehlen.
    if (alreadyTaking.length && alreadyTaking.some((t) => t.length >= 3 && norm(supp.name).includes(t))) {
      ausgeschlossen.push({ name: supp.name, grund: 'Wird bereits eingenommen' });
      continue;
    }

    // 4) Scoring.
    const acc: Acc = { score: 0, gruende: [] };
    const add = (delta: number, grund?: string) => {
      acc.score += delta;
      if (grund) acc.gruende.push(grund);
    };

    // Evidenz-Baseline (hohe Evidenz leicht bevorzugt, dient als Tiebreaker).
    if (typeof supp.evidenzlevel === 'number') add(supp.evidenzlevel * 0.2);

    // --- Ernährung ---
    if (answers.ernaehrungsstil === 'vegan' || answers.ernaehrungsstil === 'vegetarisch') {
      if (is(supp, 'b12', 'cobalamin')) add(3, 'Bei pflanzenbasierter Ernährung ist Vitamin B12 kritisch, da es fast nur in tierischen Lebensmitteln vorkommt.');
      if (is(supp, 'eisen')) add(2, 'Pflanzliches Eisen wird schlechter aufgenommen – eine Ergänzung kann den Bedarf decken.');
      if (is(supp, 'omega')) add(2, 'Ohne Fisch fehlen oft EPA/DHA – Omega-3 (ideal algenbasiert) schließt diese Lücke.');
    }

    // --- Stress & Schlaf ---
    if (answers.stresslevel === 'hoch') {
      if (is(supp, 'magnesium')) add(2, 'Bei hohem Stress steigt der Magnesiumbedarf; es unterstützt Nerven- und Muskelfunktion.');
      if (is(supp, 'ashwagandha')) add(2, 'Als Adaptogen kann Ashwagandha das Stressempfinden senken.');
    }
    if (answers.schlafqualitaet === 'schlecht') {
      if (is(supp, 'magnesium')) add(2, 'Magnesium am Abend kann zu ruhigerem Schlaf beitragen.');
      if (is(supp, 'ashwagandha')) add(1);
    } else if (answers.schlafqualitaet === 'mittel') {
      if (is(supp, 'magnesium')) add(1);
    }

    // --- Training & Ziel ---
    const intensiv = answers.trainingslevel === 'intensiv' || answers.trainingslevel === 'regelmaessig';
    if (intensiv && answers.trainingsziel === 'muskelaufbau') {
      if (is(supp, 'kreatin')) add(3, 'Kreatin ist bei intensivem Krafttraining eines der am besten belegten Mittel für Kraft und Muskelaufbau.');
      if (is(supp, 'protein', 'whey', 'eiweiß')) add(3, 'Ein erhöhter Proteinbedarf beim Muskelaufbau lässt sich mit einer Eiweiß-Ergänzung leichter decken.');
      if (is(supp, 'omega')) add(1);
    }
    if (answers.trainingsziel === 'performance') {
      if (is(supp, 'kreatin')) add(2, 'Kreatin verbessert die Leistung bei kurzen, intensiven Belastungen.');
      if (is(supp, 'citrullin')) add(3, 'L-Citrullin fördert die Durchblutung und kann die Ausdauerleistung unterstützen.');
      if (is(supp, 'omega')) add(1);
    }
    if (answers.trainingsziel === 'abnehmen') {
      if (is(supp, 'omega')) add(1);
      if (is(supp, 'protein', 'whey')) add(1, 'Protein hilft, in der Diät Muskulatur zu erhalten und satt zu bleiben.');
    }
    if (answers.trainingsziel === 'gesundheit') {
      if (is(supp, 'vitamin d')) add(2, 'Vitamin D unterstützt Immunsystem und Knochen und ist in unseren Breiten oft niedrig.');
      if (is(supp, 'omega')) add(2, 'Omega-3 unterstützt Herz-Kreislauf-System und wirkt entzündungsmodulierend.');
      if (is(supp, 'multivitamin')) add(1, 'Ein Multivitamin deckt eine breite Basis an Mikronährstoffen ab.');
    }

    // --- Allgemein ---
    if (is(supp, 'vitamin d')) add(1.5, 'Vitamin D ist besonders in den dunklen Monaten häufig unzureichend.');
    if (answers.geschlecht === 'weiblich' && is(supp, 'eisen')) add(1.5, 'Frauen haben einen erhöhten Eisenbedarf.');
    if (answers.trainingslevel === 'keine' && is(supp, 'kreatin', 'citrullin')) add(-1.5);

    scored.push({ supp, acc });
  }

  // Sortieren nach Score (desc), dann Evidenz als Tiebreak.
  scored.sort((a, b) => {
    if (b.acc.score !== a.acc.score) return b.acc.score - a.acc.score;
    return (b.supp.evidenzlevel ?? 0) - (a.supp.evidenzlevel ?? 0);
  });

  const toEmpfehlung = (s: { supp: Supplement; acc: Acc }): Empfehlung => ({
    id: s.supp.id,
    name: s.supp.name,
    score: Math.round(s.acc.score * 100) / 100,
    begruendung: s.acc.gruende.length
      ? s.acc.gruende.slice(0, 2).join(' ')
      : `${s.supp.name} passt allgemein zu deinem Profil.`,
    dosierung: s.supp.dosierung_empfehlung,
  });

  const essenziell = scored
    .filter((s) => s.acc.score >= THRESHOLD_ESSENZIELL)
    .slice(0, MAX_ESSENZIELL)
    .map(toEmpfehlung);

  const essIds = new Set(essenziell.map((e) => e.id));
  const optional = scored
    .filter((s) => !essIds.has(s.supp.id) && s.acc.score >= THRESHOLD_OPTIONAL && s.acc.score < THRESHOLD_ESSENZIELL)
    .slice(0, MAX_OPTIONAL)
    .map(toEmpfehlung);

  return {
    essenziell,
    optional,
    disclaimer: DISCLAIMER,
    meta: {
      ausgeschlossen,
      schwellen: { essenziell: THRESHOLD_ESSENZIELL, optional: THRESHOLD_OPTIONAL },
    },
  };
}
