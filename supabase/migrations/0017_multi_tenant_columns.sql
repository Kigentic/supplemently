-- Plan B (siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md, Schritt 2): Multi-Tenant-
-- Grundgerüst, additiv + nullable. Bestehende Challenge bleibt studio_id = NULL
-- (gehört keinem Studio) und bekommt challenge_typ_id auf den in 0016 geseedeten
-- Longevity-Eintrag rückwirkend gesetzt — reine Zuordnung, kein Verhaltenswechsel.

ALTER TABLE public.challenges
  ADD COLUMN challenge_typ_id UUID REFERENCES public.challenge_typen(id),
  ADD COLUMN studio_id        UUID REFERENCES public.studios(id);

UPDATE public.challenges
SET challenge_typ_id = (SELECT id FROM public.challenge_typen WHERE slug = 'longevity-lifestyle')
WHERE challenge_typ_id IS NULL;

-- Welcher Auth-User darf als Studio-Admin auf die Challenge-Daten eines Studios zugreifen.
CREATE TABLE public.studio_admins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id   UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rolle       TEXT NOT NULL DEFAULT 'inhaber',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (studio_id, user_id)
);

-- Welche Challenge-Typen ein Studio gebucht/freigeschaltet hat.
CREATE TABLE public.studio_challenge_typen (
  studio_id           UUID NOT NULL REFERENCES public.studios(id) ON DELETE CASCADE,
  challenge_typ_id    UUID NOT NULL REFERENCES public.challenge_typen(id) ON DELETE CASCADE,
  freigeschaltet_am   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (studio_id, challenge_typ_id)
);

-- Impressums-/Kontaktdaten fürs Endkunden-Impressum pro Studio (Studio ist
-- rechtlicher Betreiber, siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md).
ALTER TABLE public.studios
  ADD COLUMN impressum JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.studio_admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht eigene Studio-Zuordnung"
  ON public.studio_admins FOR SELECT
  USING (auth.uid() = user_id);

ALTER TABLE public.studio_challenge_typen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studio-Admin sieht eigene gebuchte Typen"
  ON public.studio_challenge_typen FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.studio_admins sa
      WHERE sa.studio_id = studio_challenge_typen.studio_id AND sa.user_id = auth.uid()
    )
  );
