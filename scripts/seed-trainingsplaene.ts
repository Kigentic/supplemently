// Einmal-/Re-Seed-Skript für das globale Trainingsplan-Repertoire.
// Inhalt ist bewusst geschlechtsneutral identisch (gleiche Übungsauswahl für
// maennlich/weiblich) — die Trennung in der Datenbank existiert, damit sie
// später bei Bedarf divergieren kann, ohne die Struktur ändern zu müssen.
// Aufruf: npm run seed:trainingsplaene
import { getServiceClient } from '../lib/supabaseServer';

type Level = 'beginner' | 'fortgeschritten' | 'advanced';
type Block = 'warmup' | 'haupt' | 'finisher' | 'cooldown';

interface UebungSeed {
  block: Block;
  name: string;
  saetze?: number;
  wiederholungen?: string;
  pause_sekunden?: number;
  lastvorgabe?: string;
  hinweis?: string;
}

interface PlanSeed {
  level: Level;
  phase: 1 | 2;
  variante: 1 | 2;
  name: string;
  uebungen: UebungSeed[];
}

const RPE_MODERAT = 'Gewicht/Widerstand so wählen, dass die letzten 2 Wdh. anstrengend, aber technisch sauber sind.';
const RPE_HOCH = 'Gewicht so wählen, dass die letzten 1-2 Wdh. nur mit sauberer Technik gerade noch möglich sind (RPE 8).';

function warmup(name: string, dauer = '8 Min.'): UebungSeed {
  return { block: 'warmup', name, wiederholungen: dauer };
}
function cooldown(name = 'Dehnen: Beinrückseite, Brust, Schultern', dauer = '5 Min.'): UebungSeed {
  return { block: 'cooldown', name, wiederholungen: dauer };
}

const PLANS: PlanSeed[] = [
  // ── BEGINNER ────────────────────────────────────────────────────────────
  {
    level: 'beginner', phase: 1, variante: 1, name: 'Beginner · Ganzkörper A',
    uebungen: [
      warmup('Gelenkkreisen + lockeres Gehen/Radfahren'),
      { block: 'haupt', name: 'Kniebeuge (Körpergewicht)', saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, hinweis: 'Knie zeigen in Fußrichtung, Brust aufrecht.' },
      { block: 'haupt', name: 'Liegestütz an der Wand oder auf Knien', saetze: 3, wiederholungen: '8-10', pause_sekunden: 60 },
      { block: 'haupt', name: 'Rudern vorgebeugt (Kurzhantel/Band)', saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Hüftheben (Glute Bridge)', saetze: 3, wiederholungen: '12-15', pause_sekunden: 45 },
      { block: 'haupt', name: 'Ausfallschritt stationär', saetze: 2, wiederholungen: '8 je Seite', pause_sekunden: 60 },
      { block: 'finisher', name: 'Unterarmstütz (Plank)', saetze: 3, wiederholungen: '20-30 Sek.', pause_sekunden: 30 },
      cooldown(),
    ],
  },
  {
    level: 'beginner', phase: 1, variante: 2, name: 'Beginner · Ganzkörper B',
    uebungen: [
      warmup('Marschieren auf der Stelle + Mobility'),
      { block: 'haupt', name: 'Goblet Squat (leichte Kurzhantel)', saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Knie-Liegestütz', saetze: 3, wiederholungen: '8-10', pause_sekunden: 60 },
      { block: 'haupt', name: 'Rudern am Band oder TRX', saetze: 3, wiederholungen: '10-12', pause_sekunden: 60 },
      { block: 'haupt', name: 'Standwaage / Single-Leg Deadlift ohne Gewicht', saetze: 2, wiederholungen: '8 je Seite', pause_sekunden: 60, hinweis: 'Langsam, kontrolliert — Balance vor Tempo.' },
      { block: 'haupt', name: 'Seitheben (leichte Kurzhanteln)', saetze: 2, wiederholungen: '12', pause_sekunden: 45 },
      { block: 'finisher', name: 'Bird-Dog', saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 30 },
      cooldown(),
    ],
  },
  {
    level: 'beginner', phase: 2, variante: 1, name: 'Beginner · Ganzkörper A (Fortsetzung)',
    uebungen: [
      warmup('Gelenkkreisen + lockeres Gehen/Radfahren'),
      { block: 'haupt', name: 'Kniebeuge mit leichter Kurzhantel vor der Brust', saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Liegestütz auf Knien', saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, hinweis: 'Fortschritt von der Wand-Variante.' },
      { block: 'haupt', name: 'Rudern vorgebeugt (Kurzhantel)', saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Hüftheben einbeinig', saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 45 },
      { block: 'haupt', name: 'Ausfallschritt gehend', saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 60 },
      { block: 'finisher', name: 'Unterarmstütz (Plank)', saetze: 3, wiederholungen: '30-40 Sek.', pause_sekunden: 30 },
      cooldown(),
    ],
  },
  {
    level: 'beginner', phase: 2, variante: 2, name: 'Beginner · Ganzkörper B (Fortsetzung)',
    uebungen: [
      warmup('Marschieren auf der Stelle + Mobility'),
      { block: 'haupt', name: 'Goblet Squat (etwas schwerere Kurzhantel)', saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Liegestütz (Knie, mehr Wdh.)', saetze: 3, wiederholungen: '10-12', pause_sekunden: 60 },
      { block: 'haupt', name: 'Rudern am Band oder TRX', saetze: 3, wiederholungen: '12-15', pause_sekunden: 60 },
      { block: 'haupt', name: 'Single-Leg Deadlift mit leichter Kurzhantel', saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 60 },
      { block: 'haupt', name: 'Seitheben + Frontheben (Superset)', saetze: 2, wiederholungen: '12 je Übung', pause_sekunden: 45 },
      { block: 'finisher', name: 'Bird-Dog', saetze: 3, wiederholungen: '12 je Seite', pause_sekunden: 30 },
      cooldown(),
    ],
  },

  // ── FORTGESCHRITTEN ─────────────────────────────────────────────────────
  {
    level: 'fortgeschritten', phase: 1, variante: 1, name: 'Fortgeschritten · Ganzkörper A',
    uebungen: [
      warmup('Rudergerät/Radfahren locker + Mobility'),
      { block: 'haupt', name: 'Kniebeuge (Langhantel oder schwere Kurzhanteln)', saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Bankdrücken (Kurz-/Langhantel)', saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Rudern vorgebeugt (Lang-/Kurzhantel)', saetze: 3, wiederholungen: '10-12', pause_sekunden: 75 },
      { block: 'haupt', name: 'Schulterdrücken (Kurzhantel)', saetze: 3, wiederholungen: '10-12', pause_sekunden: 75 },
      { block: 'haupt', name: 'Ausfallschritte mit Kurzhanteln', saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 60 },
      { block: 'finisher', name: 'Unterarmstütz mit Schulterberührung', saetze: 3, wiederholungen: '12 je Seite', pause_sekunden: 30 },
      cooldown(),
    ],
  },
  {
    level: 'fortgeschritten', phase: 1, variante: 2, name: 'Fortgeschritten · Ganzkörper B',
    uebungen: [
      warmup('Seilspringen + Mobility'),
      { block: 'haupt', name: 'Beinpresse oder Kniebeuge im Rack', saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Schrägbankdrücken (Kurzhantel)', saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, lastvorgabe: RPE_MODERAT },
      { block: 'haupt', name: 'Latzug breit', saetze: 3, wiederholungen: '10-12', pause_sekunden: 75 },
      { block: 'haupt', name: 'Arnold Press', saetze: 3, wiederholungen: '10-12', pause_sekunden: 75 },
      { block: 'haupt', name: 'Rumänisches Kreuzheben (Kurzhantel)', saetze: 3, wiederholungen: '10-12', pause_sekunden: 75, hinweis: 'Rücken gerade, Bewegung kommt aus der Hüfte.' },
      { block: 'finisher', name: 'Russian Twist mit Gewicht', saetze: 3, wiederholungen: '15 je Seite', pause_sekunden: 30 },
      cooldown(),
    ],
  },
  {
    level: 'fortgeschritten', phase: 2, variante: 1, name: 'Fortgeschritten · Ganzkörper A (Fortsetzung)',
    uebungen: [
      warmup('Rudergerät/Radfahren locker + Mobility'),
      { block: 'haupt', name: 'Kniebeuge (Langhantel oder schwere Kurzhanteln)', saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_HOCH, hinweis: 'Mehr Volumen als Phase 1 — Gewicht bei Bedarf leicht reduzieren.' },
      { block: 'haupt', name: 'Bankdrücken (Kurz-/Langhantel)', saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Klimmzüge (unterstützt) oder Latzug eng', saetze: 4, wiederholungen: '8-10', pause_sekunden: 90 },
      { block: 'haupt', name: 'Schulterdrücken stehend', saetze: 3, wiederholungen: '10-12', pause_sekunden: 75 },
      { block: 'haupt', name: 'Bulgarian Split Squat', saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 75, hinweis: 'Hinteres Bein erhöht auf Bank ablegen.' },
      { block: 'finisher', name: 'Plank mit Beinheben', saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 30 },
      cooldown(),
    ],
  },
  {
    level: 'fortgeschritten', phase: 2, variante: 2, name: 'Fortgeschritten · Ganzkörper B (Fortsetzung)',
    uebungen: [
      warmup('Seilspringen + Mobility'),
      { block: 'haupt', name: 'Frontkniebeuge oder Goblet Squat (schwer)', saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Liegestütz erhöht oder mit Zusatzgewicht', saetze: 4, wiederholungen: '10-12', pause_sekunden: 90 },
      { block: 'haupt', name: 'Rudern einarmig (Kurzhantel)', saetze: 3, wiederholungen: '10-12 je Seite', pause_sekunden: 75 },
      { block: 'haupt', name: 'Seitheben + Frontheben (Superset)', saetze: 3, wiederholungen: '12 je Übung', pause_sekunden: 60 },
      { block: 'haupt', name: 'Ausfallschritte rückwärts mit Kurzhanteln', saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 75 },
      { block: 'finisher', name: 'Side Plank', saetze: 3, wiederholungen: '20-30 Sek. je Seite', pause_sekunden: 30 },
      cooldown(),
    ],
  },

  // ── ADVANCED ────────────────────────────────────────────────────────────
  {
    level: 'advanced', phase: 1, variante: 1, name: 'Advanced · Kraft A',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      { block: 'haupt', name: 'Kniebeuge (Langhantel)', saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Kreuzheben (Langhantel)', saetze: 4, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'Technik geht vor Gewicht — bei Unsicherheit Satz abbrechen.' },
      { block: 'haupt', name: 'Bankdrücken (Langhantel)', saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Klimmzüge (mit Zusatzgewicht wenn möglich)', saetze: 4, wiederholungen: '6-8', pause_sekunden: 90 },
      { block: 'haupt', name: 'Schulterdrücken stehend (Langhantel)', saetze: 3, wiederholungen: '8-10', pause_sekunden: 75 },
      { block: 'finisher', name: 'Hanging Leg Raise', saetze: 3, wiederholungen: '10-12', pause_sekunden: 45 },
      cooldown(),
    ],
  },
  {
    level: 'advanced', phase: 1, variante: 2, name: 'Advanced · Kraft B',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      { block: 'haupt', name: 'Frontkniebeuge', saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Rumänisches Kreuzheben', saetze: 4, wiederholungen: '6-8', pause_sekunden: 105 },
      { block: 'haupt', name: 'Schrägbankdrücken (Langhantel)', saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Rudern vorgebeugt (Langhantel)', saetze: 4, wiederholungen: '8-10', pause_sekunden: 90 },
      { block: 'haupt', name: 'Ausfallschritte mit Langhantel', saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 75 },
      { block: 'finisher', name: 'Ab Wheel Rollout oder Plank mit Zusatzgewicht', saetze: 3, wiederholungen: '10', pause_sekunden: 45 },
      cooldown(),
    ],
  },
  {
    level: 'advanced', phase: 2, variante: 1, name: 'Advanced · Kraft A (Fortsetzung)',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      { block: 'haupt', name: 'Kniebeuge (Langhantel, Gewicht steigern)', saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'Ziel: mehr Gewicht als in Phase 1 bei gleicher Wiederholungszahl.' },
      { block: 'haupt', name: 'Kreuzheben (Langhantel, Gewicht steigern)', saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Bankdrücken (Langhantel, Gewicht steigern)', saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Klimmzüge mit Zusatzgewicht', saetze: 4, wiederholungen: '6-8', pause_sekunden: 90 },
      { block: 'haupt', name: 'Bulgarian Split Squat (Kurzhantel/Langhantel)', saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 75 },
      { block: 'finisher', name: 'Hanging Leg Raise mit Pause oben', saetze: 3, wiederholungen: '12', pause_sekunden: 45 },
      cooldown(),
    ],
  },
  {
    level: 'advanced', phase: 2, variante: 2, name: 'Advanced · Kraft B (Fortsetzung)',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      { block: 'haupt', name: 'Frontkniebeuge (schwerer)', saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Rumänisches Kreuzheben (schwerer)', saetze: 4, wiederholungen: '6-8', pause_sekunden: 105, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Schrägbankdrücken (Langhantel, schwerer)', saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH },
      { block: 'haupt', name: 'Klimmzüge eng (Chin-ups)', saetze: 4, wiederholungen: '8-10', pause_sekunden: 90 },
      { block: 'haupt', name: 'Ausfallschritte mit Langhantel, gehend', saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 75 },
      { block: 'finisher', name: 'Ab Wheel Rollout', saetze: 3, wiederholungen: '10-12', pause_sekunden: 45 },
      cooldown(),
    ],
  },
];

async function main() {
  const supabase = getServiceClient();

  for (const geschlecht of ['maennlich', 'weiblich'] as const) {
    for (const plan of PLANS) {
      // Vorherige Version löschen (cascade räumt Übungen mit auf) — Skript
      // ist damit gefahrlos wiederholbar.
      await supabase
        .from('trainingsplaene')
        .delete()
        .match({ geschlecht, level: plan.level, phase: plan.phase, variante: plan.variante });

      const { data: row, error } = await supabase
        .from('trainingsplaene')
        .insert({ geschlecht, level: plan.level, phase: plan.phase, variante: plan.variante, name: plan.name })
        .select('id')
        .single();
      if (error || !row) {
        throw new Error(`Konnte Plan "${plan.name}" (${geschlecht}) nicht anlegen: ${error?.message}`);
      }

      const rows = plan.uebungen.map((u, i) => ({
        trainingsplan_id: row.id,
        sort_order: i,
        block: u.block,
        name: u.name,
        saetze: u.saetze ?? null,
        wiederholungen: u.wiederholungen ?? null,
        pause_sekunden: u.pause_sekunden ?? null,
        lastvorgabe: u.lastvorgabe ?? null,
        hinweis: u.hinweis ?? null,
      }));
      const { error: insertError } = await supabase.from('trainingsplan_uebungen').insert(rows);
      if (insertError) throw new Error(`Übungen für "${plan.name}" (${geschlecht}) fehlgeschlagen: ${insertError.message}`);

      console.log(`✓ ${geschlecht} · ${plan.name} (Phase ${plan.phase}, Variante ${plan.variante}) — ${rows.length} Übungen`);
    }
  }

  console.log(`Fertig: ${2 * PLANS.length} Trainingspläne.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
