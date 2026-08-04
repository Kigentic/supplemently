-- Ersetzt das generische 24-Plan-Grid (Level×Phase×Variante) durch die 13
-- kuratierten Trainingspläne (M1-M5, F1-F8, siehe kb/*.md). Pläne sind jetzt
-- individuell (variable Phasenanzahl/-grenzen, eigene Zielgruppe/Fokus-Texte,
-- plan-weite Trainer-Hinweise statt pro Übung). Zuordnung Level×Fokus→Plan
-- läuft über eine reine Nachschlagetabelle (trainingsplan_zuordnung).

-- Onboarding-Wunsch + Fokus (im Check-in überschreibbar, daher eigene
-- Spalten statt Teil der eingefrorenen onboarding_antworten-JSON-Snapshot).
ALTER TABLE public.challenge_teilnahmen
  ADD COLUMN IF NOT EXISTS trainingsplan_gewuenscht BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.challenge_teilnahmen
  ADD COLUMN IF NOT EXISTS trainingsplan_fokus TEXT
    CHECK (trainingsplan_fokus IN ('kein', 'ruecken', 'beine_po', 'bauch_core'));

DROP TABLE IF EXISTS public.trainingsplan_uebungen;
DROP TABLE IF EXISTS public.trainingsplaene;

CREATE TABLE public.trainingsplaene (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key         TEXT NOT NULL UNIQUE,  -- 'M1'..'M5', 'F1'..'F8'
  geschlecht       TEXT NOT NULL CHECK (geschlecht IN ('maennlich', 'weiblich')),
  name             TEXT NOT NULL,
  zielgruppe       TEXT NOT NULL,
  fokus_text       TEXT NOT NULL,
  frequenz         TEXT NOT NULL,
  netto_minuten    SMALLINT NOT NULL DEFAULT 60,
  pause_hinweis    TEXT NOT NULL,
  voraussetzung    TEXT,                  -- optionale Warnung (z.B. M5, M4, F5)
  phasen           JSONB NOT NULL,        -- [{nummer, wochen_von, wochen_bis, ziel}]
  trainer_hinweise TEXT[] NOT NULL DEFAULT '{}',
  sort_order       SMALLINT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.trainingsplan_uebungen (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainingsplan_id  UUID NOT NULL REFERENCES public.trainingsplaene(id) ON DELETE CASCADE,
  sort_order        SMALLINT NOT NULL DEFAULT 0,
  name              TEXT NOT NULL,
  uebung_id         UUID REFERENCES public.uebungsbibliothek(id),
  saetze            SMALLINT,
  wiederholungen    TEXT,
  pause_sekunden    SMALLINT
);

CREATE TABLE public.trainingsplan_zuordnung (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  geschlecht       TEXT NOT NULL CHECK (geschlecht IN ('maennlich', 'weiblich')),
  level            TEXT NOT NULL CHECK (level IN ('beginner', 'leicht_aktiv', 'regelmaessig', 'intensiv')),
  fokus            TEXT NOT NULL CHECK (fokus IN ('kein', 'ruecken', 'beine_po', 'bauch_core')),
  trainingsplan_id UUID NOT NULL REFERENCES public.trainingsplaene(id) ON DELETE CASCADE,
  UNIQUE (geschlecht, level, fokus)
);

ALTER TABLE public.trainingsplaene ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainingspläne öffentlich lesbar" ON public.trainingsplaene FOR SELECT USING (true);

ALTER TABLE public.trainingsplan_uebungen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainingsplan-Übungen öffentlich lesbar" ON public.trainingsplan_uebungen FOR SELECT USING (true);

ALTER TABLE public.trainingsplan_zuordnung ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trainingsplan-Zuordnung öffentlich lesbar" ON public.trainingsplan_zuordnung FOR SELECT USING (true);
