-- Rabattcode-Spalte für Affiliate-Links + Codes für die 4 aktuellen Partner.
-- Supplement-Partner sind noch in Verhandlung, kommen später separat.

ALTER TABLE public.affiliate_links
  ADD COLUMN IF NOT EXISTS rabattcode TEXT;

UPDATE public.affiliate_links SET rabattcode = 'TURNKISTE-10' WHERE partner_name = 'BlackROLL';
UPDATE public.affiliate_links SET rabattcode = 'PKTRAINING'   WHERE partner_name = 'feels.like';
UPDATE public.affiliate_links SET rabattcode = 'VIVOFOREVER'  WHERE partner_name = 'Vivobarefoot';
UPDATE public.affiliate_links SET rabattcode = 'PK10'         WHERE partner_name = 'Centa-Star';
