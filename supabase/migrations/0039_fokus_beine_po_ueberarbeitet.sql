-- Fokus-Plan F7 (Frauen | Beine & Po) überarbeiten — gleiches Prinzip wie
-- M4/F5/F6: klare Bewegungsmuster für den Fokusbereich mit Geräte-
-- Alternativen statt hoher Wiederholungszahlen (15-20 → 8-10), Rücken/Brust
-- auf Basics reduziert, kein Schulter-Isolation mehr (nicht Kernfokus).
-- Hip Thrusts und Glute Kickbacks brauchen im Studio am ehesten Alternativen,
-- weil nicht jedes Studio eine Hip-Thrust-Bank/Kabel-Schlaufe hat.

DELETE FROM public.trainingsplan_uebungen WHERE trainingsplan_id = (SELECT id FROM public.trainingsplaene WHERE plan_key = 'F7');

INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT tp.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause
FROM public.trainingsplaene tp, (VALUES
  (1, 'Beinpresse', 2, '8-10', 90),
  (2, 'Hip Thrusts (Langhantel oder Hip-Thrust-Maschine — alternativ: Beckenheben am Boden mit Kurzhantel auf der Hüfte)', 3, '8-10', 60),
  (3, 'Ausfallschritte gehend (Kurzhantel)', 2, '8-10 je Seite', 90),
  (4, 'Glute Kickbacks, Kabelzug mit Schlaufe (alternativ: Donkey Kicks auf der Matte)', 3, '8-10 je Seite', 60),
  (5, 'Beinbeugen liegend (Maschine)', 2, '8-10', 60),
  (6, 'Adduktion (Maschine, alternativ: Wasserflasche zwischen den Knien zusammendrücken)', 2, '8-10', 60),
  (7, 'Abduktion (Maschine, alternativ: Side-Lying Abduktion auf der Matte)', 2, '8-10', 60),
  (8, 'Rudern sitzend, Kabelzug V-Griff (Basics)', 2, '8-10', 90),
  (9, 'Latzug zur Brust, breiter Griff (Basics)', 2, '8-10', 90),
  (10, 'Crunches (Matte) — 100 Wdh. gesamt, egal in wie vielen Sätzen', NULL, '100 gesamt', 30),
  (11, 'Wadenheben stehend (Maschine) — 1 Satz All-out', 1, 'max.', NULL)
) AS v(sort_order, name, saetze, wdh, pause)
WHERE tp.plan_key = 'F7';

UPDATE public.trainingsplaene SET
  netto_minuten = 55,
  pause_hinweis = '60-90 Sekunden, siehe Übungen',
  trainer_hinweise = ARRAY[
    'Sechs echte Beine/Po-Bewegungsmuster (Beinpresse, Hüftstreckung, Ausfallschritt, Gesäß-Isolation, Hamstring, Adduktion/Abduktion) statt hoher Wiederholungszahlen bei wenigen Übungen.',
    'Hip Thrusts und Glute Kickbacks haben Alternativen ohne Spezialgerät direkt dabei — nicht jedes Studio hat eine Hip-Thrust-Bank oder Kabel-Schlaufe.',
    'Bauch: 100 Wiederholungen insgesamt, egal in wie vielen Sätzen.',
    'Waden: 1 Satz bis zum Muskelversagen, maximale Wiederholungszahl.'
  ]
WHERE plan_key = 'F7';
