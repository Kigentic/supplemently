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
const THRESHOLD_ADDON = 1.1;
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

    // ── Folat / B9 ───────────────────────────────────────────────────────────
    if (is(supp, 'folat', 'folsäure', 'b9')) {
      if (answers.medikamente?.includes('pille')) add(2.5, 'Hormonelle Verhütungsmittel erschöpfen Folat (B9) — ein kritischer Nährstoff für Zellteilung und DNA-Synthese.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(2, 'Alkohol blockiert die Folataufnahme im Darm und erhöht die renale Ausscheidung.');
      if (answers.medikamente?.includes('antidepressiva')) add(1.5, 'Niedriger Folatspiegel ist mit schlechterer Antidepressiva-Wirksamkeit assoziiert — Methylfolat kann die Therapie unterstützen.');
      if (answers.kochverhalten === 'fertiggerichte') add(1.5, 'Folat steckt vor allem in frischem Blattgemüse — bei überwiegenden Fertiggerichten ist Mangel wahrscheinlich.');
      if (answers.ernaehrungsstil === 'vegan' && answers.kochverhalten !== 'frisch') add(1, 'Vegane Ernährung mit wenig frischem Gemüse kann die Folatversorgung gefährden.');
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

    // ── Bor ──────────────────────────────────────────────────────────────────
    if (is(supp, 'bor')) {
      if (answers.geschlecht === 'männlich') {
        if (answers.trainingsziel === 'muskelaufbau' && (answers.trainingslevel === 'intensiv' || answers.trainingslevel === 'regelmaessig')) {
          add(2.5, 'Bor senkt SHBG (Sex-Hormone-Binding-Globulin) — dadurch steigt das freie Testosteron. Bei intensivem Krafttraining mit Muskelaufbauziel ein unterschätzter Hebel.');
        } else if (answers.trainingsziel === 'performance') {
          add(2, 'Bor erhöht das freie Testosteron durch SHBG-Senkung und kann die Regeneration nach intensiven Einheiten verbessern.');
        } else if (answers.alter >= 40) {
          add(1.5, 'Mit zunehmendem Alter steigt SHBG — Bor kann das freie Testosteron auch ohne Training anheben.');
        }
      }
    }

    // ── Vitamin C ────────────────────────────────────────────────────────────
    if (is(supp, 'vitamin c')) {
      if (answers.raucher === 'ja') add(3, 'Rauchen erhöht den Vitamin-C-Bedarf drastisch — Raucher brauchen bis zu doppelt so viel wie Nichtraucher.');
      if (answers.raucher === 'ex_raucher') add(1.5, 'Ex-Raucher haben oft noch erhöhten oxidativen Stress — Vitamin C unterstützt den Abbau.');
      if (answers.trainingslevel === 'intensiv') add(1.5, 'Intensives Training erzeugt oxidativen Stress — Vitamin C stärkt Immunfunktion und Regeneration.');
      if (answers.kochverhalten === 'fertiggerichte') add(1.5, 'Fertiggerichte enthalten kaum Vitamin C — das steckt in frischem Obst und Gemüse.');
      if (answers.trainingsziel === 'gesundheit') add(1, 'Vitamin C stärkt das Immunsystem und wirkt antioxidativ.');
    }

    // ── Vitamin K2 ───────────────────────────────────────────────────────────
    if (is(supp, 'vitamin k')) {
      if (answers.geschlecht === 'weiblich' && answers.alter >= 40) add(2.5, 'Ab 40 steigt das Osteoporose-Risiko bei Frauen — Vitamin K2 lenkt Calcium in die Knochen statt in Gefäßwände.');
      if (answers.trainingsziel === 'gesundheit') add(1.5, 'Vitamin K2 unterstützt Knochengesundheit und schützt Gefäße vor Calcifizierung.');
      if ((answers.ernaehrungsstil === 'vegan' || answers.ernaehrungsstil === 'vegetarisch') && answers.kochverhalten !== 'frisch') add(1, 'Vitamin K2 steckt vor allem in fermentierten tierischen Produkten — bei pflanzlicher Kost schnell Mangelware.');
    }

    // ── Vitamin B1 (Thiamin) ─────────────────────────────────────────────────
    if (is(supp, 'thiamin')) {
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(2.5, 'Alkohol blockiert die Thiamin-Aufnahme im Darm — B1-Mangel ist die häufigste Folge regelmäßigen Alkoholkonsums.');
      if (answers.kochverhalten === 'fertiggerichte') add(1.5, 'Verarbeitete Lebensmittel verlieren beim Erhitzen viel Thiamin.');
    }

    // ── Vitamin B2 (Riboflavin) ──────────────────────────────────────────────
    if (is(supp, 'riboflavin')) {
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(1.5, 'Alkohol stört den B2-Stoffwechsel und erhöht den Riboflavin-Verbrauch.');
      if (answers.trainingslevel === 'intensiv' || answers.trainingslevel === 'regelmaessig') add(1.5, 'Riboflavin ist zentraler Kofaktor im Energiestoffwechsel — bei intensivem Training steigt der Bedarf.');
      if (answers.ernaehrungsstil === 'vegan') add(1.5, 'Milchprodukte sind die Hauptquelle für B2 — vegane Ernährung erhöht das Mangelrisiko.');
    }

    // ── Vitamin B3 (Niacin) ──────────────────────────────────────────────────
    if (is(supp, 'niacin')) {
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(2, 'Alkohol erschöpft Niacin-Reserven und stört den NAD+-Stoffwechsel.');
      if (answers.medikamente?.includes('blutzucker')) add(1.5, 'Niacin verbessert Insulinsensitivität und Lipidprofil — sinnvolle Ergänzung bei Blutzuckerproblemen.');
      if (answers.trainingsziel === 'performance') add(1, 'Niacin ist Vorstufe von NAD+ — essenziell für die zelluläre Energieproduktion unter Belastung.');
    }

    // ── Vitamin B5 (Pantothensäure) ──────────────────────────────────────────
    if (is(supp, 'pantothen')) {
      if (answers.stresslevel === 'hoch') add(2, 'Die Nebennieren verbrauchen bei Dauerstress enorme Mengen Pantothensäure für die Cortisolproduktion.');
      if (answers.entspannung === 'kaum' || answers.gedanken_abschalten === 'selten') add(1, 'Chronischer Stress erhöht den B5-Bedarf für die Stresshormon-Synthese.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(1, 'Alkohol senkt den Pantothensäure-Spiegel.');
    }

    // ── Vitamin B6 (Pyridoxin) ───────────────────────────────────────────────
    if (is(supp, 'pyridoxin')) {
      if (answers.medikamente?.includes('pille')) add(2.5, 'Hormonelle Verhütungsmittel erschöpfen B6 massiv — es wird für über 100 Enzymreaktionen benötigt, darunter Serotonin-Synthese.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(2, 'Alkohol bindet B6 und beschleunigt seinen Abbau in der Leber.');
      if (answers.stresslevel === 'hoch') add(1, 'B6 ist Kofaktor bei der Produktion von Serotonin und GABA — wichtig für die Stressreaktion.');
    }

    // ── Vitamin B7 (Biotin) ──────────────────────────────────────────────────
    if (is(supp, 'biotin')) {
      if (answers.raucher === 'ja') add(2, 'Rauchen erhöht den Biotinverbrauch und senkt den Serumspiegel nachweislich.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(1.5, 'Alkohol hemmt Biotin-Aufnahme und -Transport im Körper.');
      if (answers.ernaehrungsstil === 'vegan') add(1, 'Tierische Produkte sind die biotin-reichsten Quellen — vegane Ernährung erhöht das Mangelrisiko leicht.');
    }

    // ── Vitamin E ────────────────────────────────────────────────────────────
    if (is(supp, 'vitamin e')) {
      if (answers.raucher === 'ja') add(2.5, 'Rauchen erzeugt massiven oxidativen Stress — Vitamin E als fettlösliches Antioxidans wird dabei schnell verbraucht.');
      if (answers.raucher === 'ex_raucher') add(1.5, 'Ex-Raucher haben noch erhöhten oxidativen Stress — Vitamin E unterstützt die antioxidative Regeneration.');
      if (answers.trainingslevel === 'intensiv') add(1.5, 'Intensives Training erhöht die Lipidperoxidation — Vitamin E schützt Zellmembranen vor oxidativem Schaden.');
    }

    // ── Calcium ──────────────────────────────────────────────────────────────
    if (is(supp, 'calcium')) {
      if (answers.geschlecht === 'weiblich' && answers.alter >= 40) add(2.5, 'Knochendichte nimmt nach der Menopause ab — Calcium ist die wichtigste Basis für Osteoporose-Prävention.');
      if (answers.ernaehrungsstil === 'vegan') add(2, 'Milchprodukte sind die Hauptcalciumquelle — vegane Ernährung erhöht das Mangelrisiko erheblich.');
      if (answers.gelenk_probleme === 'chronisch_arthrose' || answers.gelenk_probleme === 'haeufig') add(1, 'Knochengesundheit ist die Basis für gesunde Gelenke — Calcium schützt die Knochenstruktur.');
    }

    // ── Jod ──────────────────────────────────────────────────────────────────
    if (is(supp, 'jod')) {
      if (answers.ernaehrungsstil === 'vegan' || answers.ernaehrungsstil === 'vegetarisch') add(2.5, 'Jod steckt hauptsächlich in Fisch und Milch — pflanzliche Ernährung ohne Meeresfrüchte erhöht das Mangelrisiko stark.');
      if (answers.medikamente?.includes('schilddruese')) add(2, 'Jod ist essenziell für die Schilddrüsenhormon-Synthese — bei Schilddrüsenerkrankungen oft relevant.');
      if (answers.kochverhalten === 'fertiggerichte') add(1, 'Verarbeitete Lebensmittel enthalten häufig nicht-jodiertes Salz — Lücken sind möglich.');
    }

    // ── Kalium ───────────────────────────────────────────────────────────────
    if (is(supp, 'kalium')) {
      if (answers.medikamente?.includes('blutdruck')) add(2, 'Kalium wirkt blutdrucksenkend und ergänzt Blutdruckmedikamente sinnvoll — viele Betroffene sind unterversorgt.');
      if (answers.trainingslevel === 'intensiv') add(1.5, 'Intensives Training führt zu hohem Kaliumbedarf über Schweiß — Muskelkrämpfe können ein Signal sein.');
      if (answers.auswaerts_essen === '3_4_woche' || answers.auswaerts_essen === 'taeglich') add(1, 'Restaurantkost enthält oft viel Natrium, aber wenig Kalium — die Balance gerät leicht aus dem Gleichgewicht.');
      if (answers.kochverhalten === 'fertiggerichte') add(1, 'Fertiggerichte haben ein ungünstiges Natrium-Kalium-Verhältnis — Kaliumversorgung ist oft lückenhaft.');
    }

    // ── L-Carnitin ───────────────────────────────────────────────────────────
    if (is(supp, 'carnitin') && !norm(supp.name).includes('acetyl')) {
      if (answers.trainingsziel === 'abnehmen' && (answers.trainingslevel === 'regelmaessig' || answers.trainingslevel === 'intensiv')) {
        add(2.5, 'L-Carnitin transportiert Fettsäuren in die Mitochondrien — bei regelmäßigem Training kann es die Fettverbrennung unterstützen.');
      }
      if (answers.trainingsziel === 'performance') add(2, 'L-Carnitin verbessert die Fettoxidation bei Ausdauerbelastung und kann die Erholungszeit verkürzen.');
      if (answers.ernaehrungsstil === 'vegan' || answers.ernaehrungsstil === 'vegetarisch') add(2, 'L-Carnitin steckt fast ausschließlich in tierischen Produkten — vegane und vegetarische Ernährung senkt den Spiegel nachweislich.');
      if (answers.alter >= 40) add(1, 'Die körpereigene Carnitin-Synthese nimmt ab dem 40. Lebensjahr ab.');
    }

    // ── Acetyl-L-Carnitin (ALCAR) ────────────────────────────────────────────
    if (is(supp, 'acetyl-l-carnitin', 'alcar')) {
      if (answers.aufwachgefuehl === 'unausgeschlafen' && answers.stresslevel === 'hoch') add(2, 'ALCAR überquert die Blut-Hirn-Schranke und unterstützt die mitochondriale Energieproduktion im Gehirn — gegen mentale Erschöpfung.');
      if (answers.alter >= 40) add(2, 'ALCAR-Spiegel sinken mit zunehmendem Alter — es unterstützt kognitive Funktion und mitochondriale Gesundheit.');
      if (answers.trainingsziel === 'performance') add(1.5, 'ALCAR verbessert die mentale Ausdauer und Fokus unter Belastung.');
    }

    // ── L-Theanin ────────────────────────────────────────────────────────────
    if (is(supp, 'theanin')) {
      if (answers.stresslevel === 'hoch' && (answers.entspannung === 'kaum' || answers.gedanken_abschalten === 'selten')) add(2.5, 'L-Theanin fördert Entspannung ohne Müdigkeit — es erhöht Alpha-Wellen im EEG und senkt Cortisol.');
      if (answers.gedanken_abschalten === 'selten') add(2, 'L-Theanin beruhigt den rastlosen Geist — besonders wirksam beim Abschalten abends.');
      if (answers.stresslevel === 'hoch') add(1.5, 'L-Theanin reduziert stressinduzierte Angst ohne sedierende Wirkung.');
      if (answers.trainingsziel === 'performance') add(1.5, 'In Kombination mit Koffein steigert L-Theanin Fokus und Reaktionszeit ohne Nervosität.');
    }

    // ── L-Tryptophan ─────────────────────────────────────────────────────────
    if (is(supp, 'tryptophan')) {
      if (schlechterSchlaf) add(2.5, 'Tryptophan ist die Vorstufe von Serotonin und Melatonin — eine Ergänzung kann die Einschlafzeit verkürzen und Schlaftiefe verbessern.');
      if (answers.schlaf_durchschlafen === 'einschlafen') add(1, 'Tryptophan fördert die natürliche Melatonin-Produktion und unterstützt das Einschlafen.');
      if (answers.stresslevel === 'hoch' && answers.entspannung === 'kaum') add(1.5, 'Chronischer Stress verbraucht Tryptophan für die Cortisolsynthese — Serotonin-Mangel ist eine häufige Folge.');
      if (answers.medikamente?.includes('antidepressiva')) add(-5);
    }

    // ── L-Tyrosin ────────────────────────────────────────────────────────────
    if (is(supp, 'tyrosin') && !norm(supp.name).includes('acetyl')) {
      if (answers.stresslevel === 'hoch' && answers.aufwachgefuehl === 'unausgeschlafen') add(2.5, 'Tyrosin ist Vorstufe von Dopamin, Noradrenalin und Cortisol — bei Dauerstress und Schlafmangel wird er schnell erschöpft.');
      if (answers.trainingsziel === 'performance') add(2, 'Tyrosin verbessert die kognitive Leistung unter Stress und Erschöpfung — für mentale Stärke bei Wettkampf oder intensiven Einheiten.');
      if (answers.medikamente?.includes('schilddruese')) add(1.5, 'Tyrosin ist direkte Vorstufe der Schilddrüsenhormone T3 und T4.');
    }

    // ── Arginin ──────────────────────────────────────────────────────────────
    if (is(supp, 'arginin')) {
      if (answers.trainingsziel === 'performance') add(2, 'Arginin ist Vorstufe von Stickstoffmonoxid (NO) — es erweitert Blutgefäße und verbessert die Durchblutung unter Belastung.');
      if (answers.medikamente?.includes('blutdruck')) add(1.5, 'Arginin fördert die NO-Produktion und kann Blutdruck leicht senken — als Ergänzung zu Medikamenten sinnvoll.');
      if (answers.trainingslevel === 'intensiv' && answers.trainingsziel === 'muskelaufbau') add(1.5, 'Arginin unterstützt die Wachstumshormon-Ausschüttung und Muskeldurchblutung nach dem Training.');
    }

    // ── Glycin ───────────────────────────────────────────────────────────────
    if (is(supp, 'glycin')) {
      if (schlechterSchlaf) add(2.5, '3 g Glycin vor dem Schlafen senkt die Körpertemperatur und verbessert Schlafqualität und Tagesmüdigkeit nachweislich.');
      if (answers.gelenk_probleme === 'chronisch_arthrose' || answers.gelenk_probleme === 'haeufig') add(1.5, 'Glycin ist Hauptaminosäure im Kollagen und unterstützt die Knorpel- und Bindegewebssynthese.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(1.5, 'Glycin schützt Leberzellen und unterstützt die Entgiftungsfunktion bei regelmäßigem Alkoholkonsum.');
    }

    // ── Taurin ───────────────────────────────────────────────────────────────
    if (is(supp, 'taurin')) {
      if (answers.trainingsziel === 'performance') add(2, 'Taurin verbessert die muskuläre Ausdauer, reduziert oxidativen Stress und unterstützt die Herzfunktion unter Belastung.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(2, 'Taurin schützt die Leber vor alkoholbedingtem oxidativen Schaden und unterstützt Gallenproduktion.');
      if (answers.trainingsziel === 'gesundheit') add(1.5, 'Taurin wirkt kardioprotektiv, stabilisiert Herzrhythmus und senkt Blutdruck leicht.');
      if (answers.ernaehrungsstil === 'vegan' || answers.ernaehrungsstil === 'vegetarisch') add(1.5, 'Taurin kommt nur in tierischen Produkten vor — bei pflanzlicher Ernährung ist die körpereigene Synthese oft unzureichend.');
    }

    // ── Probiotika ───────────────────────────────────────────────────────────
    if (is(supp, 'probiotik')) {
      if (answers.verdauung_blaeungen === 'haeufig') add(3, 'Häufige Blähungen und Verdauungsbeschwerden deuten auf eine gestörte Darmflora hin — Probiotika können das Mikrobiom gezielt wiederherstellen.');
      if (answers.verdauung_blaeungen === 'gelegentlich') add(2, 'Gelegentliche Verdauungsprobleme sprechen für ein unausgewogenes Mikrobiom — Probiotika wirken präventiv.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(1.5, 'Alkohol schädigt die Darmschleimhaut und reduziert Vielfalt und Anzahl nützlicher Darmbakterien.');
      if (answers.kochverhalten === 'fertiggerichte') add(1.5, 'Stark verarbeitete Kost enthält kaum Ballaststoffe und Präbiotika — Fertiggerichte schaden langfristig dem Mikrobiom.');
      if (answers.stresslevel === 'hoch') add(1, 'Chronischer Stress verändert die Darmflora über die Gut-Brain-Axis — Probiotika können diesen Kreislauf durchbrechen.');
    }

    // ── Präbiotika ───────────────────────────────────────────────────────────
    if (is(supp, 'präbiotik', 'inulin')) {
      if (answers.verdauung_blaeungen === 'haeufig') add(2.5, 'Präbiotika ernähren nützliche Darmbakterien und können das Mikrobiom langfristig stabilisieren.');
      if (answers.kochverhalten === 'fertiggerichte') add(2, 'Fertiggerichte liefern kaum lösliche Ballaststoffe — Präbiotika schließen diese Lücke.');
      if (answers.verdauung_blaeungen === 'gelegentlich') add(1.5, 'Präbiotika fördern das Wachstum gesundheitsfördernder Bakterienstämme.');
    }

    // ── Verdauungsenzyme ─────────────────────────────────────────────────────
    if (is(supp, 'verdauungsenzym')) {
      if (answers.verdauung_blaeungen === 'haeufig') add(2.5, 'Häufige Blähungen nach dem Essen deuten oft auf Enzymmangel hin — Verdauungsenzyme helfen, Nährstoffe vollständiger aufzuspalten.');
      if (answers.kochverhalten === 'fertiggerichte') add(1.5, 'Industriell verarbeitete Nahrung ist arm an natürlichen Enzymen und belastet die eigene Verdauungsleistung.');
      if (answers.mahlzeiten_pro_tag === '6_plus') add(1, 'Viele Mahlzeiten pro Tag fordern das Verdauungssystem dauerhaft — Enzymkomplexe unterstützen die Verarbeitung.');
    }

    // ── Flohsamenschalen ─────────────────────────────────────────────────────
    if (is(supp, 'flohsamen')) {
      if (answers.verdauung_blaeungen === 'haeufig') add(2.5, 'Flohsamenschalen binden Wasser, regulieren die Darmpassage und können Blähungen durch bessere Verdauungsregulation lindern.');
      if (answers.heisshunger === 'taeglich' || answers.heisshunger === 'gelegentlich_suess') add(2, 'Flohsamenschalen bilden einen Gelfilm im Darm, der die Blutzuckeraufnahme verlangsamt und Heißhunger dämpft.');
      if (answers.medikamente?.includes('blutzucker')) add(1.5, 'Lösliche Ballaststoffe wie Flohsamenschalen verbessern die Blutzuckerregulation und können den Medikamentenbedarf ergänzend senken.');
    }

    // ── Coenzym Q10 / Ubiquinol ──────────────────────────────────────────────
    if (is(supp, 'coenzym', 'ubiquinol', 'q10')) {
      if (answers.alter >= 40) add(2.5, 'CoQ10-Spiegel sinken ab 40 jährlich — es ist zentral für die Energieproduktion in den Mitochondrien und als Antioxidans.');
      if (answers.aufwachgefuehl === 'unausgeschlafen' && answers.trainingslevel !== 'keine') add(2, 'CoQ10 verbessert die mitochondriale Effizienz — bei Trainingsfatigue und schlechtem Erholungsgefühl ein gezielter Ansatz.');
      if (answers.trainingsziel === 'performance') add(1.5, 'CoQ10 steigert die aerobe Kapazität und verringert trainingsbedingten oxidativen Stress.');
      if (answers.trainingsziel === 'gesundheit' && answers.alter >= 35) add(1.5, 'CoQ10 schützt Herzmuskelzellen und unterstützt kardiovaskuläre Gesundheit ab dem mittleren Alter.');
    }

    // ── NAC (N-Acetyl-Cystein) ───────────────────────────────────────────────
    if (is(supp, 'n-acetyl', 'nac')) {
      if (answers.raucher === 'ja') add(3, 'NAC ist die stärkste Ergänzung für Raucher: Es löst Schleim, schützt Lungenzellen und ist Vorstufe von Glutathion — dem wichtigsten Antioxidans der Leber.');
      if (answers.raucher === 'ex_raucher') add(2, 'Ex-Raucher haben noch über Jahre erhöhten oxidativen Stress — NAC unterstützt den Glutathion-Aufbau und Lungenschutz.');
      if (answers.alkohol === 'regelmaessig' || answers.alkohol === 'taeglich') add(2.5, 'NAC schützt Leberzellen vor alkoholbedingtem oxidativen Schaden und fördert Glutathion-Synthese.');
      if (answers.trainingslevel === 'intensiv') add(1.5, 'Intensives Training erzeugt freie Radikale — NAC als Glutathion-Vorstufe schützt Zellen und unterstützt Regeneration.');
    }

    // ── Rhodiola rosea ───────────────────────────────────────────────────────
    if (is(supp, 'rhodiola')) {
      if (answers.stresslevel === 'hoch' && answers.aufwachgefuehl === 'unausgeschlafen') add(2.5, 'Rhodiola ist eines der am besten untersuchten Adaptogene gegen Burnout-Erschöpfung — es reduziert Cortisol und verbessert Belastbarkeit.');
      if (answers.trainingsziel === 'performance' && answers.stresslevel !== 'niedrig') add(2, 'Rhodiola steigert mentale und körperliche Ausdauer unter Stress und wird in der Leistungssportforschung gut dokumentiert.');
      if (answers.gedanken_abschalten === 'selten' && answers.stresslevel === 'hoch') add(1.5, 'Rhodiola senkt durch Adaptogen-Wirkung den gefühlten Stress und verbessert die emotionale Belastbarkeit.');
    }

    // ── Ginseng ──────────────────────────────────────────────────────────────
    if (is(supp, 'ginseng')) {
      if (answers.trainingsziel === 'performance') add(2, 'Ginseng (Panax) verbessert Ausdauerleistung, reduziert wahrgenommene Erschöpfung und unterstützt die Erholung.');
      if (answers.aufwachgefuehl === 'unausgeschlafen' && answers.stresslevel !== 'niedrig') add(2, 'Ginseng wirkt gegen chronische Erschöpfung und stärkt die Stressresistenz als klassisches Tonikum.');
      if (answers.alter >= 40) add(1.5, 'Ginseng zeigt im Alter besonders gute Wirkung auf Vitalität, Kognition und Immunfunktion.');
    }

    // ── Inositol ─────────────────────────────────────────────────────────────
    if (is(supp, 'inositol')) {
      if (answers.geschlecht === 'weiblich' && answers.medikamente?.includes('pille')) add(2.5, 'Inositol verbessert die Insulinsensitivität und unterstützt hormonelle Balance — besonders relevant bei PCOS und hormoneller Verhütung.');
      if (answers.medikamente?.includes('blutzucker')) add(2, 'Inositol verbessert die zelluläre Insulinantwort und wirkt ergänzend bei Blutzuckerproblemen.');
      if (answers.stresslevel === 'hoch' && answers.gedanken_abschalten === 'selten') add(2, 'Inositol wirkt anxiolytisch und kann obsessive Gedankenmuster durchbrechen — klinische Evidenz bei Angst und Stress.');
      if (answers.heisshunger === 'taeglich' || answers.heisshunger === 'gelegentlich_suess') add(1.5, 'Inositol verbessert die Insulinsensitivität — das hilft gegen Heißhunger und Blutzuckerschwankungen.');
    }

    // ── 5-HTP ────────────────────────────────────────────────────────────────
    if (is(supp, '5-htp', 'hydroxytryptophan')) {
      if (answers.medikamente?.includes('antidepressiva')) add(-5);
      if (schlechterSchlaf && !answers.medikamente?.includes('antidepressiva')) add(2.5, '5-HTP ist direkte Vorstufe von Serotonin und Melatonin — es kann Einschlafzeit verkürzen und Schlafarchitektur verbessern.');
      if (answers.heisshunger === 'taeglich' && !answers.medikamente?.includes('antidepressiva')) add(2, 'Serotonin reguliert das Sättigungsgefühl — 5-HTP kann Heißhunger und unkontrolliertes Essen reduzieren.');
      if (answers.stresslevel === 'hoch' && answers.entspannung === 'kaum' && !answers.medikamente?.includes('antidepressiva')) add(1.5, '5-HTP kann die Stimmung stabilisieren und Angst reduzieren — über erhöhte Serotonin-Verfügbarkeit.');
    }

    // ── Berberin ─────────────────────────────────────────────────────────────
    if (is(supp, 'berberin')) {
      if (answers.medikamente?.includes('blutzucker')) add(2.5, 'Berberin aktiviert AMPK und zeigt in Studien ähnliche Blutzucker-senkende Wirkung wie Metformin — einer der stärksten pflanzlichen Ansätze.');
      if (answers.heisshunger === 'taeglich' || answers.heisshunger === 'gelegentlich_suess') add(2, 'Berberin verbessert Insulinsensitivität und Blutzuckerregulation — direkt wirksam gegen Heißhungerattacken.');
      if (answers.verdauung_blaeungen === 'haeufig') add(1.5, 'Berberin moduliert die Darmflora und hat antimikrobielle Wirkung gegen pathogene Darmbakterien.');
    }

    // ── Zimt-Extrakt ─────────────────────────────────────────────────────────
    if (is(supp, 'zimt')) {
      if (answers.medikamente?.includes('blutzucker')) add(2, 'Zimt-Extrakt (MHCP) verbessert die Insulinsensitivität und kann postprandialen Blutzuckeranstieg dämpfen.');
      if (answers.heisshunger === 'taeglich' || answers.heisshunger === 'gelegentlich_suess') add(2, 'Zimt verlangsamt die Magenentleerung und dämpft Blutzuckerspitzen — wirksam gegen süßen Heißhunger.');
    }

    // ── Reishi ───────────────────────────────────────────────────────────────
    if (is(supp, 'reishi')) {
      if (answers.stresslevel === 'hoch' && (answers.entspannung === 'kaum' || answers.schlaf_durchschlafen !== 'problemlos')) add(2, 'Reishi (Ganoderma lucidum) wirkt adaptogen und schlaffördernd — klinische Studien zeigen Reduktion von Müdigkeit und Stresssymptomen.');
      if (answers.trainingsziel === 'gesundheit') add(1.5, 'Reishi moduliert das Immunsystem und zeigt antioxidative und entzündungshemmende Wirkung in der Forschung.');
    }

    // ── Cordyceps ────────────────────────────────────────────────────────────
    if (is(supp, 'cordyceps')) {
      if (answers.trainingsziel === 'performance' && (answers.trainingslevel === 'intensiv' || answers.trainingslevel === 'regelmaessig')) add(2, 'Cordyceps verbessert die ATP-Synthese und maximale Sauerstoffaufnahme (VO2max) — gut dokumentiert für Ausdauerleistung.');
      if (answers.aufwachgefuehl === 'unausgeschlafen' && answers.trainingslevel !== 'keine') add(1.5, 'Cordyceps verbessert die mitochondriale Energieproduktion und kann gegen Trainingsfatigue wirken.');
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
