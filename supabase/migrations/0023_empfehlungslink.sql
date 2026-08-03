-- Einfacher Empfehlungslink für Teilnehmer: /anmelden/[slug]?ref=<eigene-teilnahme-id>.
-- Kein Bonus-System, nur Nachverfolgung wer wen geworben hat (Zähler wird
-- live per COUNT(*) berechnet, keine gespeicherte Zahl nötig).
ALTER TABLE public.challenge_teilnahmen
  ADD COLUMN IF NOT EXISTS empfohlen_von_teilnahme_id UUID REFERENCES public.challenge_teilnahmen(id) ON DELETE SET NULL;
