// Seed der 13 kuratierten Trainingspläne (M1-M5, F1-F8 — transkribiert aus
// kb/*.md) + der Level×Fokus→Plan-Zuordnungstabelle. Ersetzt das alte
// generische 24-Plan-Grid.
// Reihenfolge: erst npm run seed:uebungsbibliothek, dann dieses Skript.
// Aufruf: npm run seed:trainingsplaene
import { getServiceClient } from '../lib/supabaseServer';

type Geschlecht = 'maennlich' | 'weiblich';
type Level = 'beginner' | 'leicht_aktiv' | 'regelmaessig' | 'intensiv';
type Fokus = 'kein' | 'ruecken' | 'beine_po' | 'bauch_core';

interface Phase {
  nummer: number;
  wochenVon: number;
  wochenBis: number;
  ziel: string;
}

interface UebungSeed {
  name: string;
  saetze: number;
  wiederholungen: string;
  pauseSekunden: number;
}

interface PlanSeed {
  planKey: string;
  geschlecht: Geschlecht;
  name: string;
  zielgruppe: string;
  fokusText: string;
  frequenz: string;
  nettoMinuten: number;
  pauseHinweis: string;
  voraussetzung?: string;
  phasen: Phase[];
  uebungen: UebungSeed[];
  trainerHinweise: string[];
}

function u(name: string, saetze: number, wiederholungen: string, pauseSekunden: number): UebungSeed {
  return { name, saetze, wiederholungen, pauseSekunden };
}
function p(nummer: number, wochenVon: number, wochenBis: number, ziel: string): Phase {
  return { nummer, wochenVon, wochenBis, ziel };
}

const PLANS: PlanSeed[] = [
  // ── MÄNNER ──────────────────────────────────────────────────────────────
  {
    planKey: 'M1', geschlecht: 'maennlich', name: 'Männer | Absoluter Einsteiger',
    zielgruppe: 'Couch-Potato-Level – kaum oder kein sportlicher Hintergrund',
    fokusText: 'Rücken, Körperhaltung & Ganzkörper',
    frequenz: '2× pro Woche (z. B. Mo & Do)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 4, 'Technik lernen, leichte Gewichte, Körpergefühl aufbauen'), p(2, 5, 8, 'Gewichte moderat steigern, Wiederholungen sauber halten')],
    uebungen: [
      u('Beinpresse', 2, '15', 90),
      u('Beinbeugen sitzend (Maschine)', 2, '15', 90),
      u('Wadenheben stehend (Maschine)', 3, '15', 60),
      u('Latzug zur Brust (breiter Griff)', 2, '12', 90),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '12', 90),
      u('Rückenstrecken / Hyperextensions', 2, '12', 90),
      u('Brustpresse (Maschine)', 2, '12', 90),
      u('Schulterdrücken (Maschine)', 2, '12', 90),
      u('Seitheben (Kurzhantel)', 3, '12', 60),
      u('Bizepscurls (Kurzhantel, alternierend)', 2, '12', 60),
      u('Trizeps-Pushdowns (Kabelzug, Seil)', 2, '12', 60),
      u('Plank (Unterarmstütz)', 3, '20–30 Sek.', 60),
    ],
    trainerHinweise: [
      'Gewichtwahl: Deutlich leichter starten als gefühlt nötig – Technik geht immer vor Gewicht.',
      'Rücken-Übungen (Nr. 4–6): Bewusst in die Schulterblätter drücken, kein Schwung, kontrollierte Bewegung.',
      'Rückenstrecken: Nur bis zur Körperlinie strecken – kein Hohlkreuz.',
      'Plank-Steigerung: Wo. 1–2: 20 Sek. · Wo. 3–4: 25 Sek. · Wo. 5–8: 30 Sek.',
      'Gewichtssteigerung: Erst in Phase 2 (ab Woche 5) – und nur wenn alle Wiederholungen sauber laufen.',
    ],
  },
  {
    planKey: 'M2', geschlecht: 'maennlich', name: 'Männer | Leicht Aktiv',
    zielgruppe: 'Gelegentlich sportlich aktiv – z. B. ab und zu Radfahren, Schwimmen oder sporadisch Fitnessstudio',
    fokusText: 'Rücken, Körperhaltung & Ganzkörper',
    frequenz: '2–3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 3, 'Technik festigen, Gewichte moderat, Bewegungsmuster sauber einschleifen'), p(2, 4, 6, 'Gewichte systematisch steigern, Wiederholungen leicht reduzieren'), p(3, 7, 8, 'Intensität leicht erhöhen, Körpergefühl & Stärke ausbauen')],
    uebungen: [
      u('Beinpresse', 2, '12–15', 90),
      u('Rumänisches Kreuzheben (Kurzhantel)', 2, '12', 90),
      u('Ausfallschritte auf der Stelle (Kurzhantel)', 2, '10 je Seite', 90),
      u('Wadenheben stehend (Maschine)', 3, '15', 60),
      u('Latzug zur Brust (enger Untergriff)', 2, '12', 90),
      u('Rudern sitzend (Kabelzug, breiter Griff)', 2, '12', 90),
      u('Rückenstrecken / Hyperextensions', 2, '12–15', 90),
      u('Face Pulls (Kabelzug, Seil)', 2, '15', 60),
      u('Schrägbankdrücken (Kurzhantel)', 2, '12', 90),
      u('Schulterdrücken (Kurzhantel, sitzend)', 2, '12', 90),
      u('Bizepscurls (SZ-Stange)', 2, '12', 60),
      u('Trizeps-Pushdowns (Kabelzug, V-Griff)', 2, '12', 60),
      u('Crunches (Matte)', 2, '15–20', 60),
    ],
    trainerHinweise: [
      'Rumänisches Kreuzheben: Rücken gerade halten, Hüfte nach hinten schieben – kein Rundrücken. Kontrolliert absenken.',
      'Face Pulls: Hervorragend für Rotatorenmanschette und Gegenspieler der Brustmuskeln – wichtig für Leute mit Verspannungen im Nacken-/Schulterbereich.',
      'Ausfallschritte: Knie bleibt über dem Fuß, Oberkörper aufrecht – lieber langsam und sauber als schnell und schief.',
      'Gewichtssteigerung: In Phase 2 (ab Wo. 4) bei jeder Übung, die sich in Phase 1 sauber angefühlt hat.',
      '3× pro Woche: Nur empfohlen ab Woche 3 – erst anpassen lassen, dann Frequenz erhöhen.',
    ],
  },
  {
    planKey: 'M3', geschlecht: 'maennlich', name: 'Männer | Trainiert aber planlos',
    zielgruppe: 'Geht regelmäßig ins Studio – macht aber hauptsächlich, was Spaß macht, ohne strukturierten Plan',
    fokusText: 'Rücken, Körperhaltung & Ganzkörper',
    frequenz: '3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 3, 'Bewegungsmuster korrigieren, strukturiertes Training kennenlernen'), p(2, 4, 6, 'Progressive Steigerung der Gewichte, Technik unter Last stabilisieren'), p(3, 7, 8, 'Maximale Leistungssteigerung, Schwachstellen gezielt adressieren')],
    uebungen: [
      u('Kniebeugen (Multipresse oder Langhantel)', 2, '10–12', 90),
      u('Rumänisches Kreuzheben (Langhantel)', 2, '10', 90),
      u('Beinbeugen sitzend (Maschine)', 2, '12', 60),
      u('Wadenheben stehend (Maschine)', 3, '15', 60),
      u('Klimmzüge (Unterstützungsmaschine oder frei)', 2, '8–10', 90),
      u('Vorgebeugtes Langhantelrudern', 2, '10', 90),
      u('Rückenstrecken / Hyperextensions (mit Scheibe)', 2, '12', 90),
      u('Face Pulls (Kabelzug, Seil)', 2, '15', 60),
      u('Bankdrücken (Langhantel, Flachbank)', 2, '10', 90),
      u('Schulterdrücken (Kurzhantel, stehend)', 2, '10', 90),
      u('Seitheben (Kabelzug)', 3, '12', 60),
      u('Bizepscurls (SZ-Stange)', 2, '10', 60),
      u('Schädelzertrümmerer / French Press (SZ-Stange)', 2, '10', 60),
      u('Plank mit Zusatzgewicht', 2, '30–40 Sek.', 60),
    ],
    trainerHinweise: [
      'Kniebeugen & RDL mit Langhantel: Hier liegt der Unterschied zu M1/M2 – freie Grundübungen erfordern mehr Körperspannung und Technik. In Phase 1 lieber 10 kg weniger und dafür perfekte Ausführung.',
      'Klimmzüge: Falls noch keine freien möglich – Unterstützungsmaschine nutzen und Gewicht jede Woche reduzieren.',
      'Vorgebeugtes Rudern: Oberkörper ca. 45° nach vorne, Blick Richtung Boden, Schulterblätter aktiv zusammenziehen – kein Schwung aus dem Rücken.',
      'Face Pulls: Bleiben dauerhaft im Plan – gerade für Leute, die viel Bankdrücken gemacht haben und die hintere Schulter vernachlässigt haben.',
      'Gewichtssteigerung: Konsequent ab Phase 2 bei jeder Übung, die in Phase 1 technisch sauber war – kleine Schritte, keine Sprünge.',
      'Planlos war gestern: Der Schlüssel bei dieser Gruppe ist Konstanz und progressive Steigerung – dasselbe Programm, jede Woche minimal besser.',
    ],
  },
  {
    planKey: 'M4', geschlecht: 'maennlich', name: 'Männer | Rücken-Spezialplan',
    zielgruppe: 'Männer mit Rückenbeschwerden, Verspannungen, Fehlhaltung durch langes Sitzen (Büro, Homeoffice)',
    fokusText: 'Rücken-Rehabilitation, Haltungskorrektur, Rumpfstabilisierung & Ganzkörper',
    frequenz: '2–3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    voraussetzung: 'Dieser Plan ist präventiv und kräftigend ausgerichtet – kein Ersatz für ärztliche Behandlung bei akuten Beschwerden. Bei starken oder ausstrahlenden Schmerzen bitte zuerst einen Arzt oder Physiotherapeuten aufsuchen.',
    phasen: [p(1, 1, 3, 'Schmerzfreie Bewegungsmuster etablieren, Rumpf stabilisieren, Körperwahrnehmung schärfen'), p(2, 4, 6, 'Kräftigung der gesamten hinteren Kette, Haltungsmuskulatur aufbauen'), p(3, 7, 8, 'Belastbarkeit steigern, Alltagsstabilität festigen')],
    uebungen: [
      u('Beinpresse (kontrolliert, kein Hohlkreuz)', 2, '15', 90),
      u('Beinbeugen sitzend (Maschine)', 2, '15', 60),
      u('Hip Thrusts / Beckenheben (Kurzhantel)', 2, '15', 90),
      u('Wadenheben sitzend (Maschine)', 3, '15', 60),
      u('Latzug zur Brust (breiter Griff)', 2, '12', 90),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '12', 90),
      u('Rückenstrecken / Hyperextensions (ohne Zusatzgewicht)', 2, '12–15', 90),
      u('Face Pulls (Kabelzug, Seil)', 3, '15', 60),
      u('Reverse Butterfly (Pec-Deck-Maschine, hinten)', 2, '15', 60),
      u('Brustpresse (Maschine, kein freies Bankdrücken)', 2, '12', 90),
      u('Schulterdrücken (Maschine, sitzend)', 2, '12', 90),
      u('Bizepscurls (Kurzhantel, alternierend)', 2, '12', 60),
      u('Trizeps-Pushdowns (Kabelzug, Seil)', 2, '12', 60),
      u('Plank (Unterarmstütz)', 3, '20–40 Sek.', 60),
      u('Beinheben im Capoeira-Stuhl / Dip-Ständer', 2, '10–12', 60),
    ],
    trainerHinweise: [
      'Kein Kreuzheben, keine Langhantel-Kniebeugen: Bei Rückenproblemen zu Beginn bewusst auf maschinengeführte und rückenschonende Varianten setzen.',
      'Hip Thrusts: Einer der wichtigsten Moves für diesen Plan – schwache Glutealmuskulatur ist häufig eine Hauptursache für Rückenschmerzen.',
      'Face Pulls & Reverse Butterfly: Drei Sätze, weil hintere Schulter und Rotatorenmanschette bei Bürositzen fast immer stark vernachlässigt werden.',
      'Rückenstrecken: Nur bis zur Körperlinie – kein Überstrecken, kein Hohlkreuz. Langsam und kontrolliert.',
      'Plank-Steigerung: Wo. 1–2: 20 Sek. · Wo. 3–4: 30 Sek. · Wo. 5–6: 35 Sek. · Wo. 7–8: 40 Sek.',
      'Beinpresse: Rücken bleibt flach auf der Polsterung – kein Hochrollen des Beckens am unteren Umkehrpunkt.',
      'Phase 3 (Wo. 7–8): Wer schmerzfrei ist und Fortschritte spürt, kann Rückenstrecken mit leichter Scheibe ergänzen und Beinpresse durch geführte Kniebeugen (Multipresse) ersetzen.',
    ],
  },
  {
    planKey: 'M5', geschlecht: 'maennlich', name: 'Männer | Power & Maximale Intensität',
    zielgruppe: 'Männer mit solider Trainingserfahrung, die sich richtig wegballern wollen – maximale Belastung, schwere Grundübungen, volle Ausbelastung',
    fokusText: 'Maximale Kraft & Muskelaufbau & Ganzkörper',
    frequenz: '3× pro Woche (z. B. Mo / Mi / Fr) – mit mindestens einem Ruhetag dazwischen', nettoMinuten: 60, pauseHinweis: '90–120 Sekunden',
    voraussetzung: 'Solide Technik bei Langhantelübungen (Kniebeugen, Kreuzheben, Bankdrücken) ist Pflicht – dieser Plan ist nichts für Einsteiger.',
    phasen: [p(1, 1, 2, 'Einstieg in schwere Grundübungen – Technik unter Last stabilisieren'), p(2, 3, 5, 'Gewichte jede Woche konsequent steigern – progressive Überlastung'), p(3, 6, 8, 'Maximale Intensität – an die Grenze gehen, letzte Wdh. kämpfen')],
    uebungen: [
      u('Kniebeugen (Langhantel, tief)', 2, '6–8', 120),
      u('Kreuzheben (Langhantel)', 2, '5–6', 120),
      u('Beinpresse (maximales Gewicht)', 2, '8–10', 90),
      u('Beinbeugen liegend (Maschine)', 2, '10', 90),
      u('Wadenheben stehend (Maschine, schwer)', 3, '12', 60),
      u('Bankdrücken (Langhantel, Flachbank)', 2, '6–8', 120),
      u('Schrägbankdrücken (Langhantel)', 2, '8', 90),
      u('Klimmzüge (frei, mit Zusatzgewicht falls möglich)', 2, '6–8', 120),
      u('Vorgebeugtes Langhantelrudern', 2, '6–8', 120),
      u('Military Press (Langhantel, stehend)', 2, '6–8', 120),
      u('Seitheben (Kurzhantel, schwer)', 3, '10', 75),
      u('Bizepscurls (Langhantel oder SZ-Stange, schwer)', 3, '8', 75),
      u('Enges Bankdrücken (Langhantel)', 2, '8', 90),
      u('Beinheben hängend (Klimmzugstange)', 3, '10–15', 60),
    ],
    trainerHinweise: [
      'Progressive Überladung: Jede Woche mindestens 2,5 kg mehr – wenn das nicht geht, dann zumindest 1 Wdh. mehr.',
      'Letzte Wdh. kämpfen: Die letzte Wiederholung jedes Satzes soll wirklich anstrengend sein – wer locker durch alle Wdh. kommt, nimmt mehr Gewicht.',
      'Technik ist die Grenze: Mehr Gewicht nur, wenn die Technik sauber bleibt – kein Ego-Lifting mit Rundrücken.',
      'Pause einhalten: Die 90–120 Sek. Pause sind nötig – bei schweren Grundübungen muss das Nervensystem erholen.',
      'Kniebeugen & Kreuzheben: Das sind die zwei Könige – hier wird der meiste Aufwand investiert. Warm-Up-Sätze mit 50–60% des Arbeitsgewichts machen, bevor die Arbeitssätze starten.',
      'Kreuzheben: Rücken gerade, Schulterblätter zurück, Stange nah am Körper – kein Rundrücken unter keinen Umständen.',
      'Bankdrücken & Schrägbankdrücken: Schulterblätter auf der Bank festziehen, Brust raus – die Schultern bleiben unten.',
      'Klimmzüge mit Zusatzgewicht: Gewichtsgürtel oder Kurzhantel zwischen die Beine klemmen – wer noch keine 8 sauberen Klimmzüge schafft, erst ohne Zusatzgewicht.',
      'Military Press stehend: Kernspannung ist Pflicht – kein Hohlkreuz beim Drücken. Stange an der Brust starten, über den Kopf drücken.',
      'Bizepscurls: Drei Sätze, weil Arme hier einzige Isolationsübung für diesen Bereich sind – schwer, kontrolliert, kein Schwung.',
      'Beinheben hängend: Beine kontrolliert absenken – kein Pendeln. Wer die volle Anzahl nicht schafft, macht angewinkelte Knie als Variante.',
      'Regeneration: Bei diesem Plan ist Schlaf und Ernährung genauso wichtig wie das Training – ohne ausreichend Protein und Erholung verpufft die Intensität.',
      'Woche 7–8 Steigerung: Kniebeugen und Kreuzheben auf 3–4 Wdh. reduzieren und Gewicht maximal steigern – wer es will, geht ans absolute Limit.',
    ],
  },

  // ── FRAUEN ──────────────────────────────────────────────────────────────
  {
    planKey: 'F1', geschlecht: 'weiblich', name: 'Frauen | Absolute Einsteigerin',
    zielgruppe: 'Kein oder kaum sportlicher Hintergrund – betritt das Studio zum ersten oder zweiten Mal',
    fokusText: 'Bauch, Beine & Po (klassische Problemzonen) & Ganzkörper',
    frequenz: '2× pro Woche (z. B. Di & Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 4, 'Maschinen kennenlernen, Bewegungsmuster einschleifen, Körpergefühl entwickeln'), p(2, 5, 8, 'Gewichte vorsichtig steigern, Wiederholungen sauber und kontrolliert halten')],
    uebungen: [
      u('Beinpresse', 2, '15', 90),
      u('Beinbeugen sitzend (Maschine)', 2, '15', 90),
      u('Adduktion (Maschine)', 2, '15', 60),
      u('Abduktion (Maschine)', 2, '15', 60),
      u('Hip Thrusts / Beckenheben (Körpergewicht oder leichte Kurzhantel)', 3, '15', 60),
      u('Wadenheben stehend (Maschine)', 2, '15', 60),
      u('Latzug zur Brust (breiter Griff)', 2, '12', 90),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '12', 90),
      u('Brustpresse (Maschine)', 2, '12', 90),
      u('Schulterdrücken (Maschine)', 2, '12', 90),
      u('Seitheben (Kurzhantel, leicht)', 3, '12', 60),
      u('Crunches (Matte)', 2, '15', 60),
      u('Plank (Unterarmstütz)', 3, '20–30 Sek.', 60),
    ],
    trainerHinweise: [
      'Gewichtwahl: Lieber zu leicht starten – das Ziel in Phase 1 ist das Bewegungsgefühl, nicht das Gewicht.',
      'Hip Thrusts: Einer der effektivsten Po-Übungen überhaupt – bewusst in die Gesäßmuskulatur spannen oben in der Bewegung. Nicht mit dem Rücken drücken.',
      'Adduktion & Abduktion: Langsam und kontrolliert – kein Schwingen mit dem Gewicht.',
      'Plank-Steigerung: Wo. 1–2: 20 Sek. · Wo. 3–4: 25 Sek. · Wo. 5–8: 30 Sek.',
      'Crunches: Hände locker an die Schläfen, Blick zur Decke – kein Ziehen am Nacken.',
      'Gewichtssteigerung: Erst ab Woche 5 und nur wenn alle Wiederholungen technisch sauber sind.',
      'Motivation: Ergebnisse bei Einsteigern kommen schnell – schon nach 4 Wochen ist ein spürbarer Unterschied in Körpergefühl und Kraft möglich.',
    ],
  },
  {
    planKey: 'F2', geschlecht: 'weiblich', name: 'Frauen | Leicht Aktiv',
    zielgruppe: 'Gelegentlich sportlich aktiv – z. B. Yoga, Pilates, Schwimmen, Radfahren oder sporadisch Fitnessstudio',
    fokusText: 'Bauch, Beine & Po & Ganzkörper',
    frequenz: '2–3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 3, 'Technik festigen, Bewegungsmuster sauber einschleifen, erste Freihantelübungen kennenlernen'), p(2, 4, 6, 'Gewichte systematisch steigern, Intensität leicht erhöhen'), p(3, 7, 8, 'Stärke & Körpergefühl ausbauen, Fortschritt sichtbar machen')],
    uebungen: [
      u('Beinpresse', 2, '12–15', 90),
      u('Rumänisches Kreuzheben (Kurzhantel)', 2, '12', 90),
      u('Ausfallschritte auf der Stelle (Kurzhantel)', 2, '10 je Seite', 90),
      u('Adduktion (Maschine)', 2, '15', 60),
      u('Abduktion (Maschine)', 2, '15', 60),
      u('Hip Thrusts / Beckenheben (Kurzhantel)', 3, '12–15', 60),
      u('Wadenheben stehend (Maschine)', 2, '15', 60),
      u('Latzug zur Brust (breiter Griff)', 2, '12', 90),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '12', 90),
      u('Schrägbankdrücken (Maschine oder Kurzhantel)', 2, '12', 90),
      u('Seitheben (Kurzhantel)', 3, '12', 60),
      u('Trizeps-Pushdowns (Kabelzug, Seil)', 2, '12', 60),
      u('Crunches (Matte)', 2, '15–20', 60),
      u('Plank (Unterarmstütz)', 2, '30 Sek.', 60),
    ],
    trainerHinweise: [
      'Rumänisches Kreuzheben: Rücken gerade, Hüfte nach hinten schieben, Gewicht nah am Körper führen – spürbare Dehnung in den Oberschenkelrückseiten ist gewollt.',
      'Ausfallschritte: Knie bleibt über dem Fuß, Oberkörper aufrecht – lieber mit leichten Kurzhanteln starten und Technik sichern.',
      'Hip Thrusts: Drei Sätze – bewusst oben in der Bewegung in den Po spannen und kurz halten. Gewicht von Woche zu Woche steigern.',
      'Adduktion & Abduktion: Langsam und kontrolliert – kein Schwingen, volle Bewegungsamplitude ausnutzen.',
      'Schrägbankdrücken: Fokus auf die obere Brust – wer sich mit der Kurzhantel unsicher fühlt, startet an der Maschine.',
      '3× pro Woche: Ab Woche 3 möglich – erst zwei Einheiten gewöhnen, dann Frequenz erhöhen.',
      'Gewichtssteigerung: Konsequent ab Phase 2 bei allen Übungen, die in Phase 1 technisch sauber liefen.',
    ],
  },
  {
    planKey: 'F3', geschlecht: 'weiblich', name: 'Frauen | Trainiert aber planlos',
    zielgruppe: 'Geht regelmäßig ins Studio – macht aber hauptsächlich, was Spaß macht, ohne strukturierten Plan',
    fokusText: 'Bauch, Beine & Po & Ganzkörper',
    frequenz: '3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 3, 'Bewegungsmuster korrigieren, strukturiertes Training kennenlernen, Grundlagen festigen'), p(2, 4, 6, 'Progressive Steigerung der Gewichte, Technik unter Last stabilisieren'), p(3, 7, 8, 'Maximale Leistungssteigerung, gezielte Arbeit an Schwachstellen')],
    uebungen: [
      u('Kniebeugen (Multipresse oder Langhantel)', 2, '12', 90),
      u('Rumänisches Kreuzheben (Langhantel)', 2, '10–12', 90),
      u('Ausfallschritte gehend (Kurzhantel)', 2, '10 je Seite', 90),
      u('Adduktion (Maschine)', 2, '15', 60),
      u('Abduktion (Maschine)', 2, '15', 60),
      u('Hip Thrusts / Beckenheben (Langhantel oder Hip-Thrust-Maschine)', 3, '12', 60),
      u('Glute Kickbacks (Kabelzug mit Schlaufe)', 2, '12 je Seite', 60),
      u('Latzug zur Brust (enger Untergriff)', 2, '12', 90),
      u('Einarmiges Kurzhantelrudern', 2, '10 je Seite', 90),
      u('Schrägbankdrücken (Kurzhantel)', 2, '12', 90),
      u('Seitheben (Kabelzug)', 3, '12', 60),
      u('Überkopf-Trizepsdrücken (Kurzhantel, sitzend)', 2, '12', 60),
      u('Russian Twists (Kurzhantel)', 2, '15 je Seite', 60),
      u('Beinheben im Capoeira-Stuhl / Dip-Ständer', 2, '12', 60),
    ],
    trainerHinweise: [
      'Kniebeugen mit Langhantel: Der große Schritt im Vergleich zu F1/F2 – volle Bewegungsamplitude, Knie in Zehenrichtung, Gewicht auf den Fersen. In Phase 1 lieber leichter und tiefer.',
      'Hip Thrusts mit Langhantel: Jetzt mit echtem Gewicht – Stange auf Hüftknochen polstern (Matte oder Pad nutzen), bewusst oben in den Po spannen.',
      'Glute Kickbacks: Langsam und kontrolliert – das Bein nicht schwingen, sondern die Gesäßmuskulatur aktiv einsetzen. Top-Ergänzung zu Hip Thrusts.',
      'Einarmiges Rudern: Auf der Flachbank abstützen, Schulterblatt aktiv nach hinten ziehen – Rücken bleibt parallel zum Boden.',
      'Russian Twists: Füße können leicht abgehoben werden für mehr Intensität – aber nur wenn die Technik sauber ist.',
      'Gewichtssteigerung: Konsequent jede Woche in Phase 2 – kleine Schritte, aber regelmäßig.',
      'Planlos war gestern: Diese Gruppe profitiert enorm von Struktur – Fortschritte werden durch progressive Steigerung sichtbar, nicht durch mehr verschiedene Übungen.',
    ],
  },
  {
    planKey: 'F4', geschlecht: 'weiblich', name: 'Frauen | Bauch-Beine-Po Intensiv',
    zielgruppe: 'Frauen mit klarem BBP-Ziel – egal ob Einsteigerin oder bereits etwas erfahrener; wer gezielt an Bauch, Beinen und Po arbeiten möchte',
    fokusText: 'Intensiver BBP-Schwerpunkt & Ganzkörper',
    frequenz: '3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 3, 'Bewegungsmuster sichern, BBP-Übungen gezielt einschleifen'), p(2, 4, 6, 'Gewichte steigern, Po- und Bauchmuskulatur gezielt aufbauen'), p(3, 7, 8, 'Maximale Intensität im BBP-Bereich, Oberkörper halten & stärken')],
    uebungen: [
      u('Beinpresse (tief & kontrolliert)', 2, '12–15', 90),
      u('Rumänisches Kreuzheben (Kurzhantel oder Langhantel)', 2, '12', 90),
      u('Ausfallschritte gehend (Kurzhantel)', 2, '10 je Seite', 90),
      u('Hip Thrusts / Beckenheben (Langhantel oder Hip-Thrust-Maschine)', 3, '12–15', 60),
      u('Glute Kickbacks (Kabelzug mit Schlaufe)', 2, '15 je Seite', 60),
      u('Adduktion (Maschine)', 2, '15', 60),
      u('Abduktion (Maschine)', 2, '15', 60),
      u('Beinbeugen liegend (Maschine)', 2, '12', 60),
      u('Wadenheben stehend (Maschine)', 2, '15', 60),
      u('Latzug zur Brust (breiter Griff)', 2, '12', 90),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '12', 90),
      u('Seitheben (Kurzhantel)', 3, '12', 60),
      u('Crunches (Matte oder Bauchmaschine)', 3, '15–20', 60),
      u('Russian Twists (Kurzhantel)', 2, '15 je Seite', 60),
      u('Plank (Unterarmstütz)', 2, '30–40 Sek.', 60),
    ],
    trainerHinweise: [
      'BBP-Block (Nr. 1–9): Dieser Block bildet den Kern des Plans – hier liegt die meiste Zeit und Energie. Oberkörper (Nr. 10–12) wird bewusst kompakt gehalten.',
      'Hip Thrusts: Drei Sätze mit Fokus auf die maximale Kontraktion oben – kurz halten, dann kontrolliert absenken. Gewicht jede Woche steigern.',
      'Glute Kickbacks: Langsam und isoliert – kein Schwung, kein Drehen in der Hüfte. Das Bein geht nur so weit, wie die Gesäßmuskulatur es trägt.',
      'Adduktion & Abduktion: Volle Bewegungsamplitude, langsam und bewusst – nicht mit dem Gewicht schleudern.',
      'Beinbeugen liegend: Bewusst die Oberschenkelrückseite einsetzen – nicht mit dem Gesäß hochziehen.',
      'Bauchblock (Nr. 13–15): Drei Übungen, die alle drei Bereiche der Bauchmuskulatur abdecken – Crunches (gerade), Russian Twists (schräg), Plank (tief/Stabilisierung).',
      'Gewichtssteigerung: Ab Phase 2 bei Hip Thrusts, RDL und Beinpresse konsequent steigern – das ist der Motor für sichtbare Veränderungen.',
      'Phase 3 (Wo. 7–8): Crunches können durch Kabel-Crunches ersetzt werden für mehr Widerstand.',
    ],
  },
  {
    planKey: 'F5', geschlecht: 'weiblich', name: 'Frauen | Rücken & Nacken Spezialplan',
    zielgruppe: 'Frauen mit Rückenbeschwerden, Nackenverspannungen oder Fehlhaltung durch langes Sitzen (Büro, Homeoffice, Smartphone-Nutzung)',
    fokusText: 'Rücken-Rehabilitation, Haltungskorrektur, Nackenstabilisierung & Ganzkörper',
    frequenz: '2–3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    voraussetzung: 'Dieser Plan ist präventiv und kräftigend ausgerichtet – kein Ersatz für ärztliche Behandlung bei akuten Beschwerden. Bei starken, ausstrahlenden oder anhaltenden Schmerzen bitte zuerst einen Arzt oder Physiotherapeuten aufsuchen.',
    phasen: [p(1, 1, 3, 'Schmerzfreie Bewegungsmuster etablieren, Rumpf & Nackenbereich stabilisieren'), p(2, 4, 6, 'Haltungsmuskulatur gezielt aufbauen, hintere Kette kräftigen'), p(3, 7, 8, 'Belastbarkeit steigern, Alltagsstabilität im Rücken & Nacken festigen')],
    uebungen: [
      u('Beinpresse (kontrolliert, kein Hohlkreuz)', 2, '15', 90),
      u('Hip Thrusts / Beckenheben (Körpergewicht oder leichte Kurzhantel)', 2, '15', 60),
      u('Beinbeugen sitzend (Maschine)', 2, '15', 60),
      u('Adduktion (Maschine)', 2, '15', 60),
      u('Abduktion (Maschine)', 2, '15', 60),
      u('Latzug zur Brust (breiter Griff, kontrolliert)', 2, '12', 90),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '12', 90),
      u('Rückenstrecken / Hyperextensions (ohne Zusatzgewicht)', 2, '12–15', 90),
      u('Face Pulls (Kabelzug, Seil)', 3, '15', 60),
      u('Reverse Butterfly (Pec-Deck-Maschine, hinten)', 3, '15', 60),
      u('Shrugs / Nackenheben (Kurzhantel, leicht & kontrolliert)', 2, '15', 60),
      u('Brustpresse (Maschine)', 2, '12', 90),
      u('Plank (Unterarmstütz)', 3, '20–40 Sek.', 60),
      u('Beinheben im Capoeira-Stuhl / Dip-Ständer', 2, '10–12', 60),
    ],
    trainerHinweise: [
      'Kein schweres Freihanteltraining: Bei Rücken- und Nackenproblemen bewusst auf maschinengeführte und rückenschonende Varianten setzen – Sicherheit geht vor.',
      'Face Pulls & Reverse Butterfly: Drei Sätze – das sind die wichtigsten Übungen im Plan. Frauen mit Bürojob haben fast immer eine nach vorne gezogene Schulterposition (Upper Crossed Syndrome) – diese beiden Übungen wirken direkt dagegen.',
      'Shrugs / Nackenheben: Sehr leicht starten – langsam hochziehen, oben kurz halten, dann bewusst absenken. Kein Rollen der Schultern. Ziel ist nicht Gewicht, sondern Durchblutung und Kräftigung im Nackenbereich.',
      'Rückenstrecken: Nur bis zur Körperlinie – kein Überstrecken, kein Hohlkreuz. Langsam und kontrolliert.',
      'Beinpresse: Rücken bleibt flach auf der Polsterung – kein Hochrollen des Beckens am unteren Umkehrpunkt.',
      'Plank-Steigerung: Wo. 1–2: 20 Sek. · Wo. 3–4: 30 Sek. · Wo. 5–6: 35 Sek. · Wo. 7–8: 40 Sek.',
      'Phase 3 (Wo. 7–8): Wer schmerzfrei ist, kann Rückenstrecken mit leichter Scheibe ergänzen und Hip Thrusts mit etwas mehr Gewicht ausführen.',
      'Ergänzend empfohlen: Tägliche Dehn- und Mobilisationsübungen für Nacken und Brustwirbelsäule – 5–10 Minuten nach dem Training.',
    ],
  },
  {
    planKey: 'F6', geschlecht: 'weiblich', name: 'Frauen | Fortgeschrittene BBP & Rücken Kombination',
    zielgruppe: 'Frauen mit Trainingserfahrung, die gezielt Bauch-Beine-Po aufbauen UND gleichzeitig Rücken & Haltung verbessern wollen',
    fokusText: 'BBP-Aufbau & Rückengesundheit kombiniert & Ganzkörper',
    frequenz: '3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '60–90 Sekunden',
    phasen: [p(1, 1, 3, 'Komplexere Bewegungsmuster sichern, Gewichte moderat, Körperspannung aufbauen'), p(2, 4, 6, 'Progressive Steigerung, Schwachstellen gezielt adressieren'), p(3, 7, 8, 'Höchste Intensität im BBP-Bereich, Rücken & Haltung spürbar verbessert')],
    uebungen: [
      u('Kniebeugen (Multipresse oder Langhantel)', 2, '10–12', 90),
      u('Rumänisches Kreuzheben (Langhantel)', 2, '10–12', 90),
      u('Hip Thrusts (Langhantel oder Hip-Thrust-Maschine)', 3, '12', 60),
      u('Ausfallschritte gehend (Kurzhantel)', 2, '10 je Seite', 90),
      u('Glute Kickbacks (Kabelzug mit Schlaufe)', 2, '15 je Seite', 60),
      u('Adduktion (Maschine)', 2, '15', 60),
      u('Abduktion (Maschine)', 2, '15', 60),
      u('Klimmzüge (Unterstützungsmaschine) oder Latzug (Untergriff)', 2, '10–12', 90),
      u('Einarmiges Kurzhantelrudern', 2, '10 je Seite', 90),
      u('Rückenstrecken / Hyperextensions (leichte Scheibe)', 2, '12', 90),
      u('Face Pulls (Kabelzug, Seil)', 3, '15', 60),
      u('Schrägbankdrücken (Kurzhantel)', 2, '12', 90),
      u('Seitheben (Kabelzug)', 3, '12', 60),
      u('Kabel-Crunches (Kneeling Cable Crunches)', 2, '15', 60),
      u('Russian Twists (Kurzhantel)', 2, '15 je Seite', 60),
    ],
    trainerHinweise: [
      'Kniebeugen & RDL mit Langhantel: Der Anspruch steigt – volle Bewegungsamplitude, aktive Körperspannung, Blick geradeaus. In Phase 1 lieber 5 kg weniger und perfekte Technik.',
      'Hip Thrusts: Drei Sätze mit echtem Gewicht – oben in der Bewegung kurz halten und bewusst in den Po spannen. Das ist der Motor für sichtbare Veränderungen.',
      'Face Pulls: Drei Sätze – Gegengewicht zu allen drückenden Bewegungen und unverzichtbar für Schultergesundheit und aufrechte Haltung.',
      'Klimmzüge / Unterstützungsmaschine: Wer keine freien Klimmzüge schafft – Unterstützungsgewicht jede Woche leicht reduzieren. Das ist das Ziel.',
      'Rückenstrecken mit Scheibe: Nur wenn Phase 1 komplett schmerzfrei war – kleine Scheibe (2,5–5 kg), Fokus auf kontrollierte Ausführung.',
      'Kabel-Crunches: Effektiver als normale Crunches wegen des konstanten Widerstands – Stirn Richtung Knie ziehen, Hüfte bleibt unten.',
      'Gewichtssteigerung: Ab Phase 2 bei Kniebeugen, RDL und Hip Thrusts konsequent steigern – das sind die drei Haupttreiber des Plans.',
      'Phase 3 (Wo. 7–8): Wer möchte, kann Ausfallschritte durch gehende Ausfallschritte mit Langhantel ersetzen – nur bei sauberer Technik.',
    ],
  },
  {
    planKey: 'F7', geschlecht: 'weiblich', name: 'Frauen | Schlanke Beine & straffer Po',
    zielgruppe: 'Frauen mit dem Ziel schlanke, definierte Beine und ein straffer Po – figurorientiertes Training mit moderaten Gewichten und höheren Wiederholungszahlen',
    fokusText: 'Beine & Po (definierend & straffend) & Ganzkörper',
    frequenz: '3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '45–75 Sekunden',
    phasen: [p(1, 1, 3, 'Bewegungsmuster einschleifen, moderates Gewicht, höhere Wdh. für Muskelausdauer'), p(2, 4, 6, 'Gewichte leicht steigern, Wiederholungen halten – Definition aufbauen'), p(3, 7, 8, 'Intensität maximieren, Körpergefühl & Straffheit deutlich spürbar')],
    uebungen: [
      u('Beinpresse (moderates Gewicht, hohe Wdh.)', 2, '20', 60),
      u('Ausfallschritte gehend (Kurzhantel, leicht)', 2, '15 je Seite', 60),
      u('Beinstrecken (Maschine)', 2, '20', 60),
      u('Beinbeugen liegend (Maschine)', 2, '20', 60),
      u('Adduktion (Maschine)', 2, '20', 45),
      u('Abduktion (Maschine)', 2, '20', 45),
      u('Hip Thrusts / Beckenheben (Kurzhantel, kontrolliert)', 3, '15–20', 60),
      u('Glute Kickbacks (Kabelzug mit Schlaufe)', 2, '15 je Seite', 45),
      u('Wadenheben stehend (Maschine)', 2, '20', 45),
      u('Latzug zur Brust (breiter Griff)', 2, '15', 75),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '15', 75),
      u('Seitheben (Kurzhantel, leicht)', 3, '15', 60),
      u('Crunches (Matte)', 2, '20', 60),
      u('Plank (Unterarmstütz)', 2, '30–40 Sek.', 60),
    ],
    trainerHinweise: [
      'Hohes Wiederholungsziel: 20 Wdh. klingen viel – das Gewicht muss entsprechend leichter gewählt werden. Die letzten 3–4 Wdh. dürfen brennen, aber die Technik muss sauber bleiben.',
      'Kürzere Pausen: 45–75 Sekunden statt 90 – das erhöht den metabolischen Effekt und fördert die Durchblutung im Beinbereich.',
      'Kein schweres Beintraining: Dieser Plan setzt bewusst auf moderate Gewichte und hohe Wiederholungen – das fördert Definition und Ausdauer der Muskulatur, ohne übermäßigen Muskelaufbau.',
      'Hip Thrusts: Drei Sätze – auch hier mit Fokus auf die Kontraktion oben, nicht auf maximales Gewicht. 15–20 Wdh. mit sauberem Abbrennen.',
      'Beinstrecken & Beinbeugen: Vollständige Bewegungsamplitude – kein halbes Herumruckeln. Langsam absenken, kontrolliert strecken.',
      'Glute Kickbacks: Langsam, isoliert, bewusst – das Bein wird durch den Po bewegt, nicht durch Schwung.',
      'Gewichtssteigerung: In Phase 2 leicht steigern – aber nur so weit, dass die 20 Wdh. noch sauber machbar sind.',
      'Wichtig: Schlanke Beine entstehen durch eine Kombination aus Training UND Ernährung – dieser Plan liefert den Muskelreiz, die Küche liefert den Rest.',
    ],
  },
  {
    planKey: 'F8', geschlecht: 'weiblich', name: 'Frauen | Flacher Bauch & starker Core',
    zielgruppe: 'Frauen mit dem klaren Ziel eines flachen, definierten Bauches und einer starken Rumpfmuskulatur – als Abschluss-Plan der 8-Wochen-Challenge',
    fokusText: 'Core-Intensiv (gerade, schräge & tiefe Bauchmuskulatur) & Ganzkörper',
    frequenz: '3× pro Woche (z. B. Mo / Mi / Fr)', nettoMinuten: 60, pauseHinweis: '45–75 Sekunden',
    phasen: [p(1, 1, 3, 'Core-Übungen sauber einschleifen, Rumpfspannung aufbauen, Technik sichern'), p(2, 4, 6, 'Intensität steigern, Core-Stabilität unter Last festigen'), p(3, 7, 8, 'Maximale Core-Aktivierung, gesamter Körper spürbar straffer')],
    uebungen: [
      u('Beinpresse (moderates Gewicht)', 2, '15', 75),
      u('Rumänisches Kreuzheben (Kurzhantel)', 2, '12', 75),
      u('Hip Thrusts / Beckenheben (Kurzhantel)', 2, '15', 60),
      u('Adduktion (Maschine)', 2, '15', 60),
      u('Abduktion (Maschine)', 2, '15', 60),
      u('Latzug zur Brust (breiter Griff)', 2, '12', 75),
      u('Rudern sitzend (Kabelzug, V-Griff)', 2, '12', 75),
      u('Brustpresse (Maschine)', 2, '12', 75),
      u('Seitheben (Kurzhantel)', 3, '12', 60),
      u('Crunches (Matte oder Bauchmaschine)', 3, '20', 45),
      u('Beinheben im Capoeira-Stuhl / Dip-Ständer', 3, '12–15', 60),
      u('Russian Twists (Kurzhantel)', 3, '15 je Seite', 45),
      u('Kabel-Crunches (Kneeling Cable Crunches)', 2, '15', 60),
      u('Ab-Wheel Rollouts (Bauchroller)', 2, '8–10', 75),
      u('Plank (Unterarmstütz)', 3, '30–45 Sek.', 45),
    ],
    trainerHinweise: [
      'Core-Block (Nr. 10–15): Sechs Übungen, die alle drei Ebenen der Bauchmuskulatur abdecken – das ist das Herzstück dieses Plans. Hier wird die Zeit investiert.',
      'Crunches: Hände locker an die Schläfen, Blick zur Decke – kein Ziehen am Nacken. Bewusst mit der Bauchmuskulatur einrollen.',
      'Beinheben: Beine kontrolliert absenken ohne durchzuhängen – der untere Rücken bleibt flach an der Polsterung.',
      'Russian Twists: Oberkörper leicht zurückgelehnt, Füße leicht abgehoben (ab Phase 2) – durch den gesamten Oberkörper drehen, nicht nur die Arme schwingen.',
      'Kabel-Crunches: Stirn Richtung Knie ziehen, Hüfte bleibt unten – kein Vorklappen aus der Hüfte.',
      'Ab-Wheel Rollouts: Die anspruchsvollste Übung im Plan – in Phase 1 nur so weit rollen, wie die Kontrolle reicht. Kein Hohlkreuz. Ab Phase 2 weiter ausrollen.',
      'Plank-Steigerung: Wo. 1–2: 30 Sek. · Wo. 3–4: 35 Sek. · Wo. 5–6: 40 Sek. · Wo. 7–8: 45 Sek.',
      'Wichtig: Ein flacher Bauch entsteht zu einem großen Teil in der Küche – dieser Plan kräftigt und definiert die Muskulatur, aber ohne Kaloriendefizit bleibt die Definition unter einer Fettschicht verborgen.',
      'Oberkörper & Beine: Bewusst kompakter gehalten – sie sind trotzdem vollständig abgedeckt und halten den Körper in Balance.',
    ],
  },
];

// Level×Fokus→Plan — reine Nachschlagetabelle, keine Berechnung.
const ZUORDNUNG: { geschlecht: Geschlecht; level: Level; fokus: Fokus; planKey: string }[] = [
  // Männer
  { geschlecht: 'maennlich', level: 'beginner', fokus: 'kein', planKey: 'M1' },
  { geschlecht: 'maennlich', level: 'beginner', fokus: 'ruecken', planKey: 'M4' },
  { geschlecht: 'maennlich', level: 'leicht_aktiv', fokus: 'kein', planKey: 'M2' },
  { geschlecht: 'maennlich', level: 'leicht_aktiv', fokus: 'ruecken', planKey: 'M4' },
  { geschlecht: 'maennlich', level: 'regelmaessig', fokus: 'kein', planKey: 'M3' },
  { geschlecht: 'maennlich', level: 'regelmaessig', fokus: 'ruecken', planKey: 'M4' },
  { geschlecht: 'maennlich', level: 'intensiv', fokus: 'kein', planKey: 'M5' },
  { geschlecht: 'maennlich', level: 'intensiv', fokus: 'ruecken', planKey: 'M4' },
  // Frauen
  { geschlecht: 'weiblich', level: 'beginner', fokus: 'kein', planKey: 'F1' },
  { geschlecht: 'weiblich', level: 'beginner', fokus: 'ruecken', planKey: 'F5' },
  { geschlecht: 'weiblich', level: 'beginner', fokus: 'beine_po', planKey: 'F7' },
  { geschlecht: 'weiblich', level: 'beginner', fokus: 'bauch_core', planKey: 'F8' },
  { geschlecht: 'weiblich', level: 'leicht_aktiv', fokus: 'kein', planKey: 'F2' },
  { geschlecht: 'weiblich', level: 'leicht_aktiv', fokus: 'ruecken', planKey: 'F5' },
  { geschlecht: 'weiblich', level: 'leicht_aktiv', fokus: 'beine_po', planKey: 'F7' },
  { geschlecht: 'weiblich', level: 'leicht_aktiv', fokus: 'bauch_core', planKey: 'F8' },
  { geschlecht: 'weiblich', level: 'regelmaessig', fokus: 'kein', planKey: 'F3' },
  { geschlecht: 'weiblich', level: 'regelmaessig', fokus: 'ruecken', planKey: 'F5' },
  { geschlecht: 'weiblich', level: 'regelmaessig', fokus: 'beine_po', planKey: 'F7' },
  { geschlecht: 'weiblich', level: 'regelmaessig', fokus: 'bauch_core', planKey: 'F8' },
  { geschlecht: 'weiblich', level: 'intensiv', fokus: 'kein', planKey: 'F4' },
  { geschlecht: 'weiblich', level: 'intensiv', fokus: 'ruecken', planKey: 'F6' },
  { geschlecht: 'weiblich', level: 'intensiv', fokus: 'beine_po', planKey: 'F7' },
  { geschlecht: 'weiblich', level: 'intensiv', fokus: 'bauch_core', planKey: 'F8' },
];

// Manuelle Aliase für Übungsnamen, die nicht 1:1 (nach Klammer-Strip) auf die
// Übungsbibliothek matchen.
const ALIASES: Record<string, string> = {
  'Klimmzüge (Unterstützungsmaschine) oder Latzug (Untergriff)': 'Klimmzüge (Pull-ups / Chin-ups)',
  'Vorgebeugtes Kurzhantelrudern (einarmig)': 'Einarmiges Kurzhantelrudern',
  'Military Press (Langhantel, stehend)': 'Schulterdrücken / Military Press',
  'Brustpresse (Maschine)': 'Bankdrücken (Flachbank)',
  'Brustpresse (Maschine, kein freies Bankdrücken)': 'Bankdrücken (Flachbank)',
  'Kabel-Crunches (Kneeling Cable Crunches)': 'Kabel-Crunches (Kneeling Cable Crunches)',
  'Beinheben im Capoeira-Stuhl / Dip-Ständer': 'Beinheben',
  'Beinheben hängend (Klimmzugstange)': 'Beinheben',
  'Schädelzertrümmerer / French Press (SZ-Stange)': 'Schädelzertrümmerer (French Press)',
  'Shrugs / Nackenheben (Kurzhantel, leicht & kontrolliert)': 'Nackenheben / Shrugs',
  'Latzug zur Brust (breiter Griff)': 'Latzug zum Nacken / zur Brust',
  'Latzug zur Brust (enger Untergriff)': 'Latzug zum Nacken / zur Brust',
  'Latzug zur Brust (breiter Griff, kontrolliert)': 'Latzug zum Nacken / zur Brust',
  'Trizeps-Pushdowns (Kabelzug, Seil)': 'Trizepsdrücken / Kabel-Pushdowns',
  'Trizeps-Pushdowns (Kabelzug, V-Griff)': 'Trizepsdrücken / Kabel-Pushdowns',
};

function baseName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*$/, '').trim();
}

function resolveUebungId(catalog: Map<string, string>, exerciseName: string): string | null {
  if (ALIASES[exerciseName]) {
    const aliasId = catalog.get(ALIASES[exerciseName]);
    if (aliasId) return aliasId;
  }
  const exact = catalog.get(exerciseName);
  if (exact) return exact;
  const base = baseName(exerciseName);
  const baseMatch = catalog.get(base);
  if (baseMatch) return baseMatch;
  // Fallback: Katalogeintrag, dessen Basisname im Übungsnamen enthalten ist (oder umgekehrt).
  for (const [catalogName, id] of catalog) {
    const catalogBase = baseName(catalogName);
    if (base.includes(catalogBase) || catalogBase.includes(base)) return id;
  }
  return null;
}

async function main() {
  const supabase = getServiceClient();

  const { data: bibliothek, error: bibError } = await supabase.from('uebungsbibliothek').select('id, name');
  if (bibError) throw new Error(`Konnte Übungsbibliothek nicht laden: ${bibError.message}`);
  const catalog = new Map<string, string>((bibliothek ?? []).map((u: any) => [u.name, u.id]));
  if (catalog.size === 0) {
    throw new Error('Übungsbibliothek ist leer — erst "npm run seed:uebungsbibliothek" ausführen.');
  }

  const planIdByKey = new Map<string, string>();
  let unmatched = 0;

  for (let i = 0; i < PLANS.length; i++) {
    const plan = PLANS[i];

    await supabase.from('trainingsplaene').delete().eq('plan_key', plan.planKey);

    const { data: row, error } = await supabase
      .from('trainingsplaene')
      .insert({
        plan_key: plan.planKey,
        geschlecht: plan.geschlecht,
        name: plan.name,
        zielgruppe: plan.zielgruppe,
        fokus_text: plan.fokusText,
        frequenz: plan.frequenz,
        netto_minuten: plan.nettoMinuten,
        pause_hinweis: plan.pauseHinweis,
        voraussetzung: plan.voraussetzung ?? null,
        phasen: plan.phasen.map((ph) => ({ nummer: ph.nummer, wochen_von: ph.wochenVon, wochen_bis: ph.wochenBis, ziel: ph.ziel })),
        trainer_hinweise: plan.trainerHinweise,
        sort_order: i,
      })
      .select('id')
      .single();
    if (error || !row) throw new Error(`Konnte Plan "${plan.planKey}" nicht anlegen: ${error?.message}`);
    planIdByKey.set(plan.planKey, row.id);

    const rows = plan.uebungen.map((ue, idx) => {
      const uebungId = resolveUebungId(catalog, ue.name);
      if (!uebungId) {
        unmatched++;
        console.warn(`  ⚠ Keine Katalog-Übung gefunden für "${ue.name}" (${plan.planKey})`);
      }
      return {
        trainingsplan_id: row.id,
        sort_order: idx,
        name: ue.name,
        uebung_id: uebungId,
        saetze: ue.saetze,
        wiederholungen: ue.wiederholungen,
        pause_sekunden: ue.pauseSekunden,
      };
    });
    const { error: insertError } = await supabase.from('trainingsplan_uebungen').insert(rows);
    if (insertError) throw new Error(`Übungen für "${plan.planKey}" fehlgeschlagen: ${insertError.message}`);

    console.log(`✓ ${plan.planKey} — ${plan.name} (${rows.length} Übungen)`);
  }

  await supabase.from('trainingsplan_zuordnung').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const zuordnungRows = ZUORDNUNG.map((z) => {
    const trainingsplanId = planIdByKey.get(z.planKey);
    if (!trainingsplanId) throw new Error(`Zuordnung verweist auf unbekannten Plan "${z.planKey}".`);
    return { geschlecht: z.geschlecht, level: z.level, fokus: z.fokus, trainingsplan_id: trainingsplanId };
  });
  const { error: zuordnungError } = await supabase.from('trainingsplan_zuordnung').insert(zuordnungRows);
  if (zuordnungError) throw new Error(`Zuordnungstabelle fehlgeschlagen: ${zuordnungError.message}`);

  console.log(`Fertig: ${PLANS.length} Pläne, ${zuordnungRows.length} Zuordnungen${unmatched ? `, ${unmatched} nicht gematchte Übungen (uebung_id = null)` : ''}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
