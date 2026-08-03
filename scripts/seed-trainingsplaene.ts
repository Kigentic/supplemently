// Einmal-/Re-Seed-Skript für das globale Trainingsplan-Repertoire.
// Haupt-/Finisher-Übungen referenzieren die kanonische Übungsbibliothek
// (scripts/seed-uebungsbibliothek.ts — VOR diesem Skript laufen lassen).
// Inhalt ist bewusst geschlechtsneutral identisch (gleiche Übungsauswahl für
// maennlich/weiblich) — die Trennung in der Datenbank existiert, damit sie
// später bei Bedarf divergieren kann, ohne die Struktur ändern zu müssen.
// Aufruf: npm run seed:trainingsplaene
import { getServiceClient } from '../lib/supabaseServer';

type Level = 'beginner' | 'fortgeschritten' | 'advanced';
type Block = 'warmup' | 'haupt' | 'finisher' | 'cooldown';

interface UebungSeed {
  block: Block;
  /** Name aus der Übungsbibliothek (uebungsbibliothek.name) — für warmup/cooldown null, dort zählt freitext. */
  uebungName?: string;
  /** Nur für warmup/cooldown (kein Bibliothekseintrag). */
  freitext?: string;
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

function warmup(freitext: string, wiederholungen = '8 Min.'): UebungSeed {
  return { block: 'warmup', freitext, wiederholungen };
}
function cooldown(freitext = 'Dehnen: Beinrückseite, Brust, Schultern', wiederholungen = '5 Min.'): UebungSeed {
  return { block: 'cooldown', freitext, wiederholungen };
}
function uebung(uebungName: string, opts: Omit<UebungSeed, 'block' | 'uebungName'>): UebungSeed {
  return { block: 'haupt', uebungName, ...opts };
}
function finisher(uebungName: string, opts: Omit<UebungSeed, 'block' | 'uebungName'>): UebungSeed {
  return { block: 'finisher', uebungName, ...opts };
}

const PLANS: PlanSeed[] = [
  // ── BEGINNER ────────────────────────────────────────────────────────────
  {
    level: 'beginner', phase: 1, variante: 1, name: 'Beginner · Ganzkörper A',
    uebungen: [
      warmup('Gelenkkreisen + lockeres Gehen/Radfahren'),
      uebung('Kniebeugen (Squats)', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, hinweis: 'Nur Körpergewicht — Knie zeigen in Fußrichtung, Brust aufrecht.' }),
      uebung('Liegestütze (Push-ups)', { saetze: 3, wiederholungen: '8-10', pause_sekunden: 60, hinweis: 'An der Wand oder auf den Knien.' }),
      uebung('Rudern sitzend', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, lastvorgabe: RPE_MODERAT }),
      uebung('Hip Thrusts / Beckenheben', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 45, hinweis: 'Ohne oder mit sehr leichtem Zusatzgewicht.' }),
      uebung('Ausfallschritte (Lunges)', { saetze: 2, wiederholungen: '8 je Seite', pause_sekunden: 60, hinweis: 'Stationär, ohne Gewicht.' }),
      finisher('Plank (Unterarmstütz)', { saetze: 3, wiederholungen: '20-30 Sek.', pause_sekunden: 30 }),
      cooldown(),
    ],
  },
  {
    level: 'beginner', phase: 1, variante: 2, name: 'Beginner · Ganzkörper B',
    uebungen: [
      warmup('Marschieren auf der Stelle + Mobility'),
      uebung('Beinpresse (Leg Press)', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, lastvorgabe: RPE_MODERAT }),
      uebung('Bankdrücken (Flachbank)', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, hinweis: 'An der Brustpresse — geführt und beginnerfreundlich.' }),
      uebung('Latzug zum Nacken / zur Brust', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, hinweis: 'Breiter Griff, zur Brust.' }),
      uebung('Beinbeugen (Leg Curl)', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 45 }),
      uebung('Schulterdrücken / Military Press', { saetze: 2, wiederholungen: '12', pause_sekunden: 45, hinweis: 'Leichte Kurzhanteln oder Maschine.' }),
      finisher('Crunches', { saetze: 3, wiederholungen: '15', pause_sekunden: 30 }),
      cooldown(),
    ],
  },
  {
    level: 'beginner', phase: 2, variante: 1, name: 'Beginner · Ganzkörper A (Fortsetzung)',
    uebungen: [
      warmup('Gelenkkreisen + lockeres Gehen/Radfahren'),
      uebung('Kniebeugen (Squats)', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, lastvorgabe: RPE_MODERAT, hinweis: 'Jetzt mit leichter Kurzhantel vor der Brust.' }),
      uebung('Liegestütze (Push-ups)', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 60, hinweis: 'Fortschritt: auf den Knien statt an der Wand.' }),
      uebung('Rudern sitzend', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, lastvorgabe: RPE_MODERAT }),
      uebung('Hip Thrusts / Beckenheben', { saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 45, hinweis: 'Einbeinige Variante.' }),
      uebung('Ausfallschritte (Lunges)', { saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 60, hinweis: 'Jetzt gehend statt stationär.' }),
      finisher('Plank (Unterarmstütz)', { saetze: 3, wiederholungen: '30-40 Sek.', pause_sekunden: 30 }),
      cooldown(),
    ],
  },
  {
    level: 'beginner', phase: 2, variante: 2, name: 'Beginner · Ganzkörper B (Fortsetzung)',
    uebungen: [
      warmup('Marschieren auf der Stelle + Mobility'),
      uebung('Beinpresse (Leg Press)', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, lastvorgabe: RPE_MODERAT }),
      uebung('Bankdrücken (Flachbank)', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, hinweis: 'An der Brustpresse, etwas mehr Gewicht.' }),
      uebung('Latzug zum Nacken / zur Brust', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 60, hinweis: 'Enger Griff als Abwechslung.' }),
      uebung('Beinbeugen (Leg Curl)', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 45 }),
      uebung('Schulterdrücken / Military Press', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 45 }),
      finisher('Crunches', { saetze: 3, wiederholungen: '15-20', pause_sekunden: 30 }),
      cooldown(),
    ],
  },

  // ── FORTGESCHRITTEN ─────────────────────────────────────────────────────
  {
    level: 'fortgeschritten', phase: 1, variante: 1, name: 'Fortgeschritten · Ganzkörper A',
    uebungen: [
      warmup('Rudergerät/Radfahren locker + Mobility'),
      uebung('Kniebeugen (Squats)', { saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, lastvorgabe: RPE_MODERAT, hinweis: 'Langhantel oder Multipresse.' }),
      uebung('Bankdrücken (Flachbank)', { saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, lastvorgabe: RPE_MODERAT, hinweis: 'Kurz- oder Langhantel.' }),
      uebung('Vorgebeugtes Langhantelrudern', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 75 }),
      uebung('Schulterdrücken / Military Press', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 75, hinweis: 'Kurzhanteln, sitzend oder stehend.' }),
      uebung('Ausfallschritte (Lunges)', { saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 60, hinweis: 'Mit Kurzhanteln.' }),
      finisher('Face Pulls', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 30 }),
      cooldown(),
    ],
  },
  {
    level: 'fortgeschritten', phase: 1, variante: 2, name: 'Fortgeschritten · Ganzkörper B',
    uebungen: [
      warmup('Seilspringen + Mobility'),
      uebung('Beinpresse (Leg Press)', { saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_MODERAT }),
      uebung('Schrägbankdrücken', { saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, lastvorgabe: RPE_MODERAT, hinweis: 'Kurzhantel.' }),
      uebung('Latzug zum Nacken / zur Brust', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 75, hinweis: 'Breiter Griff.' }),
      uebung('Rumänisches Kreuzheben (RDL)', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 75, hinweis: 'Kurzhantel, Rücken gerade, Bewegung aus der Hüfte.' }),
      uebung('Trizepsdrücken / Kabel-Pushdowns', { saetze: 3, wiederholungen: '12-15', pause_sekunden: 60 }),
      finisher('Russian Twists', { saetze: 3, wiederholungen: '15 je Seite', pause_sekunden: 30 }),
      cooldown(),
    ],
  },
  {
    level: 'fortgeschritten', phase: 2, variante: 1, name: 'Fortgeschritten · Ganzkörper A (Fortsetzung)',
    uebungen: [
      warmup('Rudergerät/Radfahren locker + Mobility'),
      uebung('Kniebeugen (Squats)', { saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_HOCH, hinweis: 'Mehr Volumen als Phase 1 — Gewicht bei Bedarf leicht reduzieren.' }),
      uebung('Bankdrücken (Flachbank)', { saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_HOCH }),
      uebung('Klimmzüge (Pull-ups / Chin-ups)', { saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, hinweis: 'Mit Maschinengewicht-Unterstützung falls nötig.' }),
      uebung('Schulterdrücken / Military Press', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 75, hinweis: 'Stehend statt sitzend.' }),
      uebung('Rumänisches Kreuzheben (RDL)', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 75, lastvorgabe: RPE_MODERAT }),
      finisher('Beinheben', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 30, hinweis: 'Hängend an der Klimmzugstange oder im Dip-Ständer.' }),
      cooldown(),
    ],
  },
  {
    level: 'fortgeschritten', phase: 2, variante: 2, name: 'Fortgeschritten · Ganzkörper B (Fortsetzung)',
    uebungen: [
      warmup('Seilspringen + Mobility'),
      uebung('Beinpresse (Leg Press)', { saetze: 4, wiederholungen: '10-12', pause_sekunden: 90, lastvorgabe: RPE_HOCH }),
      uebung('Schrägbankdrücken', { saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, lastvorgabe: RPE_HOCH }),
      uebung('Einarmiges Kurzhantelrudern', { saetze: 3, wiederholungen: '10-12 je Seite', pause_sekunden: 75, hinweis: 'Auf der Flachbank abgestützt.' }),
      uebung('Seitheben', { saetze: 3, wiederholungen: '12', pause_sekunden: 45, hinweis: 'Im Wechsel mit Frontheben als Superset.' }),
      uebung('Ausfallschritte (Lunges)', { saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 75, hinweis: 'Rückwärts, mit Kurzhanteln.' }),
      finisher('Rumpfdrehen (Rotary Torso)', { saetze: 3, wiederholungen: '12 je Seite', pause_sekunden: 30 }),
      cooldown(),
    ],
  },

  // ── ADVANCED ────────────────────────────────────────────────────────────
  {
    level: 'advanced', phase: 1, variante: 1, name: 'Advanced · Kraft A',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      uebung('Kniebeugen (Squats)', { saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'Langhantel.' }),
      uebung('Kreuzheben (Deadlift)', { saetze: 4, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'Technik geht vor Gewicht — bei Unsicherheit Satz abbrechen.' }),
      uebung('Bankdrücken (Flachbank)', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH, hinweis: 'Langhantel.' }),
      uebung('Klimmzüge (Pull-ups / Chin-ups)', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, hinweis: 'Mit Zusatzgewicht wenn möglich.' }),
      uebung('Schulterdrücken / Military Press', { saetze: 3, wiederholungen: '8-10', pause_sekunden: 75, hinweis: 'Langhantel, stehend.' }),
      finisher('Beinheben', { saetze: 3, wiederholungen: '10-12', pause_sekunden: 45, hinweis: 'Hängend an der Klimmzugstange.' }),
      cooldown(),
    ],
  },
  {
    level: 'advanced', phase: 1, variante: 2, name: 'Advanced · Kraft B',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      uebung('Kniebeugen (Squats)', { saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'An der Multipresse als Abwechslung.' }),
      uebung('Rumänisches Kreuzheben (RDL)', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 105, hinweis: 'Langhantel.' }),
      uebung('Schrägbankdrücken', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH, hinweis: 'Langhantel.' }),
      uebung('Vorgebeugtes Langhantelrudern', { saetze: 4, wiederholungen: '8-10', pause_sekunden: 90 }),
      uebung('Ausfallschritte (Lunges)', { saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 75, hinweis: 'Mit Langhantel.' }),
      finisher('Ab-Wheel Rollouts', { saetze: 3, wiederholungen: '10', pause_sekunden: 45 }),
      cooldown(),
    ],
  },
  {
    level: 'advanced', phase: 2, variante: 1, name: 'Advanced · Kraft A (Fortsetzung)',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      uebung('Kniebeugen (Squats)', { saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'Ziel: mehr Gewicht als in Phase 1 bei gleicher Wiederholungszahl.' }),
      uebung('Kreuzheben (Deadlift)', { saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'Gewicht steigern.' }),
      uebung('Bankdrücken (Flachbank)', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH, hinweis: 'Gewicht steigern.' }),
      uebung('Klimmzüge (Pull-ups / Chin-ups)', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, hinweis: 'Mit mehr Zusatzgewicht als Phase 1.' }),
      uebung('Ausfallschritte (Lunges)', { saetze: 3, wiederholungen: '8 je Seite', pause_sekunden: 75, hinweis: 'Mit Langhantel, schwerer als Phase 1.' }),
      finisher('Beinheben', { saetze: 3, wiederholungen: '12', pause_sekunden: 45, hinweis: 'Mit kurzer Pause in der oberen Position.' }),
      cooldown(),
    ],
  },
  {
    level: 'advanced', phase: 2, variante: 2, name: 'Advanced · Kraft B (Fortsetzung)',
    uebungen: [
      warmup('Rudergerät/Airbike kurz + dynamische Mobility'),
      uebung('Kniebeugen (Squats)', { saetze: 5, wiederholungen: '5', pause_sekunden: 120, lastvorgabe: RPE_HOCH, hinweis: 'An der Multipresse, schwerer als Phase 1.' }),
      uebung('Rumänisches Kreuzheben (RDL)', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 105, lastvorgabe: RPE_HOCH, hinweis: 'Langhantel, schwerer.' }),
      uebung('Schrägbankdrücken', { saetze: 4, wiederholungen: '6-8', pause_sekunden: 90, lastvorgabe: RPE_HOCH, hinweis: 'Langhantel, schwerer.' }),
      uebung('Klimmzüge (Pull-ups / Chin-ups)', { saetze: 4, wiederholungen: '8-10', pause_sekunden: 90, hinweis: 'Enger Griff (Chin-ups) als Abwechslung.' }),
      uebung('Ausfallschritte (Lunges)', { saetze: 3, wiederholungen: '10 je Seite', pause_sekunden: 75, hinweis: 'Gehend, mit Langhantel.' }),
      finisher('Ab-Wheel Rollouts', { saetze: 3, wiederholungen: '12', pause_sekunden: 45 }),
      cooldown(),
    ],
  },
];

async function main() {
  const supabase = getServiceClient();

  const { data: bibliothek, error: bibError } = await supabase.from('uebungsbibliothek').select('id, name');
  if (bibError) throw new Error(`Konnte Übungsbibliothek nicht laden: ${bibError.message}`);
  const idByName = new Map<string, string>((bibliothek ?? []).map((u: any) => [u.name, u.id]));
  if (idByName.size === 0) {
    throw new Error('Übungsbibliothek ist leer — erst "npm run seed:uebungsbibliothek" ausführen.');
  }

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

      const rows = plan.uebungen.map((u, i) => {
        let uebungId: string | null = null;
        let name = u.freitext ?? '';
        if (u.uebungName) {
          const id = idByName.get(u.uebungName);
          if (!id) throw new Error(`Unbekannte Übung "${u.uebungName}" (nicht in Übungsbibliothek) — Plan "${plan.name}".`);
          uebungId = id;
          name = u.uebungName;
        }
        return {
          trainingsplan_id: row.id,
          sort_order: i,
          block: u.block,
          name,
          uebung_id: uebungId,
          saetze: u.saetze ?? null,
          wiederholungen: u.wiederholungen ?? null,
          pause_sekunden: u.pause_sekunden ?? null,
          lastvorgabe: u.lastvorgabe ?? null,
          hinweis: u.hinweis ?? null,
        };
      });
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
