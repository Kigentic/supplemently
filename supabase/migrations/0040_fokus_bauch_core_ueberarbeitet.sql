-- Fokus-Plan F8 (Frauen | Bauch & Core) überarbeiten. Auffälligkeit: die
-- ersten 8 von 15 Übungen waren komplett generisches Ganzkörper-Programm
-- (Beinpresse, Kreuzheben, Hip Thrusts, Adduktion/Abduktion, Latzug, Rudern,
-- Brustpresse, Seitheben) ohne jeden Bezug zu "Bauch & Core" — nur die
-- restlichen 6 Übungen waren tatsächlich Core-Arbeit. Jetzt: Core als echtes
-- Herzstück mit mehreren Bewegungsmustern (Flexion/Rotation/Anti-Extension/
-- gewichtet) inkl. Geräte-Alternativen, generischer Rest auf 3 Basics-Übungen
-- runter. 8-10 Wiederholungen bei Kraft-Übungen, Zeit-/Wiederholungsangaben
-- bei reinen Core-Ausdauerübungen bleiben wie gehabt.

DELETE FROM public.trainingsplan_uebungen WHERE trainingsplan_id = (SELECT id FROM public.trainingsplaene WHERE plan_key = 'F8');

INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, saetze, wiederholungen, pause_sekunden)
SELECT tp.id, v.sort_order, v.name, v.saetze, v.wdh, v.pause
FROM public.trainingsplaene tp, (VALUES
  (1, 'Ab-Wheel Rollouts, Bauchroller (alternativ: Plank mit Vor-/Zurückrollen auf Gleitscheiben, falls kein Ab-Wheel da ist)', 3, '8-10', 75),
  (2, 'Kabel-Crunches, Kneeling Cable Crunches (alternativ: Crunches auf der Matte, falls kein Kabelturm frei ist)', 3, '10-12', 60),
  (3, 'Russian Twists (Kurzhantel oder Medizinball)', 3, '12 je Seite', 45),
  (4, 'Beinheben im Capoeira-Stuhl / Dip-Ständer (alternativ: Beinheben liegend auf der Matte)', 3, '10-12', 60),
  (5, 'Plank (Unterarmstütz)', 3, '30-45 Sek.', 45),
  (6, 'Seitlicher Plank (für die seitliche Rumpfmuskulatur)', 2, '20-30 Sek. je Seite', 45),
  (7, 'Beinpresse (Basics)', 2, '8-10', 75),
  (8, 'Latzug zur Brust, breiter Griff (Basics)', 2, '8-10', 75),
  (9, 'Rudern sitzend, Kabelzug V-Griff (Basics)', 2, '8-10', 75)
) AS v(sort_order, name, saetze, wdh, pause)
WHERE tp.plan_key = 'F8';

UPDATE public.trainingsplaene SET
  netto_minuten = 55,
  pause_hinweis = '45-75 Sekunden, siehe Übungen',
  trainer_hinweise = ARRAY[
    'Sechs echte Core-Bewegungsmuster (gewichtete Flexion, Kabel-Flexion, Rotation, Beinheben, Anti-Extension vorne/seitlich) statt generischem Ganzkörper-Programm mit ein paar Bauchübungen am Ende.',
    'Ab-Wheel und Kabel-Crunches haben Alternativen ohne Spezialgerät direkt dabei.',
    'Der generische Rest (Beine, Rücken) ist bewusst auf 3 Basics-Übungen reduziert — Fokus bleibt der Bauch.'
  ]
WHERE plan_key = 'F8';
