-- Fokus-Spezialpläne überarbeiten (M4, F5, F6 — "Rücken"), Homeworkout und
-- die restlichen Fokus-Pläne (F7 Beine&Po, F8 Bauch&Core, M6/M7 Fatburn)
-- bleiben für spätere Schritte. Prinzip: Rücken als klarer Schwerpunkt mit
-- mehreren echten Zugbewegungen (vertikal/horizontal/unterer Rücken/hintere
-- Schulter) statt wahllos verteilter Sätze — dafür mit Geräte-Alternativen
-- direkt im Übungsnamen, weil nicht jedes Studio jede Maschine hat. Sekundäre
-- Muskelgruppen auf Basics reduziert. 8-10 Wiederholungen durchgängig
-- (vorher 12-15). F6 ist ein Kombi-Plan (BBP + Rücken) und behält deshalb
-- volle Beine/Po-Arbeit zusätzlich zum vollen Rücken-Anteil.

-- ── M4 · Männer | Rücken-Spezialplan ─────────────────────────────────────────

DELETE FROM public.trainingsplan_uebungen WHERE trainingsplan_id = (SELECT id FROM public.trainingsplaene WHERE plan_key = 'M4');

INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT tp.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause
FROM public.trainingsplaene tp, (VALUES
  (1, 'Latzug zur Brust, breiter Griff (alternativ: Klimmzug-Assistenzmaschine)', 2, '8-10', 90),
  (2, 'Rudern sitzend, Kabelzug V-Griff (alternativ: Rudermaschine oder einarmiges Kurzhantelrudern)', 2, '8-10', 90),
  (3, 'Latzug, enger Untergriff (alternativ: einarmiges Kabelrudern stehend)', 2, '8-10', 90),
  (4, 'Rückenstrecken / Hyperextensions (alternativ: Superman am Boden, falls keine Hyperextensions-Bank da ist)', 2, '8-10', 90),
  (5, 'Face Pulls, Kabelzug (alternativ: Reverse Butterfly an der Pec-Deck)', 4, '8-10', 60),
  (6, 'Beinpresse (Basics, reduziert)', 2, '8-10', 60),
  (7, 'Beinbeugen sitzend (Basics, reduziert)', 2, '8-10', 60),
  (8, 'Brustpresse (Maschine, Basics)', 2, '8-10', 90),
  (9, 'Bizepscurls (Kurzhantel, alternierend)', 2, '8-10', 45),
  (10, 'Trizeps-Pushdowns (Kabelzug, Seil)', 2, '8-10', 45),
  (11, 'Crunches (Matte) — 100 Wdh. gesamt, egal in wie vielen Sätzen', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause)
WHERE tp.plan_key = 'M4';

UPDATE public.trainingsplaene SET
  netto_minuten = 55,
  pause_hinweis = '45-90 Sekunden, siehe Übungen',
  trainer_hinweise = ARRAY[
    'Vier echte Rücken-Bewegungsmuster statt vieler verstreuter Sätze: Vertikalzug (Latzug breit), Horizontalzug (Rudern), zweiter Vertikalzug (enger Untergriff), unterer Rücken (Hyperextensions) + Face Pulls für die hintere Schulter.',
    'Wo eine Maschine im Studio fehlt: die genannte Alternative direkt nutzen, keine Wartezeit auf ein bestimmtes Gerät nötig.',
    'Bizeps/Trizeps als Supersatz: direkt im Wechsel ohne Pause.',
    'Bauch: 100 Wiederholungen insgesamt, egal in wie vielen Sätzen (z.B. 4×25, 5×20, 10×10).'
  ]
WHERE plan_key = 'M4';

-- ── F5 · Frauen | Rücken & Nacken Spezialplan ────────────────────────────────

DELETE FROM public.trainingsplan_uebungen WHERE trainingsplan_id = (SELECT id FROM public.trainingsplaene WHERE plan_key = 'F5');

INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT tp.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause
FROM public.trainingsplaene tp, (VALUES
  (1, 'Latzug zur Brust, breiter Griff (alternativ: Klimmzug-Assistenzmaschine)', 2, '8-10', 90),
  (2, 'Rudern sitzend, Kabelzug V-Griff (alternativ: Rudermaschine oder einarmiges Kurzhantelrudern)', 2, '8-10', 90),
  (3, 'Latzug, enger Untergriff (alternativ: einarmiges Kabelrudern stehend)', 2, '8-10', 90),
  (4, 'Rückenstrecken / Hyperextensions (alternativ: Superman am Boden, falls keine Hyperextensions-Bank da ist)', 2, '8-10', 90),
  (5, 'Face Pulls, Kabelzug (alternativ: Reverse Butterfly an der Pec-Deck)', 4, '8-10', 60),
  (6, 'Beinpresse (Basics, reduziert)', 2, '8-10', 60),
  (7, 'Beinbeugen sitzend (Basics, reduziert)', 2, '8-10', 60),
  (8, 'Brustpresse (Maschine, Basics)', 2, '8-10', 90),
  (9, 'Bizepscurls (Kurzhantel, alternierend)', 2, '8-10', 45),
  (10, 'Trizeps-Pushdowns (Kabelzug, Seil)', 2, '8-10', 45),
  (11, 'Crunches (Matte) — 100 Wdh. gesamt, egal in wie vielen Sätzen', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause)
WHERE tp.plan_key = 'F5';

UPDATE public.trainingsplaene SET
  netto_minuten = 55,
  pause_hinweis = '45-90 Sekunden, siehe Übungen',
  trainer_hinweise = ARRAY[
    'Vier echte Rücken-Bewegungsmuster statt vieler verstreuter Sätze: Vertikalzug (Latzug breit), Horizontalzug (Rudern), zweiter Vertikalzug (enger Untergriff), unterer Rücken (Hyperextensions) + Face Pulls für die hintere Schulter/Nacken.',
    'Wo eine Maschine im Studio fehlt: die genannte Alternative direkt nutzen.',
    'Bizeps/Trizeps als Supersatz: direkt im Wechsel ohne Pause.',
    'Bauch: 100 Wiederholungen insgesamt, egal in wie vielen Sätzen.'
  ]
WHERE plan_key = 'F5';

-- ── F6 · Frauen | Fortgeschrittene BBP & Rücken Kombination ──────────────────
-- Kombi-Plan: behält volle Beine/Po-Arbeit UND vollen Rücken-Anteil (das ist
-- der Zweck dieses Plans), nur Nebensächliches (Schulter-Isolation) raus.

DELETE FROM public.trainingsplan_uebungen WHERE trainingsplan_id = (SELECT id FROM public.trainingsplaene WHERE plan_key = 'F6');

INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT tp.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause
FROM public.trainingsplaene tp, (VALUES
  (1, 'Kniebeugen (Multipresse oder Langhantel)', 2, '8-10', 90),
  (2, 'Rumänisches Kreuzheben (Langhantel)', 2, '8-10', 90),
  (3, 'Hip Thrusts (Langhantel oder Hip-Thrust-Maschine — alternativ: Beckenheben am Boden mit Kurzhantel auf der Hüfte)', 3, '8-10', 60),
  (4, 'Ausfallschritte gehend (Kurzhantel)', 2, '8-10 je Seite', 90),
  (5, 'Glute Kickbacks, Kabelzug mit Schlaufe (alternativ: Donkey Kicks auf der Matte)', 2, '8-10 je Seite', 60),
  (6, 'Adduktion (Maschine)', 2, '8-10', 60),
  (7, 'Abduktion (Maschine)', 2, '8-10', 60),
  (8, 'Klimmzüge, Unterstützungsmaschine (alternativ: Latzug Untergriff)', 2, '8-10', 90),
  (9, 'Einarmiges Kurzhantelrudern', 2, '8-10 je Seite', 90),
  (10, 'Rückenstrecken / Hyperextensions (alternativ: Superman am Boden)', 2, '8-10', 90),
  (11, 'Face Pulls, Kabelzug (alternativ: Reverse Butterfly)', 3, '8-10', 60),
  (12, 'Schrägbankdrücken (Kurzhantel, Basics)', 2, '8-10', 90),
  (13, 'Bauch (Kabel-Crunches/Russian Twists gemischt) — 100 Wdh. gesamt', NULL, '100 gesamt', 30)
) AS v(sort_order, name, saetze, wdh, pause)
WHERE tp.plan_key = 'F6';

UPDATE public.trainingsplaene SET
  netto_minuten = 60,
  pause_hinweis = '60-90 Sekunden, siehe Übungen',
  trainer_hinweise = ARRAY[
    'Kombi-Plan: volle Beine/Po-Arbeit UND voller Rücken-Anteil bleiben bewusst beide erhalten — Schulter-Isolation ist dafür raus.',
    'Wo eine Maschine im Studio fehlt (v.a. Hip-Thrust-Maschine, Kabel-Schlaufe für Kickbacks): die genannte Alternative direkt nutzen.',
    'Bauch: 100 Wiederholungen insgesamt, egal in wie vielen Sätzen.'
  ]
WHERE plan_key = 'F6';
