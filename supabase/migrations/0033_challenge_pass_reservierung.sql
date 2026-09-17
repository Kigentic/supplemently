-- Challenge-Pass (QR-Ticket): Reservierungs-Ablauf für den Value-Equation-
-- Funnel. Der Zugang wird erst beim Studio-Check-in aktiv (Freischalten-
-- Route) — bis dahin ist die Teilnahme nur "reserviert", mit Ablaufzeit.
ALTER TABLE challenge_teilnahmen
  ADD COLUMN IF NOT EXISTS reserviert_bis TIMESTAMPTZ;

COMMENT ON COLUMN challenge_teilnahmen.reserviert_bis IS
  'Ablaufzeit der Platz-Reservierung (Challenge-Pass/QR-Code) — nur relevant, solange status=pre_registered. Rein informativ für v1, kein automatisches Verfallen.';
