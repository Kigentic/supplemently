-- Plan B (siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md, Schritt 1): Challenge-Inhalte
-- als Daten statt hartkodierter TS-Konstante. Rein additiv — lib/challengeWeeks.ts
-- bleibt bis zum Code-Cutover unverändert die tatsächliche Datenquelle der
-- laufenden B2C-Longevity-Challenge. Diese Tabellen sind vorbereitet, aber noch
-- ungenutzt.

CREATE TABLE public.challenge_typen (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT NOT NULL UNIQUE,          -- z.B. 'longevity-lifestyle', 'ruecken-challenge'
  name          TEXT NOT NULL,
  beschreibung  TEXT,
  wochen_anzahl SMALLINT NOT NULL DEFAULT 8,
  ist_aktiv     BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.challenge_typ_wochen (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_typ_id  UUID NOT NULL REFERENCES public.challenge_typen(id) ON DELETE CASCADE,
  woche_nummer      SMALLINT NOT NULL,
  theme             TEXT NOT NULL,
  motto             TEXT,
  color             TEXT NOT NULL,
  text_color        TEXT NOT NULL,
  icon_name         TEXT NOT NULL,             -- String-Referenz auf ICON_MAP im Code, kein React-Import in der DB
  pillars           TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (challenge_typ_id, woche_nummer)
);

CREATE TABLE public.challenge_typ_habits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_typ_wochen_id UUID NOT NULL REFERENCES public.challenge_typ_wochen(id) ON DELETE CASCADE,
  sort_order              SMALLINT NOT NULL DEFAULT 0,
  text                    TEXT NOT NULL,
  why                     TEXT NOT NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.challenge_typ_habit_anleitungen (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id    UUID NOT NULL REFERENCES public.challenge_typ_habits(id) ON DELETE CASCADE,
  titel       TEXT NOT NULL,
  sort_order  SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.challenge_typ_habit_uebungen (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anleitung_id  UUID NOT NULL REFERENCES public.challenge_typ_habit_anleitungen(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  dauer         TEXT NOT NULL,
  hinweis       TEXT,
  sort_order    SMALLINT NOT NULL DEFAULT 0
);

-- RLS: Content ist öffentlich lesbar (keine sensiblen Daten), Schreiben nur Service-Role.
ALTER TABLE public.challenge_typen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge-Typen öffentlich lesbar" ON public.challenge_typen FOR SELECT USING (true);

ALTER TABLE public.challenge_typ_wochen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge-Typ-Wochen öffentlich lesbar" ON public.challenge_typ_wochen FOR SELECT USING (true);

ALTER TABLE public.challenge_typ_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenge-Typ-Habits öffentlich lesbar" ON public.challenge_typ_habits FOR SELECT USING (true);

ALTER TABLE public.challenge_typ_habit_anleitungen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anleitungen öffentlich lesbar" ON public.challenge_typ_habit_anleitungen FOR SELECT USING (true);

ALTER TABLE public.challenge_typ_habit_uebungen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Übungen öffentlich lesbar" ON public.challenge_typ_habit_uebungen FOR SELECT USING (true);

-- Ein-Zeilen-Seed: repräsentiert die bestehende, laufende Longevity-Challenge.
-- ist_aktiv bewusst false — bis der Code-Cutover (Schritt 4) steht, ist dieser
-- Eintrag nur eine Referenz für die spätere Content-Migration, nichts liest ihn.
INSERT INTO public.challenge_typen (slug, name, beschreibung, wochen_anzahl, ist_aktiv)
VALUES ('longevity-lifestyle', 'Longevity Lifestyle Challenge',
        'Die bestehende 8-Wochen-Challenge — Inhalte leben aktuell noch in lib/challengeWeeks.ts, Migration folgt separat.',
        8, false);
