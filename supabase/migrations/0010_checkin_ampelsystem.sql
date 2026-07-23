-- Wochen-Check-in: Ampelsystem für Habits/Aufgaben + zwei 1-10 Skalen
-- (Wohlbefinden, wahrgenommene Schwierigkeit). Ersetzt die ursprünglich
-- vorgesehenen Einzelfragen (energie/schlaf/verdauung/...) durch das vom
-- Nutzer gewünschte, simplere Modell.

ALTER TABLE public.wochencheckins
  ADD COLUMN IF NOT EXISTS wohlbefinden SMALLINT CHECK (wohlbefinden BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS schwierigkeit SMALLINT CHECK (schwierigkeit BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS habit_status JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.wochencheckins.habit_status IS
  'Ampel-Status pro Habit-Key (z.B. "w1_h0"): gruen | gelb | rot';
