-- Supplemently — Stage 4: Neue Supplemente für erweiterten Fragenkatalog
-- L-Glutamin, Chrom, B-Komplex, Selen

INSERT INTO public.supplements
  (name, kategorie, zielgruppe, wirkung, dosierung_empfehlung, kontraindikationen, evidenzlevel, ist_kombipraeparat, inhaltsstoffe)
VALUES
(
  'L-Glutamin',
  'Aminosäure',
  ARRAY['alle'],
  'Stärkt die Darmbarriere und fördert die Regeneration der Darmschleimhaut. Wichtigster Energielieferant für Darmzellen und Immunzellen.',
  '5–10 g täglich, auf nüchternen Magen oder direkt nach dem Training.',
  'Bei Nierenerkrankungen Rücksprache mit Arzt halten. In sehr hohen Dosen kontraproduktiv.',
  3,
  false,
  '[{"name": "L-Glutamin"}]'::jsonb
),
(
  'Chrom',
  'Spurenelement',
  ARRAY['alle'],
  'Verbessert die Insulinsensitivität, reguliert den Blutzuckerspiegel, kann Heißhunger auf Süßes reduzieren.',
  '200–400 µg Chrom(III) täglich zu den Mahlzeiten.',
  'Nicht gleichzeitig mit Antazida einnehmen. Bei Nierenerkrankungen Rücksprache halten.',
  3,
  false,
  '[{"name": "Chrom(III)-Picolinat"}]'::jsonb
),
(
  'B-Komplex',
  'Vitamin',
  ARRAY['alle'],
  'Unterstützt Energiestoffwechsel, Nervensystem und Neurotransmitterhaushalt. Besonders wichtig bei Stress, Alkohol, hormoneller Verhütung und pflanzenbasierter Ernährung.',
  '1 Kapsel täglich zu einer Mahlzeit.',
  'Langfristig hohe B6-Dosen (über 50 mg/Tag) können Nervenschäden verursachen. Dosierungshinweise beachten.',
  4,
  true,
  '[{"name": "Vitamin B1 (Thiamin)"}, {"name": "Vitamin B2 (Riboflavin)"}, {"name": "Vitamin B3 (Niacin)"}, {"name": "Vitamin B5 (Pantothensäure)"}, {"name": "Vitamin B6 (Pyridoxin)"}, {"name": "Vitamin B7 (Biotin)"}, {"name": "Vitamin B9 (Folsäure)"}, {"name": "Vitamin B12 (Cobalamin)"}]'::jsonb
),
(
  'Selen',
  'Spurenelement',
  ARRAY['alle'],
  'Essenziell für Schilddrüsenfunktion (T4→T3-Konversion), antioxidativen Schutz und Immunsystem.',
  '55–200 µg täglich. Nicht überdosieren — Selen wirkt bereits in kleinen Dosen potent.',
  'Maximale Tagesdosis 300 µg nicht überschreiten (Selenotoxizität möglich). Nicht mit Blutverdünnern kombinieren.',
  4,
  false,
  '[{"name": "Natriumselenit"}]'::jsonb
);
