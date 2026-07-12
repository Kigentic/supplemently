-- Omega-6, Omega-7 und Omega-9 aus dem Supplement-Katalog entfernen.
-- Diese Einträge sind überflüssig — Omega-3 (EPA/DHA) deckt die relevante Indikation ab.

DELETE FROM public.supplements
WHERE name ILIKE 'Omega-6%'
   OR name ILIKE 'Omega-7%'
   OR name ILIKE 'Omega-9%';
