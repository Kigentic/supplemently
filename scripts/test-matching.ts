// Supplemently — Test-Skript für die Matching-Logik.
// Läuft offline gegen Fixtures. Start: npm run test:match

import { match } from '../lib/matching';
import type { Answers } from '../lib/questions';
import { SUPPLEMENTS_FIXTURE } from './fixtures';

const cases: Array<{ titel: string; answers: Answers }> = [
  {
    titel: 'Veganer, intensiver Muskelaufbau, hoher Stress + schlechter Schlaf',
    answers: {
      geschlecht: 'männlich',
      alter: 28,
      trainingslevel: 'intensiv',
      trainingsziel: 'muskelaufbau',
      ernaehrungsstil: 'vegan',
      restriktionen: ['keine'],
      kochverhalten: 'frisch',
      mahlzeiten_pro_tag: '4_5',
      auswaerts_essen: 'selten',
      alkohol: 'kein',
      schlafdauer: 5,
      aufwachgefuehl: 'unausgeschlafen',
      schlaf_durchschlafen: 'haeufig',
      stresslevel: 'hoch',
      entspannung: 'kaum',
      gedanken_abschalten: 'selten',
      verdauung_blaeungen: 'selten',
      heisshunger: 'selten',
      medikamente: ['keine'],
    },
  },
  {
    titel: 'Frau, omnivor, Gesundheitsziel, mittlerer Stress, nimmt schon Vitamin D — Pille',
    answers: {
      geschlecht: 'weiblich',
      alter: 45,
      trainingslevel: 'gelegentlich',
      trainingsziel: 'gesundheit',
      ernaehrungsstil: 'omnivor',
      restriktionen: ['keine'],
      kochverhalten: 'gemischt',
      mahlzeiten_pro_tag: '3',
      auswaerts_essen: '1_2_woche',
      alkohol: 'gelegentlich',
      schlafdauer: 7,
      aufwachgefuehl: 'neutral',
      schlaf_durchschlafen: 'gelegentlich',
      stresslevel: 'mittel',
      entspannung: 'mit_aufwand',
      gedanken_abschalten: 'manchmal',
      verdauung_blaeungen: 'gelegentlich',
      heisshunger: 'gelegentlich_suess',
      medikamente: ['pille'],
      aktuelle_supplements: ['Vitamin D3'],
    },
  },
  {
    titel: 'Vegetarier, Performance/Ausdauer, regelmäßiges Training, Laktose, Fertiggerichte',
    answers: {
      geschlecht: 'divers',
      alter: 34,
      trainingslevel: 'regelmaessig',
      trainingsziel: 'performance',
      ernaehrungsstil: 'vegetarisch',
      restriktionen: ['laktose'],
      kochverhalten: 'fertiggerichte',
      mahlzeiten_pro_tag: '1_2',
      auswaerts_essen: '3_4_woche',
      alkohol: 'regelmaessig',
      schlafdauer: 8,
      aufwachgefuehl: 'ausgeruht',
      schlaf_durchschlafen: 'problemlos',
      stresslevel: 'niedrig',
      entspannung: 'leicht',
      gedanken_abschalten: 'ja',
      verdauung_blaeungen: 'haeufig',
      heisshunger: 'taeglich',
      medikamente: ['keine'],
    },
  },
];

function line(w: number) {
  return '─'.repeat(w);
}

for (const c of cases) {
  const res = match(c.answers, SUPPLEMENTS_FIXTURE);
  console.log('\n' + line(70));
  console.log('FALL: ' + c.titel);
  console.log(line(70));

  console.log('\n  ESSENZIELL:');
  if (!res.essenziell.length) console.log('    (keine über Schwellenwert)');
  for (const e of res.essenziell) {
    console.log(`    • ${e.name}  [score ${e.score}]`);
    console.log(`        Dosierung: ${e.dosierung}`);
    console.log(`        Begründung: ${e.begruendung}`);
  }

  console.log('\n  OPTIONAL:');
  if (!res.optional.length) console.log('    (keine)');
  for (const e of res.optional) {
    console.log(`    • ${e.name}  [score ${e.score}]`);
    console.log(`        Begründung: ${e.begruendung}`);
  }

  if (res.meta.ausgeschlossen.length) {
    console.log('\n  AUSGESCHLOSSEN:');
    for (const a of res.meta.ausgeschlossen) console.log(`    • ${a.name} — ${a.grund}`);
  }
}

console.log('\n' + line(70));
console.log('DISCLAIMER: ' + match(cases[0].answers, SUPPLEMENTS_FIXTURE).disclaimer);
console.log(line(70) + '\n');
