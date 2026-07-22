-- ============================================================
-- Supplemently Challenge Platform — vollständiges DB-Schema
-- Migration: 0008_challenge_platform.sql
-- ============================================================

-- ── 1. PROFILE (erweitert auth.users) ────────────────────────────────────────
-- Supabase Auth liefert auth.users.id (UUID). Wir spiegeln Profildaten hier.

CREATE TABLE public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  vorname           TEXT NOT NULL,
  nachname          TEXT NOT NULL,
  email             TEXT NOT NULL,
  handynummer       TEXT,
  -- DSGVO-Einwilligungen (Opt-in, Zeitstempel)
  dsgvo_marketing   BOOLEAN NOT NULL DEFAULT false,
  dsgvo_affiliate   BOOLEAN NOT NULL DEFAULT false,
  dsgvo_at          TIMESTAMPTZ,
  -- Buddy-System
  buddy_gewuenscht  BOOLEAN NOT NULL DEFAULT false,
  buddy_partner_id  UUID REFERENCES public.profiles(id),
  -- Meta
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht nur eigenes Profil"
  ON public.profiles FOR ALL USING (auth.uid() = id);


-- ── 2. CHALLENGES (Kohorten) ──────────────────────────────────────────────────

CREATE TABLE public.challenges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                         -- z.B. "Challenge #1 — Herbst 2026"
  slug          TEXT NOT NULL UNIQUE,                  -- z.B. "herbst-2026"
  start_datum   DATE NOT NULL,
  end_datum     DATE NOT NULL,
  wochen_anzahl SMALLINT NOT NULL DEFAULT 8,
  beschreibung  TEXT,
  ist_aktiv     BOOLEAN NOT NULL DEFAULT false,        -- sichtbar auf Landingpage
  ist_offen     BOOLEAN NOT NULL DEFAULT false,        -- Anmeldung möglich
  max_teilnehmer INT,                                  -- NULL = unbegrenzt
  paywall_aktiv BOOLEAN NOT NULL DEFAULT false,
  preis_cent    INT NOT NULL DEFAULT 990,              -- 9,90 € in Cent
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Öffentlich lesbar (für Landingpage)
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Challenges öffentlich lesbar"
  ON public.challenges FOR SELECT USING (ist_aktiv = true);
CREATE POLICY "Nur Service-Role kann schreiben"
  ON public.challenges FOR ALL USING (auth.role() = 'service_role');


-- ── 3. CHALLENGE-TEILNAHMEN ──────────────────────────────────────────────────

CREATE TYPE teilnahme_status AS ENUM ('pre_registered', 'aktiv', 'abgeschlossen', 'abgebrochen');

CREATE TABLE public.challenge_teilnahmen (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_id     UUID NOT NULL REFERENCES public.challenges(id),
  status           teilnahme_status NOT NULL DEFAULT 'pre_registered',
  -- Zahlung
  bezahlt          BOOLEAN NOT NULL DEFAULT false,
  bezahlt_at       TIMESTAMPTZ,
  copecart_order_id TEXT,
  -- Score
  gesamt_score     INT NOT NULL DEFAULT 0,
  -- Onboarding-Fragebogen-Snapshot (JSON aus lib/questions.ts Answers)
  onboarding_antworten JSONB,
  -- Baseline-Werte (für Transformation-Story am Ende)
  baseline_energie     SMALLINT CHECK (baseline_energie BETWEEN 1 AND 10),
  baseline_schlaf      SMALLINT CHECK (baseline_schlaf BETWEEN 1 AND 10),
  baseline_stress      SMALLINT CHECK (baseline_stress BETWEEN 1 AND 10),
  baseline_sport_woche SMALLINT,
  baseline_schritte    INT,
  baseline_motivation  TEXT,
  -- Endwerte (nach Woche 8 aus letztem Check-in befüllt)
  end_energie          SMALLINT CHECK (end_energie BETWEEN 1 AND 10),
  end_schlaf           SMALLINT CHECK (end_schlaf BETWEEN 1 AND 10),
  end_stress           SMALLINT CHECK (end_stress BETWEEN 1 AND 10),
  -- Referral
  referral_code        TEXT UNIQUE DEFAULT substr(md5(gen_random_uuid()::text), 1, 8),
  eingeladen_von       UUID REFERENCES public.challenge_teilnahmen(id),
  -- Meta
  joined_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_teilnahmen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht nur eigene Teilnahme"
  ON public.challenge_teilnahmen FOR ALL USING (auth.uid() = user_id);


-- ── 4. REFERRALS ─────────────────────────────────────────────────────────────

CREATE TABLE public.referrals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  einlader_teilnahme  UUID NOT NULL REFERENCES public.challenge_teilnahmen(id),
  eingeladener_user   UUID REFERENCES public.profiles(id),
  challenge_id        UUID NOT NULL REFERENCES public.challenges(id),
  referral_code       TEXT NOT NULL,
  -- Status
  geklickt_at         TIMESTAMPTZ,                  -- Link aufgerufen
  registriert_at      TIMESTAMPTZ,                  -- User hat sich registriert
  bezahlt_at          TIMESTAMPTZ,                  -- User hat bezahlt
  -- Punkte für Einlader gutgeschrieben?
  punkte_gutgeschrieben BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Einlader sieht eigene Referrals"
  ON public.referrals FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.challenge_teilnahmen WHERE id = einlader_teilnahme)
  );


-- ── 5. WOCHEN-AUFGABEN (Katalog) ─────────────────────────────────────────────

CREATE TYPE aufgaben_kategorie AS ENUM ('bewegung', 'ernaehrung', 'schlaf', 'mental', 'supplements');

CREATE TABLE public.wochen_aufgaben (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id  UUID NOT NULL REFERENCES public.challenges(id),
  woche         SMALLINT NOT NULL CHECK (woche BETWEEN 1 AND 10),
  kategorie     aufgaben_kategorie NOT NULL,
  titel         TEXT NOT NULL,               -- "10.000 Schritte täglich"
  beschreibung  TEXT,                        -- Details / Erklärung
  punkte_voll   SMALLINT NOT NULL DEFAULT 20,
  punkte_teil   SMALLINT NOT NULL DEFAULT 10,
  affiliate_link_id UUID,                    -- FK zu affiliate_links (kann NULL sein)
  sort_order    SMALLINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.wochen_aufgaben ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aufgaben lesbar für aktive Teilnehmer"
  ON public.wochen_aufgaben FOR SELECT USING (true); -- öffentlich lesbar


-- ── 6. WÖCHENTLICHE CHECK-INS ─────────────────────────────────────────────────

CREATE TYPE checkin_compliance AS ENUM ('ja', 'teilweise', 'nein');

CREATE TABLE public.wochencheckins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teilnahme_id    UUID NOT NULL REFERENCES public.challenge_teilnahmen(id) ON DELETE CASCADE,
  woche           SMALLINT NOT NULL CHECK (woche BETWEEN 1 AND 10),
  -- Befindlichkeit
  energie         SMALLINT CHECK (energie BETWEEN 1 AND 10),
  schlaf          SMALLINT CHECK (schlaf BETWEEN 1 AND 10),
  verdauung       TEXT CHECK (verdauung IN ('besser', 'gleich', 'schlechter')),
  training        BOOLEAN,             -- Training diese Woche gesteigert?
  heisshunger     TEXT CHECK (heisshunger IN ('weniger', 'gleich', 'mehr')),
  stimmung        SMALLINT CHECK (stimmung BETWEEN 1 AND 10),
  erfolg_freitext TEXT,                -- "Was war dein größter Erfolg?"
  -- Score diese Woche (berechnet beim Speichern)
  score_woche     INT NOT NULL DEFAULT 0,
  -- Streak-Flag
  streak_bonus    BOOLEAN NOT NULL DEFAULT false,
  -- Meta
  eingereicht_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teilnahme_id, woche)
);

ALTER TABLE public.wochencheckins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht nur eigene Check-ins"
  ON public.wochencheckins FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM public.challenge_teilnahmen WHERE id = teilnahme_id)
  );


-- ── 7. CHECK-IN AUFGABEN-COMPLIANCE ──────────────────────────────────────────
-- Pro Check-in: für jede Aufgabe der Woche eine Zeile

CREATE TABLE public.checkin_aufgaben (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkin_id      UUID NOT NULL REFERENCES public.wochencheckins(id) ON DELETE CASCADE,
  aufgabe_id      UUID NOT NULL REFERENCES public.wochen_aufgaben(id),
  compliance      checkin_compliance NOT NULL,
  punkte_vergeben SMALLINT NOT NULL DEFAULT 0,
  UNIQUE(checkin_id, aufgabe_id)
);

ALTER TABLE public.checkin_aufgaben ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht nur eigene Compliance"
  ON public.checkin_aufgaben FOR ALL
  USING (
    auth.uid() = (
      SELECT ct.user_id FROM public.wochencheckins wc
      JOIN public.challenge_teilnahmen ct ON ct.id = wc.teilnahme_id
      WHERE wc.id = checkin_id
    )
  );


-- ── 8. SUPPLEMENT-EMPFEHLUNGEN (Onboarding-Matching-Result) ──────────────────

CREATE TABLE public.supplement_empfehlungen (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teilnahme_id    UUID NOT NULL REFERENCES public.challenge_teilnahmen(id) ON DELETE CASCADE,
  -- Snapshot der MatchResult-Ausgabe
  match_result    JSONB NOT NULL,          -- { immer, basis, specials, addon }
  generiert_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teilnahme_id)                     -- ein Snapshot pro Teilnahme
);

ALTER TABLE public.supplement_empfehlungen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht nur eigene Empfehlungen"
  ON public.supplement_empfehlungen FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM public.challenge_teilnahmen WHERE id = teilnahme_id)
  );


-- ── 9. AFFILIATE LINKS ───────────────────────────────────────────────────────

CREATE TYPE affiliate_kategorie AS ENUM (
  'supplement', 'sportnahrung', 'regeneration', 'schlaf', 'equipment', 'sonstiges'
);

CREATE TABLE public.affiliate_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_name    TEXT NOT NULL,                      -- "Prozis", "BlackRoll"
  produkt_name    TEXT NOT NULL,
  kategorie       affiliate_kategorie NOT NULL,
  beschreibung    TEXT,
  url             TEXT NOT NULL,                      -- Affiliate-URL mit Tracking-Param
  bild_url        TEXT,
  -- Targeting: welche Antworten triggern diesen Link
  trigger_tags    TEXT[] DEFAULT '{}',                -- z.B. ['schlecht_schlaf', 'magnesium', 'vegan']
  woche           SMALLINT,                           -- NULL = jederzeit, sonst nur in dieser Woche
  ist_aktiv       BOOLEAN NOT NULL DEFAULT false,     -- erstmal alle inaktiv
  -- Stats
  klicks          INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Aktive Affiliate-Links lesbar"
  ON public.affiliate_links FOR SELECT USING (ist_aktiv = true);
CREATE POLICY "Nur Service-Role kann schreiben"
  ON public.affiliate_links FOR ALL USING (auth.role() = 'service_role');


-- ── 10. EMPFEHLUNGS-LOG (Affiliate-Tracking) ─────────────────────────────────

CREATE TYPE empfehlung_kontext AS ENUM ('onboarding', 'wochenemail', 'checkin_auswertung', 'abschluss');

CREATE TABLE public.empfehlungen_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teilnahme_id    UUID NOT NULL REFERENCES public.challenge_teilnahmen(id),
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id),
  kontext         empfehlung_kontext NOT NULL,
  woche           SMALLINT,
  -- Tracking
  gezeigt_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  geklickt_at     TIMESTAMPTZ
);

ALTER TABLE public.empfehlungen_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht eigenen Log"
  ON public.empfehlungen_log FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.challenge_teilnahmen WHERE id = teilnahme_id)
  );


-- ── 11. BADGES (Gamification — vorbereitet, UI später) ───────────────────────

CREATE TABLE public.badge_definitionen (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,     -- 'erster_checkin', 'streak_4', '3_einladungen'
  name        TEXT NOT NULL,
  beschreibung TEXT,
  icon        TEXT,                     -- Emoji oder Icon-Name
  punkte_bonus SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE public.user_badges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teilnahme_id    UUID NOT NULL REFERENCES public.challenge_teilnahmen(id),
  badge_id        UUID NOT NULL REFERENCES public.badge_definitionen(id),
  vergeben_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teilnahme_id, badge_id)
);

ALTER TABLE public.badge_definitionen ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badge-Definitionen öffentlich lesbar"
  ON public.badge_definitionen FOR SELECT USING (true);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User sieht eigene Badges"
  ON public.user_badges FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM public.challenge_teilnahmen WHERE id = teilnahme_id)
  );


-- ── 12. TESTIMONIALS (nach Challenge-Abschluss) ───────────────────────────────

CREATE TABLE public.testimonials (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teilnahme_id    UUID NOT NULL REFERENCES public.challenge_teilnahmen(id),
  -- Bewertung
  sterne          SMALLINT CHECK (sterne BETWEEN 1 AND 5),
  statement       TEXT,
  -- Transformation
  transformation_highlight TEXT,                    -- Kurzes Highlight für Social Proof
  -- Einwilligung zur Veröffentlichung
  veroeffentlichung_ok BOOLEAN NOT NULL DEFAULT false,
  -- Verifizierungsmarker (durch echte Teilnahme automatisch true)
  verifiziert     BOOLEAN NOT NULL DEFAULT true,
  eingereicht_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(teilnahme_id)
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User kann eigenes Testimonial schreiben"
  ON public.testimonials FOR ALL
  USING (
    auth.uid() = (SELECT user_id FROM public.challenge_teilnahmen WHERE id = teilnahme_id)
  );
-- Öffentlich genehmigte Testimonials (für Landingpage)
CREATE POLICY "Freigegebene Testimonials öffentlich lesbar"
  ON public.testimonials FOR SELECT USING (veroeffentlichung_ok = true);


-- ── 13. E-MAIL LOG ───────────────────────────────────────────────────────────

CREATE TYPE email_typ AS ENUM (
  'welcome', 'bestaetigung', 'onboarding_start',
  'woche_aufgaben', 'checkin_reminder', 'checkin_auswertung',
  'checkin_reminder_2',    -- nach 48h falls kein Check-in
  'abschluss', 'gewinner',
  'einladung'
);

CREATE TABLE public.email_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empfaenger_id   UUID REFERENCES public.profiles(id),
  empfaenger_email TEXT NOT NULL,
  typ             email_typ NOT NULL,
  woche           SMALLINT,
  challenge_id    UUID REFERENCES public.challenges(id),
  resend_id       TEXT,                              -- Resend Message-ID für Tracking
  gesendet_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          TEXT DEFAULT 'sent'                -- 'sent' | 'bounced' | 'failed'
);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Nur Service-Role schreibt E-Mail-Log"
  ON public.email_log FOR ALL USING (auth.role() = 'service_role');


-- ── 14. SEED: BADGE-DEFINITIONEN ─────────────────────────────────────────────

INSERT INTO public.badge_definitionen (slug, name, beschreibung, icon, punkte_bonus) VALUES
  ('erster_checkin',   'Erster Check-in',        'Dein erster Wochenrückblick eingereicht',          '✅', 10),
  ('streak_4',         '4 Wochen am Ball',        '4 Wochen in Folge Check-in eingereicht',           '🔥', 50),
  ('streak_8',         'Durchgehalten!',          'Alle 8 Wochen Check-in eingereicht',               '🏆', 100),
  ('drei_einladungen', '3 Freunde eingeladen',    '3 Freunde haben sich über deinen Link angemeldet', '👥', 75),
  ('buddy_beide',      'Buddy-Power',             'Du und dein Buddy haben beide die Challenge abgeschlossen', '🤝', 50),
  ('woche1_komplett',  'Starker Start',           'Alle Aufgaben in Woche 1 erfüllt',                 '⚡', 20);


-- ── 15. HILFSFUNKTION: Score-Update nach Check-in ────────────────────────────
-- Wird von der API nach jedem Check-in aufgerufen

CREATE OR REPLACE FUNCTION public.update_gesamt_score(p_teilnahme_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.challenge_teilnahmen
  SET gesamt_score = (
    SELECT COALESCE(SUM(score_woche), 0)
    FROM public.wochencheckins
    WHERE teilnahme_id = p_teilnahme_id
  ) + (
    SELECT COALESCE(SUM(b.punkte_bonus), 0)
    FROM public.user_badges ub
    JOIN public.badge_definitionen b ON b.id = ub.badge_id
    WHERE ub.teilnahme_id = p_teilnahme_id
  ),
  updated_at = now()
  WHERE id = p_teilnahme_id;
END;
$$;


-- ── 16. UPDATED_AT TRIGGER ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── 17. INDEXES ──────────────────────────────────────────────────────────────

CREATE INDEX idx_challenge_teilnahmen_user    ON public.challenge_teilnahmen(user_id);
CREATE INDEX idx_challenge_teilnahmen_challenge ON public.challenge_teilnahmen(challenge_id);
CREATE INDEX idx_wochencheckins_teilnahme     ON public.wochencheckins(teilnahme_id);
CREATE INDEX idx_checkin_aufgaben_checkin     ON public.checkin_aufgaben(checkin_id);
CREATE INDEX idx_empfehlungen_log_teilnahme   ON public.empfehlungen_log(teilnahme_id);
CREATE INDEX idx_referrals_einlader           ON public.referrals(einlader_teilnahme);
CREATE INDEX idx_referrals_code               ON public.referrals(referral_code);
CREATE INDEX idx_affiliate_links_tags         ON public.affiliate_links USING GIN(trigger_tags);
CREATE INDEX idx_email_log_empfaenger         ON public.email_log(empfaenger_id);
