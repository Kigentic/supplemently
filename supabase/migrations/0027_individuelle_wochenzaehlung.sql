-- Individuelle Wochenzählung pro Mitglied statt globalem Kohorten-Kalender:
-- gestartet_at wird beim Onboarding-Abschluss gesetzt und dient dort als
-- Anker für getChallengeSchedule() (Woche 1 = Montag dieser Woche). NULL =
-- altes Mitglied ohne individuelle Zählung, Fallback bleibt
-- challenges.start_datum (kein Backfill nötig, keine Disruption).

ALTER TABLE public.challenge_teilnahmen
  ADD COLUMN IF NOT EXISTS gestartet_at TIMESTAMPTZ;
