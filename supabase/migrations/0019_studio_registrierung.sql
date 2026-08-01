-- Studio-Registrierung (B2B): zusätzliche Felder für Ansprechpartner + Telefon,
-- plus zwei neue Challenge-Typen fürs Auswahl-Dropdown (Inhalte folgen später,
-- siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md). Longevity wird als aktiv markiert,
-- da der Code-Cutover (Schritt 4) inzwischen steht.

ALTER TABLE public.studios
  ADD COLUMN IF NOT EXISTS ansprechpartner_vorname  TEXT,
  ADD COLUMN IF NOT EXISTS ansprechpartner_nachname TEXT,
  ADD COLUMN IF NOT EXISTS telefon                  TEXT;

INSERT INTO public.challenge_typen (slug, name, beschreibung, wochen_anzahl, ist_aktiv) VALUES
  ('ruecken-fit', 'Rückenfit', 'Challenge rund um Rückengesundheit und Mobility — Inhalte folgen.', 8, true),
  ('abnehmen',    'Abnehmen',  'Challenge rund um nachhaltige Gewichtsreduktion — Inhalte folgen.', 8, true)
ON CONFLICT (slug) DO NOTHING;

UPDATE public.challenge_typen SET ist_aktiv = true WHERE slug = 'longevity-lifestyle';
