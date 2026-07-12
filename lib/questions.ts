export type Geschlecht = 'männlich' | 'weiblich' | 'divers';
export type Trainingslevel = 'keine' | 'gelegentlich' | 'regelmaessig' | 'intensiv';
export type Trainingsziel = 'muskelaufbau' | 'abnehmen' | 'gesundheit' | 'performance';
export type Ernaehrungsstil = 'omnivor' | 'vegetarisch' | 'vegan';
export type Restriktion = 'laktose' | 'gluten' | 'nuesse' | 'keine';
export type Kochverhalten = 'frisch' | 'gemischt' | 'fertiggerichte';
export type MahlzeitenProTag = '1_2' | '3' | '4_5' | '6_plus';
export type AuswaertsEssen = 'selten' | '1_2_woche' | '3_4_woche' | 'taeglich';
export type Alkohol = 'kein' | 'gelegentlich' | 'regelmaessig' | 'taeglich';
export type Aufwachgefuehl = 'ausgeruht' | 'energiereich' | 'neutral' | 'unausgeschlafen';
export type SchlafDurchschlafen = 'problemlos' | 'gelegentlich' | 'haeufig' | 'einschlafen';
export type Stresslevel = 'niedrig' | 'mittel' | 'hoch';
export type Entspannung = 'leicht' | 'mit_aufwand' | 'kaum';
export type GedankenAbschalten = 'ja' | 'manchmal' | 'selten';
export type VerdauungBlaehungen = 'selten' | 'gelegentlich' | 'haeufig';
export type Heisshunger = 'selten' | 'gelegentlich_suess' | 'gelegentlich_salzig' | 'taeglich';
export type Medikament = 'blutdruck' | 'blutzucker' | 'schilddruese' | 'pille' | 'antidepressiva' | 'keine';

export interface Answers {
  // Persönliche Daten
  geschlecht: Geschlecht;
  alter: number;
  // Training
  trainingslevel: Trainingslevel;
  trainingsziel: Trainingsziel;
  // Ernährung
  ernaehrungsstil: Ernaehrungsstil;
  restriktionen: Restriktion[];
  kochverhalten: Kochverhalten;
  mahlzeiten_pro_tag: MahlzeitenProTag;
  auswaerts_essen: AuswaertsEssen;
  alkohol: Alkohol;
  // Schlaf
  schlafdauer: number;
  aufwachgefuehl: Aufwachgefuehl;
  schlaf_durchschlafen: SchlafDurchschlafen;
  // Stress & Regeneration
  stresslevel: Stresslevel;
  entspannung: Entspannung;
  gedanken_abschalten: GedankenAbschalten;
  // Verdauung & Befinden
  verdauung_blaeungen: VerdauungBlaehungen;
  heisshunger: Heisshunger;
  // Medikamente & Supplemente
  medikamente: Medikament[];
  aktuelle_supplements?: string[];
}

export interface Option {
  value: string;
  label: string;
}

export type FrageTyp = 'single' | 'multi' | 'number' | 'multi_freetext';

export interface Frage {
  id: string;
  frage: string;
  typ: FrageTyp;
  optionen?: Option[];
  placeholder?: string;
  min?: number;
  max?: number;
  einheit?: string;
  optional?: boolean;
}

export const FRAGEN: Frage[] = [
  // ── Schritt 1: Persönliche Daten ─────────────────────────────────────────
  {
    id: 'geschlecht',
    frage: 'Dein Geschlecht?',
    typ: 'single',
    optionen: [
      { value: 'männlich', label: 'Männlich' },
      { value: 'weiblich', label: 'Weiblich' },
      { value: 'divers', label: 'Keine Angabe' },
    ],
  },
  {
    id: 'alter',
    frage: 'Wie alt bist du?',
    typ: 'number',
    min: 14,
    max: 120,
    einheit: 'Jahre',
    placeholder: 'z. B. 32',
  },

  // ── Schritt 2: Training & Ziele ───────────────────────────────────────────
  {
    id: 'trainingslevel',
    frage: 'Wie oft trainierst du pro Woche?',
    typ: 'single',
    optionen: [
      { value: 'keine', label: 'Gar nicht' },
      { value: 'gelegentlich', label: '1–2× pro Woche' },
      { value: 'regelmaessig', label: '3–4× pro Woche' },
      { value: 'intensiv', label: '5× und mehr' },
    ],
  },
  {
    id: 'trainingsziel',
    frage: 'Was ist dein Hauptziel?',
    typ: 'single',
    optionen: [
      { value: 'muskelaufbau', label: 'Muskelaufbau' },
      { value: 'abnehmen', label: 'Abnehmen / Körperfett' },
      { value: 'gesundheit', label: 'Allgemeine Gesundheit' },
      { value: 'performance', label: 'Performance / Ausdauer' },
    ],
  },

  // ── Schritt 3: Ernährung ──────────────────────────────────────────────────
  {
    id: 'ernaehrungsstil',
    frage: 'Wie ernährst du dich?',
    typ: 'single',
    optionen: [
      { value: 'omnivor', label: 'Omnivor — alles' },
      { value: 'vegetarisch', label: 'Vegetarisch' },
      { value: 'vegan', label: 'Vegan' },
    ],
  },
  {
    id: 'restriktionen',
    frage: 'Gibt es Allergien oder Unverträglichkeiten?',
    typ: 'multi',
    optionen: [
      { value: 'keine', label: 'Keine' },
      { value: 'laktose', label: 'Laktose' },
      { value: 'gluten', label: 'Gluten' },
      { value: 'nuesse', label: 'Nüsse' },
    ],
  },
  {
    id: 'kochverhalten',
    frage: 'Wie isst du überwiegend?',
    typ: 'single',
    optionen: [
      { value: 'frisch', label: 'Frisch gekocht' },
      { value: 'gemischt', label: 'Teils frisch, teils Fertigprodukte' },
      { value: 'fertiggerichte', label: 'Überwiegend Fertiggerichte / Fast Food' },
    ],
  },
  {
    id: 'mahlzeiten_pro_tag',
    frage: 'Wie viele Mahlzeiten isst du täglich?',
    typ: 'single',
    optionen: [
      { value: '1_2', label: '1–2 Mahlzeiten' },
      { value: '3', label: '3 Mahlzeiten' },
      { value: '4_5', label: '4–5 Mahlzeiten' },
      { value: '6_plus', label: '6 oder mehr' },
    ],
  },
  {
    id: 'auswaerts_essen',
    frage: 'Wie oft isst du außer Haus oder bestellst?',
    typ: 'single',
    optionen: [
      { value: 'selten', label: 'Selten (max. 1× Woche)' },
      { value: '1_2_woche', label: '1–2× pro Woche' },
      { value: '3_4_woche', label: '3–4× pro Woche' },
      { value: 'taeglich', label: 'Täglich' },
    ],
  },
  {
    id: 'alkohol',
    frage: 'Wie schätzt du deinen Alkoholkonsum ein?',
    typ: 'single',
    optionen: [
      { value: 'kein', label: 'Kein Alkohol' },
      { value: 'gelegentlich', label: 'Gelegentlich (paar Gläser / Monat)' },
      { value: 'regelmaessig', label: 'Regelmäßig (wöchentlich)' },
      { value: 'taeglich', label: 'Täglich' },
    ],
  },

  // ── Schritt 4: Schlaf ─────────────────────────────────────────────────────
  {
    id: 'schlafdauer',
    frage: 'Wie viele Stunden schläfst du durchschnittlich pro Nacht?',
    typ: 'number',
    min: 2,
    max: 14,
    einheit: 'Stunden',
    placeholder: 'z. B. 7',
  },
  {
    id: 'aufwachgefuehl',
    frage: 'Wie fühlst du dich beim Aufwachen?',
    typ: 'single',
    optionen: [
      { value: 'energiereich', label: 'Energiereich — direkt fit' },
      { value: 'ausgeruht', label: 'Ausgeruht' },
      { value: 'neutral', label: 'Okay, brauche etwas Zeit' },
      { value: 'unausgeschlafen', label: 'Meistens müde, wie gar nicht geschlafen' },
    ],
  },
  {
    id: 'schlaf_durchschlafen',
    frage: 'Wie gut schläfst du durch?',
    typ: 'single',
    optionen: [
      { value: 'problemlos', label: 'Problemlos' },
      { value: 'gelegentlich', label: 'Gelegentliche Unterbrechungen' },
      { value: 'haeufig', label: 'Häufig wach, schlechter Schlaf' },
      { value: 'einschlafen', label: 'Probleme beim Einschlafen' },
    ],
  },

  // ── Schritt 5: Stress & Regeneration ─────────────────────────────────────
  {
    id: 'stresslevel',
    frage: 'Wie würdest du dein allgemeines Stressniveau beschreiben?',
    typ: 'single',
    optionen: [
      { value: 'niedrig', label: 'Niedrig — entspannt' },
      { value: 'mittel', label: 'Mittel — gelegentlich stressig' },
      { value: 'hoch', label: 'Hoch — dauerhaft unter Druck' },
    ],
  },
  {
    id: 'entspannung',
    frage: 'Kannst du nach einem stressigen Tag gut abschalten?',
    typ: 'single',
    optionen: [
      { value: 'leicht', label: 'Ja, kein Problem' },
      { value: 'mit_aufwand', label: 'Geht, mit etwas Aufwand' },
      { value: 'kaum', label: 'Kaum — schwer zu entspannen' },
    ],
  },
  {
    id: 'gedanken_abschalten',
    frage: 'Gelingt es dir, den Kopf auszuschalten — z. B. vor dem Einschlafen?',
    typ: 'single',
    optionen: [
      { value: 'ja', label: 'Ja, meistens problemlos' },
      { value: 'manchmal', label: 'Manchmal' },
      { value: 'selten', label: 'Selten — Gedanken kreisen oft' },
    ],
  },

  // ── Schritt 6: Verdauung & Befinden ──────────────────────────────────────
  {
    id: 'verdauung_blaeungen',
    frage: 'Wie ist deine Verdauung? Blähungen oder Völlegefühl nach dem Essen?',
    typ: 'single',
    optionen: [
      { value: 'selten', label: 'Selten, kaum Beschwerden' },
      { value: 'gelegentlich', label: 'Gelegentlich (1–2× pro Woche)' },
      { value: 'haeufig', label: 'Häufig oder fast täglich' },
    ],
  },
  {
    id: 'heisshunger',
    frage: 'Wie oft bekommst du Heißhunger oder Cravings?',
    typ: 'single',
    optionen: [
      { value: 'selten', label: 'Selten oder nie' },
      { value: 'gelegentlich_suess', label: 'Gelegentlich — eher auf Süßes' },
      { value: 'gelegentlich_salzig', label: 'Gelegentlich — eher auf Salziges' },
      { value: 'taeglich', label: 'Täglich, starke Cravings' },
    ],
  },

  // ── Schritt 7: Medikamente & Ergänzungen ─────────────────────────────────
  {
    id: 'medikamente',
    frage: 'Nimmst du regelmäßig Medikamente ein?',
    typ: 'multi',
    optionen: [
      { value: 'keine', label: 'Keine' },
      { value: 'blutdruck', label: 'Blutdruckmedikamente' },
      { value: 'blutzucker', label: 'Blutzuckermedikamente' },
      { value: 'schilddruese', label: 'Schilddrüsenpräparate' },
      { value: 'pille', label: 'Pille / Hormonpräparate' },
      { value: 'antidepressiva', label: 'Antidepressiva / Psychopharmaka' },
    ],
  },
  {
    id: 'aktuelle_supplements',
    frage: 'Welche Nahrungsergänzungen nimmst du bereits?',
    typ: 'multi_freetext',
    optional: true,
    placeholder: 'z. B. Vitamin D3, Kreatin (Komma-getrennt)',
  },
];

export const GRUPPEN = [
  { id: 'profil',     titel: 'Persönliche Daten',       frageIds: ['geschlecht', 'alter'] },
  { id: 'training',   titel: 'Training & Ziele',         frageIds: ['trainingslevel', 'trainingsziel'] },
  { id: 'ernaehrung', titel: 'Ernährung',                frageIds: ['ernaehrungsstil', 'restriktionen', 'kochverhalten', 'mahlzeiten_pro_tag', 'auswaerts_essen', 'alkohol'] },
  { id: 'schlaf',     titel: 'Schlaf',                   frageIds: ['schlafdauer', 'aufwachgefuehl', 'schlaf_durchschlafen'] },
  { id: 'stress',     titel: 'Stress & Regeneration',    frageIds: ['stresslevel', 'entspannung', 'gedanken_abschalten'] },
  { id: 'verdauung',  titel: 'Verdauung & Befinden',     frageIds: ['verdauung_blaeungen', 'heisshunger'] },
  { id: 'abschluss',  titel: 'Medikamente & Ergänzungen', frageIds: ['medikamente', 'aktuelle_supplements'] },
];

export const FRAGEN_MAP = new Map<string, Frage>(FRAGEN.map((f) => [f.id, f]));

export function validateAnswers(
  input: any
): { ok: true; answers: Answers } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Antworten fehlen.' };

  const inSet = <T,>(v: any, set: T[]) => (set as unknown[]).includes(v);

  const g: Geschlecht[] = ['männlich', 'weiblich', 'divers'];
  const lvl: Trainingslevel[] = ['keine', 'gelegentlich', 'regelmaessig', 'intensiv'];
  const ziel: Trainingsziel[] = ['muskelaufbau', 'abnehmen', 'gesundheit', 'performance'];
  const ern: Ernaehrungsstil[] = ['omnivor', 'vegetarisch', 'vegan'];
  const restr: Restriktion[] = ['laktose', 'gluten', 'nuesse', 'keine'];
  const kochv: Kochverhalten[] = ['frisch', 'gemischt', 'fertiggerichte'];
  const mpt: MahlzeitenProTag[] = ['1_2', '3', '4_5', '6_plus'];
  const ae: AuswaertsEssen[] = ['selten', '1_2_woche', '3_4_woche', 'taeglich'];
  const alk: Alkohol[] = ['kein', 'gelegentlich', 'regelmaessig', 'taeglich'];
  const awg: Aufwachgefuehl[] = ['ausgeruht', 'energiereich', 'neutral', 'unausgeschlafen'];
  const sds: SchlafDurchschlafen[] = ['problemlos', 'gelegentlich', 'haeufig', 'einschlafen'];
  const stress: Stresslevel[] = ['niedrig', 'mittel', 'hoch'];
  const entsp: Entspannung[] = ['leicht', 'mit_aufwand', 'kaum'];
  const gas: GedankenAbschalten[] = ['ja', 'manchmal', 'selten'];
  const verdau: VerdauungBlaehungen[] = ['selten', 'gelegentlich', 'haeufig'];
  const heiss: Heisshunger[] = ['selten', 'gelegentlich_suess', 'gelegentlich_salzig', 'taeglich'];
  const meds: Medikament[] = ['blutdruck', 'blutzucker', 'schilddruese', 'pille', 'antidepressiva', 'keine'];

  if (!inSet(input.geschlecht, g)) return { ok: false, error: 'Ungültiges Geschlecht.' };
  if (typeof input.alter !== 'number' || input.alter < 14 || input.alter > 120)
    return { ok: false, error: 'Ungültiges Alter (14–120).' };
  if (!inSet(input.trainingslevel, lvl)) return { ok: false, error: 'Ungültiges Trainingslevel.' };
  if (!inSet(input.trainingsziel, ziel)) return { ok: false, error: 'Ungültiges Trainingsziel.' };
  if (!inSet(input.ernaehrungsstil, ern)) return { ok: false, error: 'Ungültiger Ernährungsstil.' };
  if (!inSet(input.kochverhalten, kochv)) return { ok: false, error: 'Ungültiges Kochverhalten.' };
  if (!inSet(input.mahlzeiten_pro_tag, mpt)) return { ok: false, error: 'Ungültige Mahlzeitenanzahl.' };
  if (!inSet(input.auswaerts_essen, ae)) return { ok: false, error: 'Ungültiger Wert für Auswärts-Essen.' };
  if (!inSet(input.alkohol, alk)) return { ok: false, error: 'Ungültiger Alkohol-Wert.' };
  if (typeof input.schlafdauer !== 'number' || input.schlafdauer < 1 || input.schlafdauer > 16)
    return { ok: false, error: 'Ungültige Schlafdauer (1–16 Stunden).' };
  if (!inSet(input.aufwachgefuehl, awg)) return { ok: false, error: 'Ungültiges Aufwachgefühl.' };
  if (!inSet(input.schlaf_durchschlafen, sds)) return { ok: false, error: 'Ungültiger Schlaf-Wert.' };
  if (!inSet(input.stresslevel, stress)) return { ok: false, error: 'Ungültiges Stresslevel.' };
  if (!inSet(input.entspannung, entsp)) return { ok: false, error: 'Ungültiger Entspannungs-Wert.' };
  if (!inSet(input.gedanken_abschalten, gas)) return { ok: false, error: 'Ungültiger Wert.' };
  if (!inSet(input.verdauung_blaeungen, verdau)) return { ok: false, error: 'Ungültiger Verdauungs-Wert.' };
  if (!inSet(input.heisshunger, heiss)) return { ok: false, error: 'Ungültiger Heißhunger-Wert.' };

  const restriktionen: Restriktion[] = Array.isArray(input.restriktionen)
    ? input.restriktionen.filter((r: any) => inSet(r, restr))
    : ['keine'];

  const medikamente: Medikament[] = Array.isArray(input.medikamente)
    ? input.medikamente.filter((m: any) => inSet(m, meds))
    : ['keine'];

  const aktuelle_supplements: string[] | undefined = Array.isArray(input.aktuelle_supplements)
    ? input.aktuelle_supplements.map((s: any) => String(s)).filter(Boolean)
    : undefined;

  return {
    ok: true,
    answers: {
      geschlecht: input.geschlecht,
      alter: input.alter,
      trainingslevel: input.trainingslevel,
      trainingsziel: input.trainingsziel,
      ernaehrungsstil: input.ernaehrungsstil,
      restriktionen: restriktionen.length ? restriktionen : ['keine'],
      kochverhalten: input.kochverhalten,
      mahlzeiten_pro_tag: input.mahlzeiten_pro_tag,
      auswaerts_essen: input.auswaerts_essen,
      alkohol: input.alkohol,
      schlafdauer: input.schlafdauer,
      aufwachgefuehl: input.aufwachgefuehl,
      schlaf_durchschlafen: input.schlaf_durchschlafen,
      stresslevel: input.stresslevel,
      entspannung: input.entspannung,
      gedanken_abschalten: input.gedanken_abschalten,
      verdauung_blaeungen: input.verdauung_blaeungen,
      heisshunger: input.heisshunger,
      medikamente: medikamente.length ? medikamente : ['keine'],
      aktuelle_supplements,
    },
  };
}
