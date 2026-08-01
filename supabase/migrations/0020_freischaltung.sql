-- Manuelle Freischaltung durch das Studio (kein automatisiertes Payment über
-- uns): Endkunden, die sich für einen Challenge-Durchgang registrieren, der
-- diese Spalte auf true stehen hat, bleiben in challenge_teilnahmen.status =
-- 'pre_registered', bis ein Studio-Admin sie manuell auf 'aktiv' setzt.
-- Bewusst eine eigene Spalte statt paywall_aktiv wiederzuverwenden — letzteres
-- ist für ein späteres automatisiertes Payment (CopeCart) reserviert, hier
-- geht es um manuelle Freigabe nach Zahlung außerhalb der Plattform.

ALTER TABLE public.challenges
  ADD COLUMN IF NOT EXISTS benoetigt_freischaltung BOOLEAN NOT NULL DEFAULT false;
