-- Tier-Klassifizierung für Supplement-Empfehlungen
-- basis    = Pflichtbausteine, hohe Evidenz, alle kennen sie
-- advanced = Premium/Fancy, zielgerichtete Wirkstoffe mit guter Evidenz
-- addon    = Optional/Situativ, nischiger oder ergänzend

ALTER TABLE public.supplements
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'addon'
  CHECK (tier IN ('basis', 'advanced', 'addon'));

-- ── Basis ────────────────────────────────────────────────────────────────────
UPDATE public.supplements SET tier = 'basis' WHERE name IN (
  'Vitamin D3',
  'Vitamin C',
  'Vitamin B12',
  'B-Komplex',
  'Vitamin B9 (Folat)',
  'Vitamin K2',
  'Vitamin B6 (Pyridoxin)',
  'Vitamin B7 (Biotin)',
  'Omega-3 (EPA/DHA)',
  'Magnesium',
  'Zink',
  'Eisen',
  'Calcium',
  'Selen',
  'Jod',
  'Chrom',
  'Kreatin',
  'Probiotika',
  'Flohsamenschalen',
  'Multivitamin'
);

-- ── Advanced ─────────────────────────────────────────────────────────────────
UPDATE public.supplements SET tier = 'advanced' WHERE name IN (
  'Ashwagandha',
  'Rhodiola rosea',
  'Ginseng (Panax)',
  'Schisandra',
  '5-HTP',
  'Acetyl-L-Carnitin (ALCAR)',
  'L-Theanin',
  'L-Tryptophan',
  'Glycin',
  'Alpha-Liponsäure',
  'NAC (N-Acetyl-Cystein)',
  'Quercetin',
  'Resveratrol',
  'Coenzym Q10',
  'Ubiquinol',
  'PQQ',
  'Berberin',
  'Inositol',
  'Alpha-GPC',
  'Bacopa monnieri',
  'Citicolin (CDP-Cholin)',
  'Phosphatidylserin',
  'NMN',
  'NAD+',
  'NR (Nicotinamid-Ribosid)',
  'Fisetin',
  'Spermidin',
  'Lion''s Mane (Hericium)',
  'Reishi',
  'Cordyceps',
  'Curcumin',
  'EGCG (Grüntee-Extrakt)',
  'Boswellia serrata',
  'Safran-Extrakt',
  'Kollagenpeptide'
);

-- Alles andere bleibt addon (Default)
