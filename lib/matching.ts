// Supplemently — Matching-/Scoring-Logik
// Regelbasiert, kein LLM. Pur & testbar: Input (Answers + Supplements) -> Result.
// Keine UI-, keine DB-Abhängigkeit in diesem Modul.

import type { Answers } from './questions';
import { DISCLAIMER } from './disclaimer';

export interface Supplement {
  id: string;
  name: string;
  kategorie: string | null;
  tier: 'basis' | 'advanced' | 'addon';
  zielgruppe: string[];
  wirkung: string | null;
  bevorzugte_form: string | null;
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
  begruendung: string;
  dosierung: string | null;
  bevorzugte_form: string | null;
}

export interface MatchResult {
  basis: Empfehlung[];
  advanced: Empfehlung[];
  addon: Empfehlung[];
  disclaimer: string;
  meta: {
    ausgeschlossen: Array<{ name: string; grund: string }>;
    schwelle: number;
  };
}

const THRESHOLD = 1.5;
const THRESHOLD_ADDON = 0.5;
const MAX_BASIS = 4;
const MAX_ADVANCED = 4;
const MAX_ADDON = 2;

const norm = (s: string) => s.toLowerCase();

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

const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  laktose: ['laktose', 'milch', 'molke', 'whey', 'casein'],
  gluten: ['gluten', 'weizen', 'gerste'],
  nuesse: ['nuss', 'nüsse', 'nuesse', 'erdnuss', 'mandel', 'cashew'],
};

interface Acc {
  score: number;
  gruende: string[];
}

export function match(answers: Answers, supplements: Supplement[]): MatchResult {
  const ausgeschlossen: Array<{ name: string; grund: string }> = [];
  const scored: Array<{ supp: Supplement; acc: Acc }> = [];

  const restr = answers.restriktionen ?? ['keine'];
  const alreadyTaking = (answers.aktuelle_supplements ?? []).map(norm);

  for (const supp of supplements) {
    // Zielgruppe-Filter
    const zg = supp.zielgruppe ?? [];
    if (zg.length && !zg.includes('alle') && !zg.includes(answers.geschlecht)) {
      ausgeschlossen.push({ name: supp.name, grund: `Zielgruppe (${zg.join('/')}) passt nicht zum Geschlecht` });
      continue;
    }

    // Allergie-/Restriktions-Ausschluss
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

    // Bereits eingenommen -> nicht erneut empfehlen
    if (alreadyTaking.length && alreadyTaking.some((t) => t.length >= 3 && norm(supp.name).includes(t))) {
      ausgeschlossen.push({ name: supp.name, grund: 'Wird bereits eingenommen' });
      continue;
    }

    const acc: Acc = { score: 0, gruende: [] };
    const add = (delta: number, grund?: string) => {
      acc.score += delta;
      if (grund) acc.gruende.push(grund);
    };

    // Evidenz-Baseline (Tiebreaker)
    if (typeof supp.evidenzlevel === 'number') add(supp.evidenzlevel * 0.2);

    // ── Ernährungsstil ───────────────────────────────────────────────────────
    if (answers.ernaehrungsstil === 'vegan' || answers.ernaehrungsstil === 'vegetarisch') {
      if (is(supp, 'b12', 'cobalamin')) add(3, 'Bei pflanzenbasierter Ernährung ist Vitamin B12 kritisch, da es fast nur in tierischen Lebensmitteln vorkommt.');
      if (is(supp, 'eisen')) add(2, 'Pflanzliches Eisen wird schlechter aufgenommen – eine Ergänzung kann den Bedarf decken.');
      if (is(supp, 'omega')) add(2, 'Ohne Fisch fehlen oft EPA/DHA – Omega-3 (ideal algenbasiert) schließt diese Lücke.');
    }

    // ── Kochverhalten & Essgewohnheiten ──────────────────────────────────────
    if (answers.kochverhalten === 'fertiggerichte') {
      if (is(supp, 'multivitamin')) add(2, 'Bei überwiegenden Fertiggerichten deckt ein Multivitamin Mikronährstofflücken ab.');
      if (is(supp, 'omega')) add(1.5, 'Fertiggerichte enthalten kaum hochwertige Omega-3-Fettsäuren.');
      if (is(supp, 'magnesium')) add(1, 'Verarbeitete Lebensmittel sind oft magnesiumarm.');
    } else if (answers.kochverhalten === 'gemischt') {
      if (is(supp, 'multivitamin')) add(1);
      if (is(supp, 'omega')) add(1);
    }

    if (answers.mahlzeiten_pro_tag === '1_2') {
      if (is(supp, 'multivitamin')) add(1.5, 'Wenige Mahlzeiten erschweren eine ausreichende Mikronährstoffversorgung.');
      if (is(supp, 'magnesium')) add(1);
    }

    if (answers.auswaerts_essen === '3_4_woche' || answers.auswaerts_essen === 'taeglich') {
      if (is(supp, 'omega')) add(1, 'Häufiges Essen außer Haus bedeutet wenig Kontrolle über Fettqualität.');
      if (is(supp, 'multivitamin')) add(1);
    }

    if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') {
      if (is(supp, 'b-komplex', 'b komplex', 'b12', 'cobalamin')) add(2, 'Alkohol erschöpft B-Vitamine (B1, B6, B12) – ein B-Komplex gleicht das aus.');
      if (is(supp, 'magnesium')) add(1.5, 'Alkohol erhöht die renale Magnesiumausscheidung.');
      if (is(supp, 'zink')) add(1.5, 'Regelmäßiger Alkoholkonsum senkt den Zinkspiegel.');
      if (is(supp, 'omega')) add(1);
    } else if (answers.alkohol === 'gelegentlich') {
      if (is(supp, 'b-komplex', 'b komplex', 'b12', 'cobalamin')) add(0.5);
    }

    // ── Schlaf ───────────────────────────────────────────────────────────────
    const schlechterSchlaf =
      answers.aufwachgefuehl === 'unausgeschlafen' ||
      answers.schlaf_durchschlafen === 'haeufig' ||
      answers.schlaf_durchschlafen === 'einschlafen';

    if (schlechterSchlaf) {
      if (is(supp, 'magnesium')) add(2.5, 'Schlechter Schlaf ist oft mit Magnesiummangel assoziiert; Magnesiumglycinat kann die Schlafqualität verbessern.');
      if (is(supp, 'ashwagandha')) add(2, 'Ashwagandha kann das Einschlafen erleichtern und die Schlafdauer verlängern.');
    } else if (answers.aufwachgefuehl === 'neutral' || answers.schlaf_durchschlafen === 'gelegentlich') {
      if (is(supp, 'magnesium')) add(1);
    }

    if (answers.schlafdauer < 6) {
      if (is(supp, 'magnesium')) add(1.5, 'Zu wenig Schlaf erhöht den Magnesiumbedarf.');
      if (is(supp, 'ashwagandha')) add(1);
    }

    // ── Stress & Regeneration ────────────────────────────────────────────────
    if (answers.stresslevel === 'hoch') {
      if (is(supp, 'magnesium')) add(2, 'Bei hohem Stress steigt der Magnesiumbedarf; es unterstützt Nerven- und Muskelfunktion.');
      if (is(supp, 'ashwagandha')) add(2, 'Als Adaptogen kann Ashwagandha das Stressempfinden senken.');
    } else if (answers.stresslevel === 'mittel') {
      if (is(supp, 'magnesium')) add(1);
    }

    if (answers.entspannung === 'kaum' || answers.gedanken_abschalten === 'selten') {
      if (is(supp, 'ashwagandha')) add(2, 'Ashwagandha reguliert als Adaptogen den Cortisolspiegel und beruhigt das Nervensystem.');
      if (is(supp, 'magnesium')) add(1.5, 'Magnesium unterstützt die Entspannungsfähigkeit des Nervensystems.');
      if (is(supp, 'b-komplex', 'b komplex')) add(1, 'B-Vitamine sind essenziell für einen ausgeglichenen Neurotransmitter-Haushalt.');
    } else if (answers.entspannung === 'mit_aufwand' || answers.gedanken_abschalten === 'manchmal') {
      if (is(supp, 'ashwagandha')) add(1);
      if (is(supp, 'magnesium')) add(1);
    }

    // ── Verdauung ────────────────────────────────────────────────────────────
    if (answers.verdauung_blaeungen === 'haeufig') {
      if (is(supp, 'glutamin')) add(3, 'L-Glutamin ist der wichtigste Energielieferant für Darmzellen und kann die Darmbarriere stärken.');
      if (is(supp, 'omega')) add(1, 'Omega-3 wirkt entzündungsmodulierend und unterstützt die Darmgesundheit.');
    } else if (answers.verdauung_blaeungen === 'gelegentlich') {
      if (is(supp, 'glutamin')) add(1.5);
    }

    // ── Heißhunger / Cravings ────────────────────────────────────────────────
    if (answers.heisshunger === 'taeglich' || answers.heisshunger === 'gelegentlich_suess') {
      if (is(supp, 'chrom')) add(2.5, 'Chrom verbessert die Insulinsensitivität und kann Heißhunger auf Süßes reduzieren.');
      if (is(supp, 'zink')) add(1, 'Zink ist an der Insulinregulation beteiligt und kann Cravings mildern.');
      if (is(supp, 'magnesium')) add(1, 'Magnesiummangel ist häufig mit Heißhunger auf Süßes assoziiert.');
    } else if (answers.heisshunger === 'gelegentlich_salzig') {
      if (is(supp, 'magnesium')) add(1, 'Heißhunger auf Salziges kann auf Mineralstoffmangel hindeuten.');
      if (is(supp, 'zink')) add(1);
    }

    // ── Gelenke ──────────────────────────────────────────────────────────────
    if (answers.gelenk_probleme === 'chronisch_arthrose') {
      if (is(supp, 'kollagen')) add(3, 'Kollagen liefert Bausteine für Knorpel und Bindegewebe — besonders relevant bei Arthrose.');
      if (is(supp, 'glucosamin')) add(3, 'Glucosamin ist Bestandteil des Knorpelgewebes und kann Gelenkschmerzen bei Arthrose lindern.');
      if (is(supp, 'chondroitin')) add(2.5, 'Chondroitin hemmt knorpelabbauende Enzyme und wirkt entzündungshemmend.');
      if (is(supp, 'msm', 'methylsulfonyl')) add(2.5, 'MSM liefert organischen Schwefel für die Bindegewebssynthese und wirkt entzündungsmodulierend.');
      if (is(supp, 'boswellia', 'weihrauch')) add(2.5, 'Boswellia-Extrakt hemmt Entzündungswege und kann Gelenkschmerzen bei Arthrose reduzieren.');
      if (is(supp, 'omega')) add(1.5, 'Omega-3 wirkt systemisch entzündungshemmend — unterstützend bei Gelenkproblemen.');
      if (is(supp, 'curcumin', 'kurkuma')) add(2, 'Curcumin hemmt entzündungsfördernde Zytokine und kann Gelenkschmerzen lindern.');
      if (is(supp, 'hyaluron')) add(2, 'Hyaluronsäure ist Bestandteil der Gelenkschmiere und kann die Beweglichkeit verbessern.');
      if (is(supp, 'vitamin d')) add(1, 'Vitamin D ist für Knochenmineralisation und Muskelkraft wichtig.');
    } else if (answers.gelenk_probleme === 'haeufig') {
      if (is(supp, 'kollagen')) add(2, 'Kollagen unterstützt Knorpel- und Bindegewebsgesundheit bei häufigen Gelenkbeschwerden.');
      if (is(supp, 'msm', 'methylsulfonyl')) add(1.5, 'MSM kann Gelenkentzündungen mildern.');
      if (is(supp, 'boswellia', 'weihrauch')) add(1.5, 'Boswellia wirkt entzündungshemmend bei Gelenkschmerzen.');
      if (is(supp, 'omega')) add(1, 'Omega-3 wirkt entzündungsmodulierend.');
      if (is(supp, 'curcumin', 'kurkuma')) add(1.5, 'Curcumin reduziert Entzündungsmarker bei Gelenkbeschwerden.');
    } else if (answers.gelenk_probleme === 'gelegentlich') {
      if (is(supp, 'kollagen')) add(1, 'Kollagen kann gelegentliche Gelenkbeschwerden präventiv unterstützen.');
      if (is(supp, 'omega')) add(0.5);
    }

    // ── Medikamente ──────────────────────────────────────────────────────────
    const meds = answers.medikamente ?? ['keine'];

    if (meds.includes('pille')) {
      if (is(supp, 'b-komplex', 'b komplex', 'b12', 'cobalamin')) add(2, 'Hormonelle Verhütungsmittel senken B-Vitamine (B6, B12, Folsäure) – eine Ergänzung ist sinnvoll.');
      if (is(supp, 'magnesium')) add(1.5, 'Die Pille erhöht den Magnesiumbedarf.');
      if (is(supp, 'zink')) add(1.5, 'Zink kann durch hormonelle Verhütung vermindert werden.');
    }
    if (meds.includes('schilddruese')) {
      if (is(supp, 'selen')) add(3, 'Selen ist essenziell für die Schilddrüsenhormonsynthese (T4→T3-Konversion).');
      if (is(supp, 'zink')) add(1.5, 'Zink unterstützt die Schilddrüsenfunktion.');
    }
    if (meds.includes('blutzucker')) {
      if (is(supp, 'chrom')) add(2, 'Chrom verbessert die Insulinsensitivität – sinnvolle Ergänzung bei Blutzuckerproblemen.');
      if (is(supp, 'magnesium')) add(1.5, 'Magnesium verbessert die Insulinempfindlichkeit.');
      if (is(supp, 'omega')) add(1);
    }
    if (meds.includes('blutdruck')) {
      if (is(supp, 'magnesium')) add(2, 'Magnesium kann den Blutdruck leicht senken und ergänzt Blutdruckmedikamente unterstützend.');
      if (is(supp, 'omega')) add(1.5, 'Omega-3 hat eine leicht blutdrucksenkende Wirkung.');
    }
    if (meds.includes('antidepressiva')) {
      if (is(supp, 'omega')) add(2, 'Omega-3 (EPA) unterstützt die Gehirnfunktion und wird als Begleitung bei Depression diskutiert.');
      if (is(supp, 'vitamin d')) add(1.5, 'Vitamin-D-Mangel ist mit depressiven Verstimmungen assoziiert.');
      if (is(supp, 'magnesium')) add(1.5, 'Magnesium ist an der Serotoninsynthese beteiligt.');
    }

    // ── Training & Ziel ──────────────────────────────────────────────────────
    const intensiv = answers.trainingslevel === 'intensiv' || answers.trainingslevel === 'regelmaessig';
    if (intensiv && answers.trainingsziel === 'muskelaufbau') {
      if (is(supp, 'kreatin')) add(3, 'Kreatin ist bei intensivem Krafttraining eines der am besten belegten Mittel für Kraft und Muskelaufbau.');
      if (is(supp, 'omega')) add(1);
    }
    if (answers.trainingsziel === 'performance') {
      if (is(supp, 'kreatin')) add(2, 'Kreatin verbessert die Leistung bei kurzen, intensiven Belastungen.');
      if (is(supp, 'citrullin')) add(3, 'L-Citrullin fördert die Durchblutung und kann die Ausdauerleistung unterstützen.');
      if (is(supp, 'omega')) add(1);
    }
    if (answers.trainingsziel === 'abnehmen') {
      if (is(supp, 'omega')) add(1);
    }
    if (answers.trainingsziel === 'gesundheit') {
      if (is(supp, 'vitamin d')) add(2, 'Vitamin D unterstützt Immunsystem und Knochen – in unseren Breiten oft zu niedrig.');
      if (is(supp, 'omega')) add(2, 'Omega-3 unterstützt Herz-Kreislauf-System und wirkt entzündungsmodulierend.');
      if (is(supp, 'multivitamin')) add(1, 'Ein Multivitamin deckt eine breite Basis an Mikronährstoffen ab.');
    }

    // ── Allgemein ────────────────────────────────────────────────────────────
    if (is(supp, 'vitamin d')) add(1.5, 'Vitamin D ist besonders in den dunklen Monaten häufig unzureichend.');
    if (answers.geschlecht === 'weiblich' && is(supp, 'eisen')) add(1.5, 'Frauen haben einen erhöhten Eisenbedarf.');
    if (answers.trainingslevel === 'keine' && is(supp, 'kreatin', 'citrullin')) add(-1.5);

    scored.push({ supp, acc });
  }

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
    bevorzugte_form: s.supp.bevorzugte_form ?? null,
  });

  const qualified = scored.filter((s) => s.acc.score >= THRESHOLD);

  const basis = qualified.filter((s) => s.supp.tier === 'basis').slice(0, MAX_BASIS).map(toEmpfehlung);
  const advanced = qualified.filter((s) => s.supp.tier === 'advanced').slice(0, MAX_ADVANCED).map(toEmpfehlung);
  const addon = scored.filter((s) => s.supp.tier === 'addon' && s.acc.score >= THRESHOLD_ADDON).slice(0, MAX_ADDON).map(toEmpfehlung);

  return {
    basis,
    advanced,
    addon,
    disclaimer: DISCLAIMER,
    meta: {
      ausgeschlossen,
      schwelle: THRESHOLD,
    },
  };
}
