-- Kanonische Übungsbibliothek (Standard-Übungen aus Studio-Repertoire,
-- inkl. Ausführungsvarianten je Equipment). trainingsplan_uebungen
-- referenziert diese Bibliothek für Haupt-/Finisher-Übungen, damit Namen
-- konsistent bleiben und die Geräte-Varianten den Usern angezeigt werden
-- können. Warm-up/Cooldown bleiben freitextig (uebung_id NULL).

CREATE TABLE public.uebungsbibliothek (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muskelgruppe TEXT NOT NULL,
  name         TEXT NOT NULL UNIQUE,
  varianten    TEXT NOT NULL,
  sort_order   SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trainingsplan_uebungen
  ADD COLUMN IF NOT EXISTS uebung_id UUID REFERENCES public.uebungsbibliothek(id);

ALTER TABLE public.uebungsbibliothek ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Übungsbibliothek öffentlich lesbar" ON public.uebungsbibliothek FOR SELECT USING (true);
