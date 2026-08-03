-- Globales Trainingsplan-Repertoire (nicht pro Challenge-Typ dupliziert).
-- Zuordnung erfolgt zur Laufzeit über Geschlecht + gemapptes Trainingslevel
-- (aus challenge_teilnahmen.onboarding_antworten) + Phase (Woche 1-4 / 5-8).
-- Siehe Konzept in der Session: RPE-Lastvorgabe statt fixer kg-Zahlen, da wir
-- keine 1RM-Daten pro User haben.

CREATE TABLE public.trainingsplaene (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geschlecht  TEXT NOT NULL CHECK (geschlecht IN ('maennlich', 'weiblich')),
  level       TEXT NOT NULL CHECK (level IN ('beginner', 'fortgeschritten', 'advanced')),
  phase       SMALLINT NOT NULL CHECK (phase IN (1, 2)),
  variante    SMALLINT NOT NULL CHECK (variante IN (1, 2)),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (geschlecht, level, phase, variante)
);

CREATE TABLE public.trainingsplan_uebungen (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainingsplan_id  UUID NOT NULL REFERENCES public.trainingsplaene(id) ON DELETE CASCADE,
  sort_order        SMALLINT NOT NULL DEFAULT 0,
  block             TEXT NOT NULL CHECK (block IN ('warmup', 'haupt', 'finisher', 'cooldown')),
  name              TEXT NOT NULL,
  saetze            SMALLINT,
  wiederholungen    TEXT,             -- z.B. "8-12" oder "45 Sek."
  pause_sekunden    SMALLINT,
  lastvorgabe       TEXT,             -- RPE-Text statt fixer kg-Zahl
  hinweis           TEXT              -- Ausführungshinweis
);

-- Öffentlich lesbar (keine sensiblen Daten), Schreiben nur Service-Role —
-- gleiches Muster wie challenge_typ_*-Tabellen.
ALTER TABLE public.trainingsplaene ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainingspläne öffentlich lesbar" ON public.trainingsplaene FOR SELECT USING (true);

ALTER TABLE public.trainingsplan_uebungen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainingsplan-Übungen öffentlich lesbar" ON public.trainingsplan_uebungen FOR SELECT USING (true);
