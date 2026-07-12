// Supplemently — Fragenkatalog + Typen (Stage 2)
// Fester Bestandteil der Logik. Zentral gepflegt, kein UI-Code hier.

export type Geschlecht = 'männlich' | 'weiblich' | 'divers';
export type Trainingslevel = 'keine' | 'gelegentlich' | 'regelmaessig' | 'intensiv';
export type Trainingsziel = 'muskelaufbau' | 'abnehmen' | 'gesundheit' | 'performance';
export type Ernaehrungsstil = 'omnivor' | 'vegetarisch' | 'vegan';
export type Restriktion = 'laktose' | 'gluten' | 'nuesse' | 'keine';
export type Schlafqualitaet = 'gut' | 'mittel' | 'schlecht';
export type Stresslevel = 'niedrig' | 'mittel' | 'hoch';

// Die 9 Fragebogen-Antworten.
export interface Answers {
  geschlecht: Geschlecht;
  alter: number;
  trainingslevel: Trainingslevel;
  trainingsziel: Trainingsziel;
  ernaehrungsstil: Ernaehrungsstil;
  restriktionen: Restriktion[];        // Mehrfachauswahl; ['keine'] wenn nichts
  schlafqualitaet: Schlafqualitaet;
  stresslevel: Stresslevel;
  aktuelle_supplements?: string[];      // optional, Freitext-Tokens
}

// Katalog fuer spaeteres Frontend (Stage 3) — zentral definiert.
export const FRAGEN = [
  {
    id: 'geschlecht',
    frage: 'Geschlecht',
    typ: 'single',
    optionen: [
      { value: 'männlich', label: 'Männlich' },
      { value: 'weiblich', label: 'Weiblich' },
      { value: 'divers', label: 'Divers' },
    ],
  },
  { id: 'alter', frage: 'Alter', typ: 'number' },
  {
    id: 'trainingslevel',
    frage: 'Trainingslevel',
    typ: 'single',
    optionen: [
      { value: 'keine', label: 'Keine Aktivität' },
      { value: 'gelegentlich', label: 'Gelegentlich' },
      { value: 'regelmaessig', label: 'Regelmäßig 3–4x/Woche' },
      { value: 'intensiv', label: 'Sehr intensiv 5+/Woche' },
    ],
  },
  {
    id: 'trainingsziel',
    frage: 'Trainingsziel',
    typ: 'single',
    optionen: [
      { value: 'muskelaufbau', label: 'Muskelaufbau' },
      { value: 'abnehmen', label: 'Abnehmen' },
      { value: 'gesundheit', label: 'Allgemeine Gesundheit' },
      { value: 'performance', label: 'Performance / Ausdauer' },
    ],
  },
  {
    id: 'ernaehrungsstil',
    frage: 'Ernährungsstil',
    typ: 'single',
    optionen: [
      { value: 'omnivor', label: 'Omnivor' },
      { value: 'vegetarisch', label: 'Vegetarisch' },
      { value: 'vegan', label: 'Vegan' },
    ],
  },
  {
    id: 'restriktionen',
    frage: 'Bekannte Restriktionen / Allergien',
    typ: 'multi',
    optionen: [
      { value: 'laktose', label: 'Laktose' },
      { value: 'gluten', label: 'Gluten' },
      { value: 'nuesse', label: 'Nüsse' },
      { value: 'keine', label: 'Keine' },
    ],
  },
  {
    id: 'schlafqualitaet',
    frage: 'Schlafqualität',
    typ: 'single',
    optionen: [
      { value: 'gut', label: 'Gut' },
      { value: 'mittel', label: 'Mittel' },
      { value: 'schlecht', label: 'Schlecht' },
    ],
  },
  {
    id: 'stresslevel',
    frage: 'Stresslevel',
    typ: 'single',
    optionen: [
      { value: 'niedrig', label: 'Niedrig' },
      { value: 'mittel', label: 'Mittel' },
      { value: 'hoch', label: 'Hoch' },
    ],
  },
  {
    id: 'aktuelle_supplements',
    frage: 'Aktuell eingenommene Supplements (optional)',
    typ: 'multi_freetext',
    optionen: [],
  },
] as const;

// Basis-Validierung der Antworten (Server-seitig vor Scoring).
export function validateAnswers(input: any): { ok: true; answers: Answers } | { ok: false; error: string } {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Antworten fehlen.' };

  const g: Geschlecht[] = ['männlich', 'weiblich', 'divers'];
  const lvl: Trainingslevel[] = ['keine', 'gelegentlich', 'regelmaessig', 'intensiv'];
  const ziel: Trainingsziel[] = ['muskelaufbau', 'abnehmen', 'gesundheit', 'performance'];
  const ern: Ernaehrungsstil[] = ['omnivor', 'vegetarisch', 'vegan'];
  const sq: Schlafqualitaet[] = ['gut', 'mittel', 'schlecht'];
  const stress: Stresslevel[] = ['niedrig', 'mittel', 'hoch'];
  const restr: Restriktion[] = ['laktose', 'gluten', 'nuesse', 'keine'];

  const inSet = <T,>(v: any, set: readonly T[]) => set.includes(v);

  if (!inSet(input.geschlecht, g)) return { ok: false, error: 'Ungültiges Geschlecht.' };
  if (typeof input.alter !== 'number' || input.alter < 14 || input.alter > 120)
    return { ok: false, error: 'Ungültiges Alter.' };
  if (!inSet(input.trainingslevel, lvl)) return { ok: false, error: 'Ungültiges Trainingslevel.' };
  if (!inSet(input.trainingsziel, ziel)) return { ok: false, error: 'Ungültiges Trainingsziel.' };
  if (!inSet(input.ernaehrungsstil, ern)) return { ok: false, error: 'Ungültiger Ernährungsstil.' };
  if (!inSet(input.schlafqualitaet, sq)) return { ok: false, error: 'Ungültige Schlafqualität.' };
  if (!inSet(input.stresslevel, stress)) return { ok: false, error: 'Ungültiges Stresslevel.' };

  const restriktionen: Restriktion[] = Array.isArray(input.restriktionen)
    ? input.restriktionen.filter((r: any) => inSet(r, restr))
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
      schlafqualitaet: input.schlafqualitaet,
      stresslevel: input.stresslevel,
      aktuelle_supplements,
    },
  };
}
