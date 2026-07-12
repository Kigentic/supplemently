-- Migration 0004: Supplement-Matrix 100 Wirkstoffe
-- Adds bevorzugte_form + kombinationen, then replaces all supplement data.

ALTER TABLE public.supplements
  ADD COLUMN IF NOT EXISTS bevorzugte_form text,
  ADD COLUMN IF NOT EXISTS kombinationen text[] NOT NULL DEFAULT ARRAY[]::text[];

TRUNCATE public.supplements CASCADE;

INSERT INTO public.supplements
  (name, kategorie, zielgruppe, wirkung, bevorzugte_form, kombinationen, evidenzlevel, ist_kombipraeparat)
VALUES

-- 1
('Vitamin A (Retinol)', 'Vitamin', ARRAY['alle'],
 'Sehkraft, Schleimhäute und Immunfunktion',
 'Retinylpalmitat oder Retinylacetat; ölbasierte Form',
 ARRAY['Zink','Vitamin D3','Vitamin E'], 4, false),

-- 2
('Beta-Carotin', 'Vitamin', ARRAY['alle'],
 'Provitamin-A-Versorgung und antioxidativer Zellschutz',
 'Natürliches gemischtes Carotinoid, z. B. aus Dunaliella salina',
 ARRAY['Vitamin E','Lutein','Zeaxanthin'], 3, false),

-- 3
('Vitamin B1 (Thiamin)', 'Vitamin', ARRAY['alle'],
 'Kohlenhydratstoffwechsel und Nervenfunktion',
 'Thiaminhydrochlorid; Benfotiamin bei gezielter Anwendung',
 ARRAY['Magnesium','Vitamin B2','Vitamin B6'], 4, false),

-- 4
('Vitamin B2 (Riboflavin)', 'Vitamin', ARRAY['alle'],
 'Energiestoffwechsel und Redoxsysteme',
 'Riboflavin-5''-phosphat',
 ARRAY['Vitamin B3','Vitamin B6','Magnesium'], 4, false),

-- 5
('Vitamin B3 (Niacin)', 'Vitamin', ARRAY['alle'],
 'Energiestoffwechsel und NAD-Synthese',
 'Nicotinamid für allgemeine Versorgung; Nicotinsäure nur gezielt',
 ARRAY['Vitamin B2','Tryptophan','Magnesium'], 4, false),

-- 6
('Vitamin B5 (Pantothensäure)', 'Vitamin', ARRAY['alle'],
 'Coenzym-A-Bildung und Energiestoffwechsel',
 'Calcium-D-pantothenat',
 ARRAY['B-Komplex','Magnesium'], 3, false),

-- 7
('Vitamin B6 (Pyridoxin)', 'Vitamin', ARRAY['alle'],
 'Aminosäurestoffwechsel und Neurotransmitterbildung',
 'Pyridoxal-5''-phosphat (P-5-P)',
 ARRAY['Magnesium','Vitamin B12','Folat'], 4, false),

-- 8
('Vitamin B7 (Biotin)', 'Vitamin', ARRAY['alle'],
 'Fettstoffwechsel sowie Haut- und Haarstoffwechsel',
 'D-Biotin',
 ARRAY['Zink','Selen','B-Komplex'], 3, false),

-- 9
('Vitamin B9 (Folat)', 'Vitamin', ARRAY['alle'],
 'Zellteilung, Blutbildung und Homocystein-Stoffwechsel',
 '5-MTHF / L-Methylfolat, z. B. Quatrefolic®',
 ARRAY['Vitamin B12','Vitamin B6','Vitamin B2'], 5, false),

-- 10
('Vitamin B12', 'Vitamin', ARRAY['alle'],
 'Nervenfunktion, Blutbildung und Methylierung',
 'Methylcobalamin oder Hydroxocobalamin; Adenosylcobalamin ergänzend',
 ARRAY['Folat','Vitamin B6','Eisen'], 5, false),

-- 11
('Vitamin C', 'Vitamin', ARRAY['alle'],
 'Antioxidativer Schutz, Kollagensynthese und Eisenaufnahme',
 'Ascorbinsäure; gepufferte Ascorbate bei empfindlichem Magen',
 ARRAY['Eisen','Kollagen','Vitamin E'], 5, false),

-- 12
('Vitamin D3', 'Vitamin', ARRAY['alle'],
 'Calciumstoffwechsel, Knochen und Immunfunktion',
 'Cholecalciferol in ölbasierter Form',
 ARRAY['Magnesium','Vitamin K2','Calcium'], 5, false),

-- 13
('Vitamin E', 'Vitamin', ARRAY['alle'],
 'Schutz von Zellmembranen und Fettsäuren vor Oxidation',
 'Gemischte natürliche Tocopherole und Tocotrienole',
 ARRAY['Omega-3','Vitamin C','Selen'], 3, false),

-- 14
('Vitamin K2', 'Vitamin', ARRAY['alle'],
 'Calciumverteilung und Knochenstoffwechsel',
 'Menachinon-7 all-trans (MK-7); alternativ MK-4',
 ARRAY['Vitamin D3','Magnesium'], 3, false),

-- 15
('Magnesium', 'Mineral', ARRAY['alle'],
 'Muskeln, Nerven, Energiestoffwechsel und Elektrolythaushalt',
 'Bisglycinat für Verträglichkeit; Citrat bei gewünschtem laxierendem Effekt; Malat tagsüber',
 ARRAY['Vitamin D3','Vitamin B6','Taurin'], 5, false),

-- 16
('Calcium', 'Mineral', ARRAY['alle'],
 'Knochen, Zähne, Muskelkontraktion und Signalübertragung',
 'Calciumcitrat oder Calciumcitrat-Malat',
 ARRAY['Vitamin D3','Vitamin K2','Magnesium'], 4, false),

-- 17
('Kalium', 'Mineral', ARRAY['alle'],
 'Elektrolythaushalt, Blutdruckregulation und Muskelarbeit',
 'Kaliumcitrat; höhere Dosierungen nur medizinisch begleitet',
 ARRAY['Magnesium','Natrium'], 3, false),

-- 18
('Natrium', 'Mineral', ARRAY['alle'],
 'Flüssigkeitshaushalt, Nervenleitung und Muskelarbeit',
 'Natriumchlorid oder Natriumcitrat im Elektrolytkontext',
 ARRAY['Kalium','Magnesium'], 3, false),

-- 19
('Phosphor', 'Mineral', ARRAY['alle'],
 'Knochen, ATP und Zellmembranen',
 'Meist als Phosphat; Supplementierung selten nötig',
 ARRAY['Calcium','Vitamin D3','Magnesium'], 2, false),

-- 20
('Eisen', 'Mineral', ARRAY['alle'],
 'Hämoglobinbildung und Sauerstofftransport',
 'Eisenbisglycinat; nur bei nachgewiesenem Bedarf',
 ARRAY['Vitamin C','Folat','Vitamin B12'], 5, false),

-- 21
('Zink', 'Mineral', ARRAY['alle'],
 'Immunsystem, Haut, Wundheilung und Enzymfunktion',
 'Zinkbisglycinat, -picolinat oder -citrat',
 ARRAY['Vitamin A','Kupfer'], 5, false),

-- 22
('Kupfer', 'Mineral', ARRAY['alle'],
 'Eisenstoffwechsel, Bindegewebe und antioxidative Enzyme',
 'Kupferbisglycinat oder Kupfergluconat',
 ARRAY['Zink','Eisen'], 3, false),

-- 23
('Selen', 'Mineral', ARRAY['alle'],
 'Schilddrüsenenzyme und antioxidativer Zellschutz',
 'L-Selenomethionin; Natriumselenit für gezielte Anwendung',
 ARRAY['Jod','Vitamin E'], 4, false),

-- 24
('Jod', 'Mineral', ARRAY['alle'],
 'Schilddrüsenhormonsynthese',
 'Kaliumiodid; Algen nur mit standardisiertem Jodgehalt',
 ARRAY['Selen','L-Tyrosin'], 4, false),

-- 25
('Mangan', 'Mineral', ARRAY['alle'],
 'Bindegewebe, Knochen und antioxidative Enzyme',
 'Mangancitrat oder -bisglycinat',
 ARRAY['Magnesium','Vitamin C'], 3, false),

-- 26
('Chrom', 'Mineral', ARRAY['alle'],
 'Makronährstoff- und Glukosestoffwechsel',
 'Chrompicolinat oder Chromchlorid',
 ARRAY['Berberin','Inositol','Magnesium'], 3, false),

-- 27
('Molybdän', 'Mineral', ARRAY['alle'],
 'Cofaktor schwefel- und purinverarbeitender Enzyme',
 'Natriummolybdat oder Molybdänglycinat',
 ARRAY['B-Komplex'], 2, false),

-- 28
('Bor', 'Mineral', ARRAY['alle'],
 'Knochenstoffwechsel und Steroidhormon-Metabolismus',
 'Bor-Citrat, -Glycinat oder Calcium-Fructoborat',
 ARRAY['Vitamin D3','Magnesium','Calcium'], 2, false),

-- 29
('Silizium (Silica)', 'Mineral', ARRAY['alle'],
 'Bindegewebe, Haut, Haare und Nägel',
 'Cholin-stabilisierte Orthokieselsäure',
 ARRAY['Vitamin C','Kollagenpeptide'], 2, false),

-- 30
('Omega-3 (EPA/DHA)', 'Fettsäuren', ARRAY['alle'],
 'Herz-Kreislauf, Gehirn, Zellmembranen und Entzündungsbalance',
 'Fisch- oder Algenöl mit ausgewiesenem EPA-/DHA-Gehalt; Triglycerid-/rTG-Form',
 ARRAY['Vitamin E','Astaxanthin','CoQ10'], 5, false),

-- 31
('Omega-3 (ALA)', 'Fettsäuren', ARRAY['vegan','vegetarisch'],
 'Pflanzliche Omega-3-Zufuhr und Fettsäurebalance',
 'Lein-, Chia- oder Perillaöl; frisch und oxidationsgeschützt',
 ARRAY['Vitamin E','Omega-3 (EPA/DHA)'], 3, false),

-- 32
('Omega-6 (GLA)', 'Fettsäuren', ARRAY['alle'],
 'Hautbarriere und Eicosanoid-Stoffwechsel',
 'Borretsch- oder Nachtkerzenöl, standardisiert auf GLA',
 ARRAY['Omega-3 (EPA/DHA)','Vitamin E'], 3, false),

-- 33
('Omega-7 (Palmitoleinsäure)', 'Fettsäuren', ARRAY['alle'],
 'Haut- und Schleimhautunterstützung; Evidenz begrenzt',
 'Sanddorn- oder Macadamiaöl mit ausgewiesenem Omega-7-Gehalt',
 ARRAY['Omega-3 (EPA/DHA)','Vitamin E'], 2, false),

-- 34
('Omega-9 (Ölsäure)', 'Fettsäuren', ARRAY['alle'],
 'Einfach ungesättigte Fettsäureversorgung',
 'Olivenöl oder standardisierte Ölsäurequelle; Supplement meist nicht nötig',
 ARRAY['Vitamin E','Polyphenole'], 2, false),

-- 35
('Krillöl', 'Fettsäuren', ARRAY['alle'],
 'Omega-3-Versorgung in phospholipidreicher Form',
 'Phospholipidgebundene EPA/DHA-Form mit Astaxanthin',
 ARRAY['Vitamin E','CoQ10'], 3, false),

-- 36
('L-Carnitin', 'Aminosäuren', ARRAY['alle'],
 'Fettsäuretransport und mitochondriale Energiegewinnung',
 'L-Carnitin-L-Tartrat für Sport',
 ARRAY['CoQ10','Alpha-Liponsäure'], 3, false),

-- 37
('Acetyl-L-Carnitin (ALCAR)', 'Aminosäuren', ARRAY['alle'],
 'Mitochondriale Energie und kognitiver Fokus',
 'Acetyl-L-Carnitin',
 ARRAY['Alpha-Liponsäure','CoQ10'], 3, false),

-- 38
('Taurin', 'Aminosäuren', ARRAY['alle'],
 'Zellhydratation, Nervensystem, Herz und Gallensäurestoffwechsel',
 'Freies Taurin',
 ARRAY['Magnesium','Elektrolyte','CoQ10'], 3, false),

-- 39
('Glycin', 'Aminosäuren', ARRAY['alle'],
 'Kollagenbildung, inhibitorische Signalübertragung und Schlafqualität',
 'Reines Glycinpulver',
 ARRAY['Kollagenpeptide','Vitamin C','Magnesium'], 3, false),

-- 40
('L-Theanin', 'Aminosäuren', ARRAY['alle'],
 'Entspannung ohne starke Sedierung und Aufmerksamkeitsbalance',
 'Reines L-Theanin, häufig Suntheanine®',
 ARRAY['Koffein','Magnesium'], 4, false),

-- 41
('L-Tyrosin', 'Aminosäuren', ARRAY['alle'],
 'Catecholamin- und Schilddrüsenhormon-Vorstufe',
 'L-Tyrosin; N-Acetyl-L-Tyrosin nicht automatisch überlegen',
 ARRAY['Jod','Selen','Vitamin B6'], 3, false),

-- 42
('L-Tryptophan', 'Aminosäuren', ARRAY['alle'],
 'Serotonin- und Melatonin-Vorstufe',
 'Reines L-Tryptophan',
 ARRAY['Vitamin B6','Magnesium'], 3, false),

-- 43
('5-HTP', 'Aminosäuren', ARRAY['alle'],
 'Serotonin-Vorstufe; nur gezielt und interaktionsbewusst',
 'Griffonia-simplicifolia-Extrakt, standardisiert auf 5-HTP',
 ARRAY['Vitamin B6','Magnesium'], 3, false),

-- 44
('Citrullin', 'Aminosäuren', ARRAY['sportler'],
 'Stickoxidbildung, Durchblutung und Trainingsleistung',
 'L-Citrullin oder Citrullin-Malat 2:1',
 ARRAY['Arginin','Elektrolyte'], 4, false),

-- 45
('Arginin', 'Aminosäuren', ARRAY['sportler'],
 'Stickoxidbildung und Durchblutung',
 'L-Arginin oder Arginin-Alpha-Ketoglutarat',
 ARRAY['Citrullin','Vitamin C'], 3, false),

-- 46
('Kreatin', 'Aminosäuren', ARRAY['sportler'],
 'Kraftleistung, Muskelenergie und kognitive Energiereserve',
 'Kreatin-Monohydrat, idealerweise Creapure® oder gleichwertige Reinheit',
 ARRAY['Kohlenhydrate','Elektrolyte'], 5, false),

-- 47
('Kollagenpeptide', 'Protein', ARRAY['alle'],
 'Bindegewebe, Haut, Sehnen und Gelenkstruktur',
 'Hydrolysierte Kollagenpeptide; Typ I/III für Haut und Bindegewebe',
 ARRAY['Vitamin C','Glycin','Hyaluronsäure'], 3, false),

-- 48
('Ashwagandha', 'Adaptogen', ARRAY['alle'],
 'Stressregulation und subjektives Wohlbefinden',
 'KSM-66® für Wurzelextrakt; Sensoril® eher stärker beruhigend',
 ARRAY['Magnesium','L-Theanin'], 4, false),

-- 49
('Rhodiola rosea', 'Adaptogen', ARRAY['alle'],
 'Mentale Ermüdung und Stressresilienz',
 'Standardisiert, typischerweise ca. 3 % Rosavine und 1 % Salidrosid',
 ARRAY['Magnesium','B-Komplex','L-Theanin'], 3, false),

-- 50
('Astragalus', 'Adaptogen', ARRAY['alle'],
 'Traditionell Immun- und Belastungsunterstützung',
 'Standardisierter Wurzelextrakt mit ausgewiesenen Polysacchariden oder Astragalosiden',
 ARRAY['Vitamin C','Zink','Reishi'], 2, false),

-- 51
('Ginseng (Panax)', 'Adaptogen', ARRAY['alle'],
 'Müdigkeit, Leistungsgefühl und Stressanpassung',
 'Standardisiert auf Ginsenoside',
 ARRAY['Rhodiola rosea','CoQ10','B-Komplex'], 3, false),

-- 52
('Ginkgo biloba', 'Kognition', ARRAY['alle'],
 'Durchblutung und kognitive Funktion',
 'Standardextrakt EGb 761® oder vergleichbar 24/6',
 ARRAY['Bacopa monnieri','Citicolin (CDP-Cholin)'], 3, false),

-- 53
('Bacopa monnieri', 'Kognition', ARRAY['alle'],
 'Gedächtnis und Lernleistung bei längerfristiger Einnahme',
 'Standardisiert auf Bacoside, z. B. Bacognize® oder Synapsa®',
 ARRAY['Lion''s Mane (Hericium)','Citicolin (CDP-Cholin)'], 3, false),

-- 54
('Lion''s Mane (Hericium)', 'Pilze', ARRAY['alle'],
 'Kognition und Nervengesundheit; Evidenz noch begrenzt',
 'Fruchtkörperextrakt mit ausgewiesenem Beta-Glucan-Gehalt',
 ARRAY['Bacopa monnieri','Citicolin (CDP-Cholin)','Omega-3 (EPA/DHA)'], 2, false),

-- 55
('Cordyceps', 'Pilze', ARRAY['sportler'],
 'Ausdauer, Müdigkeit und Belastungstoleranz',
 'Cordyceps-militaris-Fruchtkörperextrakt oder standardisierter CS-4-Extrakt',
 ARRAY['CoQ10','Rhodiola rosea','Kreatin'], 3, false),

-- 56
('Reishi', 'Pilze', ARRAY['alle'],
 'Traditionell Stress-, Schlaf- und Immununterstützung',
 'Fruchtkörperextrakt, standardisiert auf Beta-Glucane und möglichst Triterpene',
 ARRAY['Astragalus','Vitamin D3'], 2, false),

-- 57
('Chaga', 'Pilze', ARRAY['alle'],
 'Antioxidativer Pflanzenstoff; klinische Evidenz begrenzt',
 'Heißwasser- oder Dualextrakt mit ausgewiesenem Beta-Glucan-Gehalt',
 ARRAY['Vitamin C','Reishi'], 2, false),

-- 58
('Schisandra', 'Adaptogen', ARRAY['alle'],
 'Stressanpassung und Leberstoffwechsel; Evidenz begrenzt',
 'Standardisierter Extrakt auf Schisandrine',
 ARRAY['Rhodiola rosea','B-Komplex'], 2, false),

-- 59
('Maca', 'Adaptogen', ARRAY['alle'],
 'Libido, subjektive Energie und Wohlbefinden',
 'Gelatinisiertes Maca-Pulver oder standardisierter Extrakt',
 ARRAY['Zink','Ginseng (Panax)'], 3, false),

-- 60
('Safran-Extrakt', 'Pflanzenstoffe', ARRAY['alle'],
 'Stimmung, emotionales Wohlbefinden und Appetitregulation',
 'Standardisiert, z. B. affron® oder Safr''Inside™',
 ARRAY['Magnesium','Omega-3 (EPA/DHA)'], 3, false),

-- 61
('Coenzym Q10', 'Energie', ARRAY['alle'],
 'Mitochondriale Energieproduktion und antioxidativer Schutz',
 'Ubiquinon mit ölbasierter Formulierung',
 ARRAY['Omega-3 (EPA/DHA)','PQQ','L-Carnitin'], 4, false),

-- 62
('Ubiquinol', 'Energie', ARRAY['alle'],
 'Mitochondriale Energie und antioxidativer Schutz',
 'Reduzierte CoQ10-Form, besonders bei höherem Alter oder Statineinnahme',
 ARRAY['Omega-3 (EPA/DHA)','PQQ','L-Carnitin'], 3, false),

-- 63
('PQQ', 'Energie', ARRAY['alle'],
 'Mitochondriale Signalwege; Human-Evidenz noch begrenzt',
 'Pyrrolochinolinchinon-Dinatriumsalz',
 ARRAY['Coenzym Q10','Alpha-Liponsäure'], 2, false),

-- 64
('Alpha-Liponsäure', 'Antioxidantien', ARRAY['alle'],
 'Redoxsysteme und Glukosestoffwechsel',
 'R-Alpha-Liponsäure oder stabilisiertes Na-R-ALA',
 ARRAY['Acetyl-L-Carnitin (ALCAR)','Berberin','B-Komplex'], 3, false),

-- 65
('NAC (N-Acetyl-Cystein)', 'Antioxidantien', ARRAY['alle'],
 'Glutathion-Vorstufe und antioxidatives System',
 'N-Acetyl-L-Cystein',
 ARRAY['Glycin','Selen','Vitamin C'], 4, false),

-- 66
('Glutathion', 'Antioxidantien', ARRAY['alle'],
 'Zelluläres Redox- und Entgiftungssystem',
 'Liposomal oder S-Acetyl-Glutathion; alternativ NAC + Glycin',
 ARRAY['NAC (N-Acetyl-Cystein)','Glycin','Selen'], 3, false),

-- 67
('NMN', 'Longevity', ARRAY['alle'],
 'NAD+-Vorstufe; Langzeitnutzen beim Menschen ungeklärt',
 'β-Nicotinamid-Mononukleotid mit geprüfter Reinheit und Stabilität',
 ARRAY['TMG','Magnesium'], 2, false),

-- 68
('NR (Nicotinamid-Ribosid)', 'Longevity', ARRAY['alle'],
 'NAD+-Vorstufe und zellulärer Energiestoffwechsel',
 'Nicotinamid-Ribosid-Chlorid, z. B. Niagen®',
 ARRAY['TMG','Magnesium','B-Komplex'], 3, false),

-- 69
('NAD+', 'Longevity', ARRAY['alle'],
 'Zellulärer Energiestoffwechsel; direkte Supplement-Evidenz begrenzt',
 'Liposomale oder sublinguale Form; orale Überlegenheit nicht gesichert',
 ARRAY['NR (Nicotinamid-Ribosid)','NMN','Magnesium'], 1, false),

-- 70
('Spermidin', 'Longevity', ARRAY['alle'],
 'Autophagie-bezogene Zellprozesse; Evidenz im Aufbau',
 'Standardisierter Weizenkeimextrakt oder synthetisches Spermidin',
 ARRAY['Omega-3 (EPA/DHA)','Polyphenole'], 2, false),

-- 71
('Fisetin', 'Longevity', ARRAY['alle'],
 'Seneszenz- und Entzündungssignalwege; Human-Evidenz sehr begrenzt',
 'Mikronisiert oder liposomal; Bioverfügbarkeit generell gering',
 ARRAY['Quercetin','Omega-3 (EPA/DHA)'], 1, false),

-- 72
('Quercetin', 'Antioxidantien', ARRAY['alle'],
 'Polyphenolischer Zellschutz und Histamin-/Entzündungswege',
 'Quercetin-Phytosom, z. B. Quercefit®, oder gut lösliche Form',
 ARRAY['Vitamin C','Bromelain'], 3, false),

-- 73
('Resveratrol', 'Antioxidantien', ARRAY['alle'],
 'Polyphenolischer Zellschutz; klinische Evidenz gemischt',
 'Trans-Resveratrol, mikronisiert oder liposomal',
 ARRAY['Quercetin','Omega-3 (EPA/DHA)'], 2, false),

-- 74
('Curcumin', 'Pflanzenstoffe', ARRAY['alle'],
 'Entzündungsbezogene Signalwege und Gelenkbeschwerden',
 'Mizellär, z. B. NovaSOL®; Phytosom, z. B. Meriva®; BCM-95®',
 ARRAY['Boswellia serrata','Omega-3 (EPA/DHA)'], 3, false),

-- 75
('EGCG (Grüntee-Extrakt)', 'Pflanzenstoffe', ARRAY['alle'],
 'Polyphenolischer Zellschutz und Stoffwechselwege',
 'Entkoffeinierter Grüntee-Extrakt, standardisiert auf EGCG',
 ARRAY['Vitamin C','Quercetin'], 3, false),

-- 76
('Berberin', 'Glucose', ARRAY['alle'],
 'Glukose- und Lipidstoffwechsel',
 'Berberin-HCl; Dihydroberberin als alternative höher verfügbare Form',
 ARRAY['Chrom','Inositol','Alpha-Liponsäure'], 4, false),

-- 77
('Inositol', 'Glucose', ARRAY['alle'],
 'Insulinsignalwege, Zyklusregulation und Nervensystem',
 'Myo-Inositol; bei PCOS häufig Myo:D-Chiro 40:1',
 ARRAY['Folat','Magnesium','Berberin'], 3, false),

-- Nr. 78 übersprungen (Duplikat Alpha-Liponsäure)

-- 79
('Zimt-Extrakt', 'Glucose', ARRAY['alle'],
 'Glukosestoffwechsel',
 'Ceylon-Zimt oder coumarinarmer standardisierter Extrakt',
 ARRAY['Berberin','Chrom','Inositol'], 3, false),

-- 80
('Gymnema sylvestre', 'Glucose', ARRAY['alle'],
 'Glukosestoffwechsel und Süßwahrnehmung',
 'Standardisiert auf Gymnemasäuren',
 ARRAY['Berberin','Chrom'], 3, false),

-- 81
('Probiotika', 'Darm', ARRAY['alle'],
 'Darmmikrobiom und je nach Stamm Verdauung oder Immunfunktion',
 'Stammspezifische, klinisch geprüfte Kulturen; CFU bis Ende Haltbarkeit',
 ARRAY['Präbiotika (Inulin)','Butyrat'], 4, false),

-- 82
('Präbiotika (Inulin)', 'Darm', ARRAY['alle'],
 'Nahrung für Darmbakterien und Stuhlregulation',
 'Inulin oder Oligofruktose; langsam auftitrieren',
 ARRAY['Probiotika','Butyrat'], 3, false),

-- 83
('Flohsamenschalen', 'Darm', ARRAY['alle'],
 'Stuhlregulation, Sättigung und Cholesterinmanagement',
 'Hochreine Psyllium-Schalen mit ausreichender Flüssigkeit',
 ARRAY['Probiotika','Magnesium'], 4, false),

-- 84
('Verdauungsenzyme', 'Darm', ARRAY['alle'],
 'Unterstützung der Verdauung bestimmter Makronährstoffe',
 'Zielgerichteter Enzymmix mit ausgewiesener Aktivität, nicht nur Milligramm',
 ARRAY['Probiotika'], 3, false),

-- 85
('Butyrat', 'Darm', ARRAY['alle'],
 'Energiequelle für Kolonozyten und Darmbarriere',
 'Mikroverkapseltes Natriumbutyrat oder Tributyrin',
 ARRAY['Präbiotika (Inulin)','Probiotika'], 3, false),

-- 86
('Hyaluronsäure', 'Gelenke', ARRAY['alle'],
 'Gelenkschmierung und Hautfeuchtigkeit',
 'Niedrig- bis mittelmolekulares Natriumhyaluronat',
 ARRAY['Kollagenpeptide','Vitamin C'], 3, false),

-- 87
('Glucosamin', 'Gelenke', ARRAY['alle'],
 'Gelenkstruktur und Gelenkkomfort',
 'Glucosaminsulfat, vorzugsweise kristallin',
 ARRAY['Chondroitin','MSM','Boswellia serrata'], 3, false),

-- 88
('Chondroitin', 'Gelenke', ARRAY['alle'],
 'Knorpelstruktur und Gelenkkomfort',
 'Chondroitinsulfat mit geprüfter Reinheit',
 ARRAY['Glucosamin','MSM'], 3, false),

-- 89
('MSM (Methylsulfonylmethan)', 'Gelenke', ARRAY['alle'],
 'Gelenkkomfort und Schwefelversorgung des Bindegewebes',
 'Methylsulfonylmethan mit hoher Reinheit, z. B. OptiMSM®',
 ARRAY['Glucosamin','Chondroitin','Vitamin C'], 3, false),

-- 90
('Boswellia serrata', 'Pflanzenstoffe', ARRAY['alle'],
 'Gelenkkomfort und entzündungsbezogene Signalwege',
 'Standardisiert auf Boswelliasäuren; AKBA-reicher Extrakt, z. B. AprèsFlex®',
 ARRAY['Curcumin','Omega-3 (EPA/DHA)'], 3, false),

-- 91
('Citicolin (CDP-Cholin)', 'Kognition', ARRAY['alle'],
 'Acetylcholin- und Phospholipidstoffwechsel, Fokus und Kognition',
 'Citicolin, z. B. Cognizin®',
 ARRAY['Omega-3 (EPA/DHA)','Bacopa monnieri','Lion''s Mane (Hericium)'], 4, false),

-- 92
('Alpha-GPC', 'Kognition', ARRAY['alle'],
 'Cholinversorgung, Fokus und neuromuskuläre Signalgebung',
 'L-Alpha-Glycerylphosphorylcholin',
 ARRAY['Bacopa monnieri','Omega-3 (EPA/DHA)'], 3, false),

-- 93
('Phosphatidylserin', 'Kognition', ARRAY['alle'],
 'Zellmembranen, Stressantwort und Kognition',
 'Soja- oder sonnenblumenbasiertes Phosphatidylserin',
 ARRAY['Omega-3 (EPA/DHA)','Citicolin (CDP-Cholin)'], 3, false),

-- 94
('Acetyl-L-Tyrosin', 'Aminosäuren', ARRAY['alle'],
 'Catecholamin-Vorstufe bei Belastung',
 'N-Acetyl-L-Tyrosin; höhere Löslichkeit, aber nicht zwingend bessere Wirkung als L-Tyrosin',
 ARRAY['Vitamin B6','Magnesium'], 3, false),

-- 95
('Huperzin A', 'Kognition', ARRAY['alle'],
 'Acetylcholinesterase-Hemmung und kurzfristiger kognitiver Fokus',
 'Standardisierter Huperzia-serrata-Extrakt; sehr niedrig dosiert und zyklisch',
 ARRAY['Citicolin (CDP-Cholin)'], 3, false),

-- 96
('Astaxanthin', 'Antioxidantien', ARRAY['alle'],
 'Lipid- und Hautschutz sowie antioxidative Kapazität',
 'Natürliches Astaxanthin aus Haematococcus pluvialis in Öl',
 ARRAY['Omega-3 (EPA/DHA)','Vitamin E'], 3, false),

-- 97
('Lycopin', 'Antioxidantien', ARRAY['alle'],
 'Antioxidativer Schutz, besonders Prostata- und Gefäßkontext',
 'Ölbasierter Tomatenextrakt oder Lycopin-Komplex',
 ARRAY['Vitamin E','Coenzym Q10'], 3, false),

-- 98
('Lutein', 'Antioxidantien', ARRAY['alle'],
 'Makula, Netzhaut und visuelle Belastung',
 'Freies Lutein oder Luteinester, z. B. FloraGLO®',
 ARRAY['Zeaxanthin','Omega-3 (EPA/DHA)','Vitamin A (Retinol)'], 3, false),

-- 99
('Zeaxanthin', 'Antioxidantien', ARRAY['alle'],
 'Makula- und Netzhautschutz',
 'Natürliches Zeaxanthin, z. B. Optisharp®',
 ARRAY['Lutein','Omega-3 (EPA/DHA)'], 3, false),

-- 100
('OPC (Traubenkernextrakt)', 'Antioxidantien', ARRAY['alle'],
 'Gefäß-, Bindegewebs- und antioxidativer Schutz',
 'Standardisiert auf oligomere Proanthocyanidine',
 ARRAY['Vitamin C','Quercetin'], 3, false),

-- 101 — B-Komplex (referenziert in matching.ts)
('B-Komplex', 'Vitamin', ARRAY['alle'],
 'Vollständige B-Vitamin-Versorgung: Energie, Nerven, Homocystein und Stimmung',
 'Aktive Formen: Methylcobalamin, Methylfolat, P-5-P, Riboflavin-5''-phosphat',
 ARRAY['Magnesium','Vitamin C'], 4, true),

-- 102 — Multivitamin (referenziert in matching.ts)
('Multivitamin', 'Kombipräparat', ARRAY['alle'],
 'Basisversorgung aller essenziellen Mikronährstoffe',
 'Qualitätspräparat mit aktiven Formen und geprüfter Rohstoffqualität',
 ARRAY['Omega-3 (EPA/DHA)','Magnesium'], 3, true);
