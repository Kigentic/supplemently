-- Fokus-Pläne M6/M7 (Männer | Fatburn) überarbeiten. Hohe Wiederholungen
-- (15-20) bleiben wie besprochen — Fatburn-Charakter, kein Kraft-Schema.
-- Kein Zirkeltraining (im normalen Studiobetrieb nicht durchführbar, andere
-- Leute belegen die Geräte) — normales Stationstraining mit Pausen bleibt.
-- Hauptproblem war das Bein-Volumen: 5 separate Beinübungen mit 15-20
-- Wiederholungen in EINER Einheit ist für Einsteiger (M6) und auch für
-- Fortgeschrittene (M7) reine Muskelkater-Garantie ("2 Wochen nicht laufen
-- können") — auf 2 Beinübungen reduziert, alles andere bleibt im Fatburn-
-- Stil (hohe Wiederholungen, kurze-mittlere Pausen) erhalten.

-- ── M6 · Männer | Abnehmen Einsteiger (Fatburn) ──────────────────────────────

DELETE FROM public.trainingsplan_uebungen WHERE trainingsplan_id = (SELECT id FROM public.trainingsplaene WHERE plan_key = 'M6');

INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT tp.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause
FROM public.trainingsplaene tp, (VALUES
  (1, 'Beinpresse', 2, '15-20', 60),
  (2, 'Beinbeugen sitzend (Maschine)', 2, '15-20', 60),
  (3, 'Latzug zur Brust (breiter Griff)', 2, '15', 60),
  (4, 'Rudern sitzend (Kabelzug, V-Griff)', 2, '15', 60),
  (5, 'Rückenstrecken / Hyperextensions', 2, '15', 60),
  (6, 'Brustpresse (Maschine)', 2, '15', 60),
  (7, 'Schulterdrücken (Maschine)', 2, '15', 60),
  (8, 'Seitheben (Kurzhantel, leicht)', 2, '15', 45),
  (9, 'Bizepscurls (Kurzhantel, alternierend)', 2, '15', 45),
  (10, 'Trizeps-Pushdowns (Kabelzug, Seil)', 2, '15', 45),
  (11, 'Crunches (Matte)', 2, '20', 45),
  (12, 'Plank (Unterarmstütz)', 2, '30-40 Sek.', 45),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause)
WHERE tp.plan_key = 'M6';

UPDATE public.trainingsplaene SET
  trainer_hinweise = ARRAY[
    'Bewusst nur 2 Beinübungen statt 5 — 5×15-20 Wdh. Beinvolumen in einer Einheit ist für Einsteiger reine Muskelkater-Garantie, nicht Fatburn-Effekt.',
    'Hohe Wiederholungszahlen bleiben (Fatburn-Charakter), aber als normales Stationstraining — kein Zirkel, das ist im vollen Studio nicht durchführbar.',
    'Pausen bewusst kürzer als bei den Kraft-Standardplänen (45-60s) für den Fatburn-Effekt.'
  ]
WHERE plan_key = 'M6';

-- ── M7 · Männer | Abnehmen Fortgeschritten (Fatburn) ─────────────────────────

DELETE FROM public.trainingsplan_uebungen WHERE trainingsplan_id = (SELECT id FROM public.trainingsplaene WHERE plan_key = 'M7');

INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT tp.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause
FROM public.trainingsplaene tp, (VALUES
  (1, 'Kniebeugen (Langhantel oder Multipresse)', 2, '15', 60),
  (2, 'Beinbeugen liegend (Maschine)', 2, '15-20', 45),
  (3, 'Klimmzüge (Unterstützungsmaschine oder frei)', 2, '10-12', 60),
  (4, 'Vorgebeugtes Langhantelrudern', 2, '15', 60),
  (5, 'Rückenstrecken / Hyperextensions', 2, '15', 60),
  (6, 'Bankdrücken (Langhantel, Flachbank)', 2, '15', 60),
  (7, 'Dips (am Barren oder Dip-Maschine)', 2, '12-15', 60),
  (8, 'Military Press (Kurzhantel, stehend)', 2, '12', 60),
  (9, 'Seitheben (Kabelzug)', 2, '15', 45),
  (10, 'Bizepscurls (SZ-Stange)', 2, '15', 45),
  (11, 'Ab-Wheel Rollouts (Bauchroller)', 2, '10', 60),
  (12, 'Plank (Unterarmstütz)', 2, '40 Sek.', 45),
  (13, 'Wadenheben stehend (Maschine) — 1 Satz All-out', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause)
WHERE tp.plan_key = 'M7';

UPDATE public.trainingsplaene SET
  trainer_hinweise = ARRAY[
    'Bewusst nur 2 Beinübungen statt 5 (Kniebeugen + Beinbeuger) — 5×15-20 Wdh. Beinvolumen in einer Einheit war auch für Fortgeschrittene zu viel.',
    'Hohe Wiederholungszahlen bleiben (Fatburn-Charakter), aber als normales Stationstraining — kein Zirkel.',
    'Bauch nur noch über Ab-Wheel + Plank statt zusätzlich Beinheben hängend (Redundanz raus).'
  ]
WHERE plan_key = 'M7';
