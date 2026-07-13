// Supplemently — Test-Fixtures: spiegelt supabase/seed.sql.
// Damit läuft das Test-Skript offline & deterministisch (ohne DB).

import type { Supplement } from '../lib/matching';

let n = 0;
const id = () => `00000000-0000-0000-0000-${String(++n).padStart(12, '0')}`;

export const SUPPLEMENTS_FIXTURE: Supplement[] = [
  { id: id(), name: 'Omega-3 (EPA/DHA)', tier: 'basis', kategorie: 'Fettsäure', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '1000–2000 mg EPA+DHA täglich zu einer Mahlzeit.', kontraindikationen: 'Blutverdünnende Medikamente — vorher ärztlich abklären.', evidenzlevel: 5, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Magnesiumcitrat', tier: 'basis', kategorie: 'Mineralstoff', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '300–400 mg elementares Magnesium täglich, abends.', kontraindikationen: 'Stark eingeschränkte Nierenfunktion.', evidenzlevel: 4, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Vitamin D3', tier: 'basis', kategorie: 'Vitamin', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '1000–2000 IE täglich, besonders Okt–März.', kontraindikationen: 'Hyperkalzämie, Sarkoidose.', evidenzlevel: 5, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Zink', tier: 'basis', kategorie: 'Mineralstoff', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '10–15 mg täglich zu einer Mahlzeit.', kontraindikationen: 'Langfristige Hochdosis stört Kupferaufnahme.', evidenzlevel: 4, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Kreatin-Monohydrat', tier: 'advanced', kategorie: 'Aminosäure-Derivat', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '3–5 g täglich, Zeitpunkt egal.', kontraindikationen: 'Keine bekannten bei Gesunden; bei Nierenerkrankung Rücksprache.', evidenzlevel: 5, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Vitamin B12 (Methylcobalamin)', tier: 'basis', kategorie: 'Vitamin', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '250–500 µg täglich.', kontraindikationen: 'Keine relevanten bei üblicher Dosierung.', evidenzlevel: 4, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Eisenbisglycinat', tier: 'advanced', kategorie: 'Mineralstoff', zielgruppe: ['weiblich'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '14–25 mg täglich, nüchtern mit Vitamin C.', kontraindikationen: 'Hämochromatose, Eisenüberladung — nur bei nachgewiesenem Mangel.', evidenzlevel: 4, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Ashwagandha (KSM-66)', tier: 'advanced', kategorie: 'Pflanzenextrakt', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '300–600 mg Extrakt täglich.', kontraindikationen: 'Schilddrüsenüberfunktion, Schwangerschaft, Autoimmunerkrankungen.', evidenzlevel: 3, ist_kombipraeparat: false, inhaltsstoffe: [] },
  { id: id(), name: 'Multivitamin Sport', tier: 'addon', kategorie: 'Kombipräparat', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '1 Portion täglich zu einer Mahlzeit.', kontraindikationen: 'Vorsicht bei gleichzeitiger Einnahme weiterer Einzelpräparate (Überdosierung).', evidenzlevel: 3, ist_kombipraeparat: true, inhaltsstoffe: [ { name: 'Vitamin D3', menge_mg: 0.025 }, { name: 'Magnesium', menge_mg: 150 }, { name: 'Zink', menge_mg: 10 }, { name: 'Vitamin C', menge_mg: 200 }, { name: 'Vitamin B12', menge_mg: 0.0005 } ] },
  { id: id(), name: 'L-Citrullin Malat', tier: 'addon', kategorie: 'Aminosäure', zielgruppe: ['alle'], wirkung: null, bevorzugte_form: null, dosierung_empfehlung: '6–8 g etwa 45 min vor dem Training.', kontraindikationen: 'Keine relevanten bei Gesunden bekannt.', evidenzlevel: 3, ist_kombipraeparat: false, inhaltsstoffe: [] },
];
