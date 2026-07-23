-- Erste Challenge-Kohorte anlegen, damit Registrierung/Onboarding
-- tatsächlich eine offene Challenge findet (challenge_teilnahmen).
INSERT INTO public.challenges (name, slug, start_datum, end_datum, wochen_anzahl, beschreibung, ist_aktiv, ist_offen, paywall_aktiv)
VALUES (
  'Longevity Lifestyle Challenge #1',
  'challenge-1',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '8 weeks',
  8,
  'Erste Kohorte der Longevity Lifestyle Challenge.',
  true,
  true,
  false
)
ON CONFLICT (slug) DO NOTHING;
