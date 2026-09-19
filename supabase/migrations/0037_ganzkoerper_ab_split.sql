-- Ganzkörper A/B-Split für die 8 Studio-"kein Fokus"-Pläne (M1,M2,M3,M5,
-- F1-F4). Grund: Ober-/Unterkörper-Split ergibt bei 2x/Woche zu große
-- Pausen pro Muskelgruppe (6-7 Tage) für spürbaren Fortschritt — deshalb
-- bleibt es Ganzkörper, aber mit wechselndem Schwerpunkt:
--   A = Oberkörper-Fokus (Beine reduziert auf 2 Übungen à 2 Sätze)
--   B = Unterkörper-Fokus (Oberkörper reduziert auf Basics)
-- Volumen-Logik: große Muskelgruppen 6 Sätze/Einheit, kleine 4 Sätze/Einheit,
-- Schulter seitlich/hinten getrennt je 4 Sätze (nicht als Supersatz — Geräte
-- stehen im Studio meist nicht nebeneinander). Bizeps/Trizeps als Supersatz
-- (funktioniert mit Kurzhanteln/Kabelzug an einer Station). Bauch: 100
-- Wiederholungen gesamt, egal in wie vielen Sätzen. Waden: 1 Satz All-out.
-- 8-10 Wiederholungen durchgängig (vorher 12-15 — zu hoher Umfang für 60 Min.
-- im vollen Studio, siehe Chat-Verlauf).
--
-- Homeworkout- und Fokus-Pläne (Rücken/Beine-Po/Bauch-Core/Fatburn) bleiben
-- unangetastet — kommt später.

-- ── Schema ────────────────────────────────────────────────────────────────

ALTER TABLE public.challenge_teilnahmen
  ADD COLUMN IF NOT EXISTS trainingsplan_frequenz TEXT
    CHECK (trainingsplan_frequenz IN ('1x', '2x', '3x'));

ALTER TABLE public.trainingsplaene
  ADD COLUMN IF NOT EXISTS variante TEXT CHECK (variante IN ('A', 'B'));

-- trainingsplan_id (bestehend) bleibt der "1x"-Solo-Plan (unverändert).
-- Neu: trainingsplan_id_a/_b für den A/B-Split bei 2x/3x — additiv, NULL
-- solange ein Profil (noch) keinen A/B-Split hat (Fokus-Pläne, Homeworkout).
ALTER TABLE public.trainingsplan_zuordnung
  ADD COLUMN IF NOT EXISTS trainingsplan_id_a UUID REFERENCES public.trainingsplaene(id),
  ADD COLUMN IF NOT EXISTS trainingsplan_id_b UUID REFERENCES public.trainingsplaene(id);

-- ── Gemeinsame Trainer-Hinweise (A/B-Rotation, Supersatz, Bauch/Waden) ──────

-- (als Text-Array direkt in jedem INSERT unten, kein gemeinsames Table nötig)

-- ── M1-A / M1-B ── Männer | Absoluter Einsteiger ────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('M1-A', 'maennlich', 'A', 'Männer | Absoluter Einsteiger — Ganzkörper A',
    'Männer ohne Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B', 55, '45-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Bewegungsmuster lernen, Gewichte moderat wählen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht/Wiederholungen leicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Saubere Technik bei höherem Gewicht"}]'::jsonb,
    ARRAY[
      'A/B im Wechsel: bei 2×/Woche A und B abwechseln (z.B. Di=A, Fr=B). Bei 3×/Woche diese Woche A/B/A, nächste Woche B/A/B — dann kriegt beides über die Zeit gleich oft volle Priorität.',
      'Bizeps/Trizeps als Supersatz: direkt im Wechsel ohne Pause, erst nach dem Paar die angegebene Pause.',
      'Seitheben und Reverse Butterfly bewusst NICHT als Supersatz — die Geräte stehen im Studio meist nicht nebeneinander.',
      'Bauch: 100 Wiederholungen insgesamt, egal in wie vielen Sätzen (z.B. 4×25, 5×20, 10×10).',
      'Waden: 1 Satz bis zum Muskelversagen, maximale Wiederholungszahl.'
    ], 100
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Latzug zur Brust (breiter Griff)', 2, '8-10', 90),
  (2, 'Rudern sitzend (Kabelzug, V-Griff)', 2, '8-10', 90),
  (3, 'Überzug (Kabelzug/Maschine)', 2, '8-10', 90),
  (4, 'Brustpresse (Maschine)', 3, '8-10', 90),
  (5, 'Butterfly (Maschine)', 3, '8-10', 60),
  (6, 'Seitheben (Kurzhantel)', 4, '8-10', 60),
  (7, 'Reverse Butterfly (Maschine)', 4, '8-10', 60),
  (8, 'Bizepscurls (Kurzhantel, alternierend)', 4, '8-10', 45),
  (9, 'Trizeps-Pushdowns (Kabelzug, Seil)', 4, '8-10', 45),
  (10, 'Beinstrecker (Maschine)', 2, '8-10', 60),
  (11, 'Beinbeugen sitzend (Maschine)', 2, '8-10', 60),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('M1-B', 'maennlich', 'B', 'Männer | Absoluter Einsteiger — Ganzkörper B',
    'Männer ohne Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Unterkörper-Schwerpunkt (Oberkörper auf Basics reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper A', 55, '60-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Bewegungsmuster lernen, Gewichte moderat wählen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht/Wiederholungen leicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Saubere Technik bei höherem Gewicht"}]'::jsonb,
    ARRAY[
      'A/B im Wechsel: bei 2×/Woche A und B abwechseln. Bei 3×/Woche diese Woche B/A/B, nächste Woche A/B/A.',
      'Bizeps/Trizeps als Supersatz: direkt im Wechsel ohne Pause.',
      'Bauch: 100 Wiederholungen insgesamt, egal in wie vielen Sätzen.'
    ], 101
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Beinpresse', 3, '8-10', 90),
  (2, 'Beinstrecker (Maschine)', 3, '8-10', 60),
  (3, 'Beinbeugen sitzend (Maschine)', 3, '8-10', 60),
  (4, 'Hüftadduktion/-abduktion (Maschine)', 2, '8-10', 60),
  (5, 'Rückenstrecken / Hyperextensions', 2, '8-10', 90),
  (6, 'Latzug zur Brust (Basics)', 2, '8-10', 90),
  (7, 'Brustpresse (Basics)', 2, '8-10', 90),
  (8, 'Schulterdrücken (Maschine, Basics)', 2, '8-10', 90),
  (9, 'Bizepscurls (Kurzhantel)', 2, '8-10', 45),
  (10, 'Trizeps-Pushdowns (Kabelzug)', 2, '8-10', 45),
  (11, 'Wadenheben stehend (Maschine)', 3, '8-10', 60),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── M2-A / M2-B ── Männer | Leicht Aktiv ─────────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('M2-A', 'maennlich', 'A', 'Männer | Leicht Aktiv — Ganzkörper A',
    'Männer mit etwas Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B', 55, '45-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik festigen, Grundvolumen aufbauen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY[
      'A/B im Wechsel wie bei M1 — 2×/Woche abwechseln, bei 3×/Woche wochenweise rotieren.',
      'Bizeps/Trizeps als Supersatz, Schulter (Seitheben/Face Pulls) getrennt — andere Station im Studio.',
      'Bauch: 100 Wiederholungen gesamt, Waden: 1 Satz All-out.'
    ], 102
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Latzug zur Brust (enger Untergriff)', 2, '8-10', 90),
  (2, 'Rudern sitzend (Kabelzug, breiter Griff)', 2, '8-10', 90),
  (3, 'Einarmiges Kurzhantelrudern', 2, '8-10 je Seite', 90),
  (4, 'Schrägbankdrücken (Kurzhantel)', 3, '8-10', 90),
  (5, 'Butterfly (Maschine)', 3, '8-10', 60),
  (6, 'Seitheben (Kurzhantel)', 4, '8-10', 60),
  (7, 'Face Pulls (Kabelzug, Seil)', 4, '8-10', 60),
  (8, 'Bizepscurls (SZ-Stange)', 4, '8-10', 45),
  (9, 'Trizeps-Pushdowns (Kabelzug, V-Griff)', 4, '8-10', 45),
  (10, 'Beinpresse', 2, '8-10', 60),
  (11, 'Beinbeugen sitzend (Maschine)', 2, '8-10', 60),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('M2-B', 'maennlich', 'B', 'Männer | Leicht Aktiv — Ganzkörper B',
    'Männer mit etwas Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Unterkörper-Schwerpunkt (Oberkörper auf Basics reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper A', 55, '60-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik festigen, Grundvolumen aufbauen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei M1-B.', 'Bauch: 100 Wiederholungen gesamt.'], 103
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Beinpresse', 3, '8-10', 90),
  (2, 'Rumänisches Kreuzheben (Kurzhantel)', 3, '8-10', 90),
  (3, 'Ausfallschritte auf der Stelle (Kurzhantel)', 3, '8-10 je Seite', 90),
  (4, 'Rückenstrecken / Hyperextensions', 2, '8-10', 90),
  (5, 'Latzug zur Brust (Basics)', 2, '8-10', 90),
  (6, 'Schrägbankdrücken (Basics)', 2, '8-10', 90),
  (7, 'Schulterdrücken (Kurzhantel, sitzend, Basics)', 2, '8-10', 90),
  (8, 'Bizepscurls (SZ-Stange)', 2, '8-10', 45),
  (9, 'Trizeps-Pushdowns (Kabelzug)', 2, '8-10', 45),
  (10, 'Wadenheben stehend (Maschine)', 3, '8-10', 60),
  (11, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── M3-A / M3-B ── Männer | Trainiert aber planlos ───────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('M3-A', 'maennlich', 'A', 'Männer | Trainiert aber planlos — Ganzkörper A',
    'Männer mit regelmäßiger Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B', 55, '45-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Struktur reinbringen, Grundübungen sauber ausführen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY[
      'A/B im Wechsel wie bei M1.',
      'Bizeps/French Press als Supersatz, Seitheben/Face Pulls getrennt.',
      'Bauch: 100 Wiederholungen gesamt, Waden: 1 Satz All-out.'
    ], 104
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Klimmzüge (Unterstützungsmaschine oder frei)', 2, '8-10', 90),
  (2, 'Vorgebeugtes Langhantelrudern', 2, '8-10', 90),
  (3, 'Einarmiges Kurzhantelrudern', 2, '8-10 je Seite', 90),
  (4, 'Bankdrücken (Langhantel, Flachbank)', 3, '8-10', 90),
  (5, 'Schrägbankdrücken (Kurzhantel)', 3, '8-10', 60),
  (6, 'Seitheben (Kabelzug)', 4, '8-10', 60),
  (7, 'Face Pulls (Kabelzug, Seil)', 4, '8-10', 60),
  (8, 'Bizepscurls (SZ-Stange)', 4, '8-10', 45),
  (9, 'Schädelzertrümmerer / French Press (SZ-Stange)', 4, '8-10', 45),
  (10, 'Kniebeugen (Multipresse, reduziert)', 2, '8-10', 90),
  (11, 'Beinbeugen sitzend (Maschine)', 2, '8-10', 60),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('M3-B', 'maennlich', 'B', 'Männer | Trainiert aber planlos — Ganzkörper B',
    'Männer mit regelmäßiger Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Unterkörper-Schwerpunkt (Oberkörper auf Basics reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper A', 55, '60-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Struktur reinbringen, Grundübungen sauber ausführen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei M1-B.', 'Bauch: 100 Wiederholungen gesamt.'], 105
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Kniebeugen (Langhantel)', 3, '8-10', 90),
  (2, 'Rumänisches Kreuzheben (Langhantel)', 3, '8-10', 90),
  (3, 'Beinbeugen sitzend (Maschine)', 2, '8-10', 60),
  (4, 'Rückenstrecken / Hyperextensions (mit Scheibe)', 2, '8-10', 90),
  (5, 'Klimmzüge (Basics, unterstützt)', 2, '8-10', 90),
  (6, 'Bankdrücken (Basics)', 2, '8-10', 90),
  (7, 'Schulterdrücken (Kurzhantel, stehend, Basics)', 2, '8-10', 90),
  (8, 'Bizepscurls (SZ-Stange)', 2, '8-10', 45),
  (9, 'Schädelzertrümmerer / French Press (SZ-Stange)', 2, '8-10', 45),
  (10, 'Wadenheben stehend (Maschine)', 3, '8-10', 60),
  (11, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── M5-A / M5-B ── Männer | Power & Maximale Intensität ──────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES ('M5-A', 'maennlich', 'A', 'Männer | Power & Maximale Intensität — Ganzkörper A',
    'Fortgeschrittene Männer mit intensiver Trainingserfahrung',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B — mindestens ein Ruhetag zwischen den Einheiten', 55, '75-120 Sekunden, siehe Übungen',
    'Hohe Intensität — nur für Teilnehmer mit sicherer Technik bei Grundübungen. Gewicht so wählen, dass die letzten 1-2 Wiederholungen jedes Satzes wirklich hart sind.',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik unter Last festigen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern, Sätze bis nah ans Versagen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Peak-Woche — maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY[
      'A/B im Wechsel wie bei M1 — bei diesem Plan zusätzlich auf ausreichend Regeneration achten (mind. 1 Ruhetag zwischen Einheiten).',
      'Bizepscurls + Enges Bankdrücken als Supersatz (Bizeps/Trizeps), Seitheben/Face Pulls getrennt.',
      'Beinheben hängend statt Crunches: 1 Satz bis zum Versagen — anspruchsvoller als die 100-Crunches-Methode, deshalb kein festes Wiederholungsziel.'
    ], 106
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Klimmzüge (mit Zusatzgewicht falls möglich)', 2, '8-10', 120),
  (2, 'Vorgebeugtes Langhantelrudern', 2, '8-10', 120),
  (3, 'Einarmiges Kurzhantelrudern (schwer)', 2, '8-10 je Seite', 90),
  (4, 'Bankdrücken (Langhantel)', 3, '8-10', 120),
  (5, 'Schrägbankdrücken (Langhantel)', 3, '8-10', 90),
  (6, 'Seitheben (Kurzhantel, schwer)', 4, '8-10', 75),
  (7, 'Face Pulls (Kabelzug, schwer)', 4, '8-10', 75),
  (8, 'Bizepscurls (Langhantel/SZ, schwer)', 4, '8-10', 60),
  (9, 'Enges Bankdrücken (Langhantel)', 4, '8-10', 60),
  (10, 'Beinpresse (reduziert)', 2, '8-10', 90),
  (11, 'Beinbeugen liegend (Maschine)', 2, '8-10', 90),
  (12, 'Beinheben hängend (Klimmzugstange) — 1 Satz bis zum Versagen', 1, 'max.', NULL),
  (13, 'Wadenheben stehend (Maschine, schwer) — 1 Satz All-out', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES ('M5-B', 'maennlich', 'B', 'Männer | Power & Maximale Intensität — Ganzkörper B',
    'Fortgeschrittene Männer mit intensiver Trainingserfahrung',
    'Ganzkörper mit Unterkörper-Schwerpunkt (Oberkörper auf Basics reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper A — mindestens ein Ruhetag zwischen den Einheiten', 55, '90-120 Sekunden, siehe Übungen',
    'Hohe Intensität — nur für Teilnehmer mit sicherer Technik bei Grundübungen (Kniebeugen, Kreuzheben).',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik unter Last festigen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern, Sätze bis nah ans Versagen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Peak-Woche — maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei M1-B — mind. 1 Ruhetag dazwischen.', 'Beinheben hängend statt Crunches: 1 Satz bis zum Versagen.'], 107
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Kniebeugen (Langhantel, tief)', 3, '8-10', 120),
  (2, 'Kreuzheben (Langhantel)', 2, '8-10', 120),
  (3, 'Beinpresse (maximales Gewicht)', 2, '8-10', 90),
  (4, 'Beinbeugen liegend (Maschine)', 2, '8-10', 90),
  (5, 'Bankdrücken (Basics)', 2, '8-10', 120),
  (6, 'Klimmzüge (Basics)', 2, '8-10', 120),
  (7, 'Military Press (Langhantel, stehend, Basics)', 2, '8-10', 120),
  (8, 'Bizepscurls (schwer)', 2, '8-10', 60),
  (9, 'Enges Bankdrücken (Langhantel)', 2, '8-10', 60),
  (10, 'Wadenheben stehend (Maschine, schwer)', 3, '8-10', 60),
  (11, 'Beinheben hängend (Klimmzugstange) — 1 Satz bis zum Versagen', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── F1-A / F1-B ── Frauen | Absolute Einsteigerin ────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F1-A', 'weiblich', 'A', 'Frauen | Absolute Einsteigerin — Ganzkörper A',
    'Frauen ohne Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B', 55, '45-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Bewegungsmuster lernen, Gewichte moderat wählen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht/Wiederholungen leicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Saubere Technik bei höherem Gewicht"}]'::jsonb,
    ARRAY[
      'A/B im Wechsel: bei 2×/Woche abwechseln, bei 3×/Woche wochenweise rotieren (siehe M1-A).',
      'Bizeps/Trizeps als Supersatz, Seitheben/Reverse Butterfly getrennt (andere Station).',
      'Bauch: 100 Wiederholungen gesamt, Waden: 1 Satz All-out (optional, gerade bei Fokus auf Beine/Po eher zweitrangig).'
    ], 108
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Latzug zur Brust (breiter Griff)', 2, '8-10', 90),
  (2, 'Rudern sitzend (Kabelzug, V-Griff)', 2, '8-10', 90),
  (3, 'Überzug (Kabelzug/Maschine)', 2, '8-10', 90),
  (4, 'Brustpresse (Maschine)', 3, '8-10', 90),
  (5, 'Butterfly (Maschine)', 3, '8-10', 60),
  (6, 'Seitheben (Kurzhantel, leicht)', 4, '8-10', 60),
  (7, 'Reverse Butterfly (Maschine)', 4, '8-10', 60),
  (8, 'Bizepscurls (Kurzhantel)', 4, '8-10', 45),
  (9, 'Trizeps-Pushdowns (Kabelzug)', 4, '8-10', 45),
  (10, 'Adduktion (Maschine)', 2, '8-10', 60),
  (11, 'Abduktion (Maschine)', 2, '8-10', 60),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out (optional)', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F1-B', 'weiblich', 'B', 'Frauen | Absolute Einsteigerin — Ganzkörper B',
    'Frauen ohne Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Unterkörper-Schwerpunkt (Oberkörper auf Basics reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper A', 55, '60-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Bewegungsmuster lernen, Gewichte moderat wählen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht/Wiederholungen leicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Saubere Technik bei höherem Gewicht"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei F1-A.', 'Bauch: 100 Wiederholungen gesamt.'], 109
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Beinpresse', 3, '8-10', 90),
  (2, 'Beinbeugen sitzend (Maschine)', 3, '8-10', 90),
  (3, 'Adduktion (Maschine)', 2, '8-10', 60),
  (4, 'Abduktion (Maschine)', 2, '8-10', 60),
  (5, 'Hip Thrusts / Beckenheben', 3, '8-10', 60),
  (6, 'Wadenheben stehend (Maschine)', 3, '8-10', 60),
  (7, 'Latzug zur Brust (Basics)', 2, '8-10', 90),
  (8, 'Brustpresse (Basics)', 2, '8-10', 90),
  (9, 'Schulterdrücken (Maschine, Basics)', 2, '8-10', 90),
  (10, 'Bizepscurls (Kurzhantel)', 2, '8-10', 45),
  (11, 'Trizeps-Pushdowns (Kabelzug)', 2, '8-10', 45),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── F2-A / F2-B ── Frauen | Leicht Aktiv ──────────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F2-A', 'weiblich', 'A', 'Frauen | Leicht Aktiv — Ganzkörper A',
    'Frauen mit etwas Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B', 55, '45-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik festigen, Grundvolumen aufbauen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei F1-A.', 'Bizeps/Trizeps als Supersatz, Seitheben/Face Pulls getrennt.', 'Bauch: 100 Wiederholungen gesamt, Waden: 1 Satz All-out (optional).'], 110
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Latzug zur Brust (breiter Griff)', 2, '8-10', 90),
  (2, 'Rudern sitzend (Kabelzug, V-Griff)', 2, '8-10', 90),
  (3, 'Einarmiges Kurzhantelrudern', 2, '8-10 je Seite', 90),
  (4, 'Schrägbankdrücken (Maschine oder Kurzhantel)', 3, '8-10', 90),
  (5, 'Butterfly (Maschine)', 3, '8-10', 60),
  (6, 'Seitheben (Kurzhantel)', 4, '8-10', 60),
  (7, 'Face Pulls (Kabelzug, Seil)', 4, '8-10', 60),
  (8, 'Bizepscurls (Kurzhantel)', 4, '8-10', 45),
  (9, 'Trizeps-Pushdowns (Kabelzug, Seil)', 4, '8-10', 45),
  (10, 'Adduktion (Maschine)', 2, '8-10', 60),
  (11, 'Abduktion (Maschine)', 2, '8-10', 60),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out (optional)', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F2-B', 'weiblich', 'B', 'Frauen | Leicht Aktiv — Ganzkörper B',
    'Frauen mit etwas Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Unterkörper-Schwerpunkt (Oberkörper auf Basics reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper A', 55, '60-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik festigen, Grundvolumen aufbauen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei F1-A.', 'Bauch: 100 Wiederholungen gesamt.'], 111
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Beinpresse', 3, '8-10', 90),
  (2, 'Rumänisches Kreuzheben (Kurzhantel)', 3, '8-10', 90),
  (3, 'Ausfallschritte auf der Stelle (Kurzhantel)', 3, '8-10 je Seite', 90),
  (4, 'Hip Thrusts / Beckenheben (Kurzhantel)', 3, '8-10', 60),
  (5, 'Adduktion (Maschine)', 2, '8-10', 60),
  (6, 'Abduktion (Maschine)', 2, '8-10', 60),
  (7, 'Wadenheben stehend (Maschine)', 2, '8-10', 60),
  (8, 'Latzug zur Brust (Basics)', 2, '8-10', 90),
  (9, 'Schrägbankdrücken (Basics)', 2, '8-10', 90),
  (10, 'Bizepscurls (Kurzhantel)', 2, '8-10', 45),
  (11, 'Trizeps-Pushdowns (Kabelzug, Seil)', 2, '8-10', 45),
  (12, 'Crunches (Matte) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── F3-A / F3-B ── Frauen | Trainiert aber planlos ───────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F3-A', 'weiblich', 'A', 'Frauen | Trainiert aber planlos — Ganzkörper A',
    'Frauen mit regelmäßiger Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B', 55, '45-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Struktur reinbringen, Grundübungen sauber ausführen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei F1-A.', 'Bizeps/Überkopf-Trizepsdrücken als Supersatz, Seitheben/Reverse Butterfly getrennt.', 'Bauch: 100 Wiederholungen gesamt, Waden: 1 Satz All-out (optional).'], 112
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Latzug zur Brust (enger Untergriff)', 2, '8-10', 90),
  (2, 'Einarmiges Kurzhantelrudern', 2, '8-10 je Seite', 90),
  (3, 'Rudern sitzend (Kabelzug)', 2, '8-10', 90),
  (4, 'Schrägbankdrücken (Kurzhantel)', 3, '8-10', 90),
  (5, 'Butterfly (Maschine)', 3, '8-10', 60),
  (6, 'Seitheben (Kabelzug)', 4, '8-10', 60),
  (7, 'Reverse Butterfly (Maschine)', 4, '8-10', 60),
  (8, 'Bizepscurls (Kurzhantel)', 4, '8-10', 45),
  (9, 'Überkopf-Trizepsdrücken (Kurzhantel, sitzend)', 4, '8-10', 45),
  (10, 'Adduktion (Maschine)', 2, '8-10', 60),
  (11, 'Abduktion (Maschine)', 2, '8-10', 60),
  (12, 'Bauch (Crunches/Russian Twists gemischt) — 100 Wdh. gesamt', NULL, '100 gesamt', 30),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out (optional)', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F3-B', 'weiblich', 'B', 'Frauen | Trainiert aber planlos — Ganzkörper B',
    'Frauen mit regelmäßiger Trainingserfahrung, die im Studio trainieren',
    'Ganzkörper mit Unterkörper-Schwerpunkt (Oberkörper auf Basics reduziert)',
    '2-3× pro Woche im Wechsel mit Ganzkörper A', 55, '60-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Struktur reinbringen, Grundübungen sauber ausführen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei F1-A.', 'Bauch: 100 Wiederholungen gesamt.'], 113
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Kniebeugen (Multipresse oder Langhantel)', 3, '8-10', 90),
  (2, 'Rumänisches Kreuzheben (Langhantel)', 3, '8-10', 90),
  (3, 'Ausfallschritte gehend (Kurzhantel)', 3, '8-10 je Seite', 90),
  (4, 'Hip Thrusts / Beckenheben (Langhantel oder Maschine)', 3, '8-10', 60),
  (5, 'Glute Kickbacks (Kabelzug mit Schlaufe)', 2, '8-10 je Seite', 60),
  (6, 'Adduktion (Maschine)', 2, '8-10', 60),
  (7, 'Abduktion (Maschine)', 2, '8-10', 60),
  (8, 'Latzug zur Brust (Basics)', 2, '8-10', 90),
  (9, 'Schrägbankdrücken (Basics)', 2, '8-10', 90),
  (10, 'Bizepscurls (Kurzhantel)', 2, '8-10', 45),
  (11, 'Überkopf-Trizepsdrücken (Kurzhantel, sitzend)', 2, '8-10', 45),
  (12, 'Bauch (Russian Twists) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── F4-A / F4-B ── Frauen | Bauch-Beine-Po Intensiv ──────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F4-A', 'weiblich', 'A', 'Frauen | Bauch-Beine-Po Intensiv — Ganzkörper A',
    'Fortgeschrittene Frauen mit intensiver Trainingserfahrung, Fokus Bauch-Beine-Po',
    'Ganzkörper mit Oberkörper-Schwerpunkt (Beine bewusst reduziert — voller Fokus liegt in Ganzkörper B)',
    '2-3× pro Woche im Wechsel mit Ganzkörper B', 55, '45-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik unter Last festigen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern, Sätze bis nah ans Versagen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Peak-Woche — maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei F1-A — der Beine/Po-Schwerpunkt dieses Plans liegt bewusst in Ganzkörper B.', 'Bizeps/Trizeps als Supersatz, Seitheben/Face Pulls getrennt.', 'Bauch: 100 Wiederholungen gesamt, Waden: 1 Satz All-out (optional).'], 114
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Latzug zur Brust (breiter Griff)', 2, '8-10', 90),
  (2, 'Rudern sitzend (Kabelzug)', 2, '8-10', 90),
  (3, 'Einarmiges Kurzhantelrudern', 2, '8-10 je Seite', 90),
  (4, 'Schrägbankdrücken (Kurzhantel)', 3, '8-10', 90),
  (5, 'Butterfly (Maschine)', 3, '8-10', 60),
  (6, 'Seitheben (Kurzhantel)', 4, '8-10', 60),
  (7, 'Face Pulls (Kabelzug, Seil)', 4, '8-10', 60),
  (8, 'Bizepscurls (Kurzhantel)', 4, '8-10', 45),
  (9, 'Trizeps-Pushdowns (Kabelzug, Seil)', 4, '8-10', 45),
  (10, 'Beinbeugen liegend (Maschine, reduziert)', 2, '8-10', 60),
  (11, 'Adduktion (Maschine, reduziert)', 2, '8-10', 60),
  (12, 'Bauch (Crunches/Russian Twists gemischt) — 100 Wdh. gesamt', NULL, '100 gesamt', 30),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out (optional)', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause);

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, variante, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, phasen, trainer_hinweise, sort_order)
  VALUES ('F4-B', 'weiblich', 'B', 'Frauen | Bauch-Beine-Po Intensiv — Ganzkörper B',
    'Fortgeschrittene Frauen mit intensiver Trainingserfahrung, Fokus Bauch-Beine-Po',
    'Ganzkörper mit klarem Unterkörper/Po-Schwerpunkt (Herzstück dieses Plans) — Oberkörper auf Basics reduziert',
    '2-3× pro Woche im Wechsel mit Ganzkörper A', 55, '60-90 Sekunden, siehe Übungen',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Technik unter Last festigen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Gewicht steigern, Sätze bis nah ans Versagen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Peak-Woche — maximale saubere Ausbelastung"}]'::jsonb,
    ARRAY['A/B im Wechsel wie bei F1-A — hier liegt der volle Beine/Po-Fokus dieses Plans.', 'Bauch: 100 Wiederholungen gesamt.'], 115
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause FROM plan, (VALUES
  (1, 'Beinpresse (tief & kontrolliert)', 3, '8-10', 90),
  (2, 'Rumänisches Kreuzheben (Kurzhantel oder Langhantel)', 3, '8-10', 90),
  (3, 'Ausfallschritte gehend (Kurzhantel)', 3, '8-10 je Seite', 90),
  (4, 'Hip Thrusts / Beckenheben (Langhantel oder Maschine)', 3, '8-10', 60),
  (5, 'Glute Kickbacks (Kabelzug mit Schlaufe)', 2, '8-10 je Seite', 60),
  (6, 'Adduktion (Maschine)', 2, '8-10', 60),
  (7, 'Abduktion (Maschine)', 2, '8-10', 60),
  (8, 'Beinbeugen liegend (Maschine)', 2, '8-10', 60),
  (9, 'Wadenheben stehend (Maschine)', 2, '8-10', 60),
  (10, 'Latzug zur Brust (Basics)', 2, '8-10', 90),
  (11, 'Seitheben (Basics)', 2, '8-10', 60),
  (12, 'Bauch (Crunches/Russian Twists gemischt) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause);

-- ── Zuordnung aktualisieren: A/B-Paare für die 8 Studio-"kein Fokus"-Kombis ──

UPDATE public.trainingsplan_zuordnung z
SET trainingsplan_id_a = a.id, trainingsplan_id_b = b.id
FROM (VALUES
  ('maennlich', 'beginner', 'M1-A', 'M1-B'),
  ('maennlich', 'leicht_aktiv', 'M2-A', 'M2-B'),
  ('maennlich', 'regelmaessig', 'M3-A', 'M3-B'),
  ('maennlich', 'intensiv', 'M5-A', 'M5-B'),
  ('weiblich', 'beginner', 'F1-A', 'F1-B'),
  ('weiblich', 'leicht_aktiv', 'F2-A', 'F2-B'),
  ('weiblich', 'regelmaessig', 'F3-A', 'F3-B'),
  ('weiblich', 'intensiv', 'F4-A', 'F4-B')
) AS pair(geschlecht, level, a_key, b_key)
JOIN public.trainingsplaene a ON a.plan_key = pair.a_key
JOIN public.trainingsplaene b ON b.plan_key = pair.b_key
WHERE z.geschlecht = pair.geschlecht AND z.level = pair.level AND z.fokus = 'kein' AND z.ort = 'studio';
