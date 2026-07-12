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
      schlafqualitaet: 'schlecht',
      stresslevel: 'hoch',
    },
  },
  {
    titel: 'Frau, omnivor, Gesundheitsziel, mittlerer Stress, nimmt schon Vitamin D',
    answers: {
      geschlecht: 'weiblich',
      alter: 45,
      trainingslevel: 'gelegentlich',
      trainingsziel: 'gesundheit',
      ernaehrungsstil: 'omnivor',
      restriktionen: ['keine'],
      schlafqualitaet: 'mittel',
      stresslevel: 'mittel',
      aktuelle_supplements: ['Vitamin D3'],
    },
  },
  {
    titel: 'Vegetarier, Performance/Ausdauer, regelmäßiges Training, Laktose-Restriktion',
    answers: {
      geschlecht: 'divers',
      alter: 34,
      trainingslevel: 'regelmaessig',
      trainingsziel: 'performance',
      ernaehrungsstil: 'vegetarisch',
      restriktionen: ['laktose'],
      schlafqualitaet: 'gut',
      stresslevel: 'niedrig',
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
