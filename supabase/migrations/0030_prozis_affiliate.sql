-- Neuer Affiliate-Partner: Prozis (Supplement-Shop) — der in 0014 erwähnte
-- "Supplement-Partner in Verhandlung" ist jetzt fix. Code TURNKISTE (10%,
-- gesamte Bestellung).

INSERT INTO public.affiliate_links (partner_name, produkt_name, kategorie, beschreibung, url, trigger_tags, woche, rabattcode, ist_aktiv) VALUES
  ('Prozis', '10% Rabatt auf das gesamte Sortiment', 'supplement',
   'Europas großer Supplement-Shop — Proteine, Kreatin, Vitamine & Sportnahrung. Mit Code 10% Rabatt auf die gesamte Bestellung.',
   'https://prozis.com',
   ARRAY['training','krafttraining'], NULL, 'TURNKISTE', true);
