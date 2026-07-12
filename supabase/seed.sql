-- Supplemently — Seed: Beispiel-Daten zum Testen
-- Idempotent genug fuer lokale Runs: vorher leeren.
truncate table public.studio_supplements restart identity cascade;
truncate table public.sessions           restart identity cascade;
truncate table public.studios            restart identity cascade;
truncate table public.supplements        restart identity cascade;

insert into public.supplements
  (name, kategorie, zielgruppe, wirkung, dosierung_empfehlung, kontraindikationen,
   evidenzlevel, ist_kombipraeparat, inhaltsstoffe)
values
  ('Omega-3 (EPA/DHA)', 'Fettsäure', array['alle'],
   'Unterstützt Herz-Kreislauf-System und normale Gehirnfunktion, entzündungsmodulierend.',
   '1000–2000 mg EPA+DHA täglich zu einer Mahlzeit.',
   'Blutverdünnende Medikamente — vorher ärztlich abklären.',
   5, false, '[]'::jsonb),

  ('Magnesiumcitrat', 'Mineralstoff', array['alle'],
   'Trägt zu normaler Muskel- und Nervenfunktion bei, reduziert Müdigkeit.',
   '300–400 mg elementares Magnesium täglich, abends.',
   'Stark eingeschränkte Nierenfunktion.',
   4, false, '[]'::jsonb),

  ('Vitamin D3', 'Vitamin', array['alle'],
   'Reguliert Kalziumhaushalt, unterstützt Knochen und Immunsystem.',
   '1000–2000 IE täglich, besonders Okt–März.',
   'Hyperkalzämie, Sarkoidose.',
   5, false, '[]'::jsonb),

  ('Zink', 'Mineralstoff', array['alle'],
   'Wichtig für Immunfunktion, Testosteronstoffwechsel und Hautbild.',
   '10–15 mg täglich zu einer Mahlzeit.',
   'Langfristige Hochdosis stört Kupferaufnahme.',
   4, false, '[]'::jsonb),

  ('Kreatin-Monohydrat', 'Aminosäure-Derivat', array['alle'],
   'Steigert Kraft und Leistung bei kurzen intensiven Belastungen.',
   '3–5 g täglich, Zeitpunkt egal.',
   'Keine bekannten bei Gesunden; bei Nierenerkrankung Rücksprache.',
   5, false, '[]'::jsonb),

  ('Vitamin B12 (Methylcobalamin)', 'Vitamin', array['alle'],
   'Nötig für Blutbildung und Nervensystem, relevant bei veganer Ernährung.',
   '250–500 µg täglich.',
   'Keine relevanten bei üblicher Dosierung.',
   4, false, '[]'::jsonb),

  ('Eisenbisglycinat', 'Mineralstoff', array['weiblich'],
   'Deckt erhöhten Eisenbedarf, unterstützt Sauerstofftransport, reduziert Müdigkeit.',
   '14–25 mg täglich, nüchtern mit Vitamin C.',
   'Hämochromatose, Eisenüberladung — nur bei nachgewiesenem Mangel.',
   4, false, '[]'::jsonb),

  ('Ashwagandha (KSM-66)', 'Pflanzenextrakt', array['alle'],
   'Adaptogen; kann Stressempfinden und Cortisolspiegel senken.',
   '300–600 mg Extrakt täglich.',
   'Schilddrüsenüberfunktion, Schwangerschaft, Autoimmunerkrankungen.',
   3, false, '[]'::jsonb),

  ('Multivitamin Sport', 'Kombipräparat', array['alle'],
   'Basisabdeckung an Mikronährstoffen für aktive Menschen.',
   '1 Portion täglich zu einer Mahlzeit.',
   'Vorsicht bei gleichzeitiger Einnahme weiterer Einzelpräparate (Überdosierung).',
   3, true,
   '[
     {"name":"Vitamin D3","menge_mg":0.025},
     {"name":"Magnesium","menge_mg":150},
     {"name":"Zink","menge_mg":10},
     {"name":"Vitamin C","menge_mg":200},
     {"name":"Vitamin B12","menge_mg":0.0005}
   ]'::jsonb),

  ('L-Citrullin Malat', 'Aminosäure', array['alle'],
   'Fördert Durchblutung/Pump und kann Ausdauerleistung verbessern.',
   '6–8 g etwa 45 min vor dem Training.',
   'Keine relevanten bei Gesunden bekannt.',
   3, false, '[]'::jsonb);

-- ============================================================
-- Demo-Studios
-- ============================================================
insert into public.studios (name, slug, voucher_text, kontakt_email, abo_status)
values
  ('PowerGym Berlin', 'powergym-berlin', '4 Wochen gratis trainieren', 'info@powergym-berlin.de', 'active'),
  ('FitZone München',  'fitzone-muenchen', '2 Probetrainings geschenkt',  'kontakt@fitzone-muc.de',  'trial');

-- ============================================================
-- Zuordnung: welche Supplements nutzt welches Studio
-- (Gesamtliste bleibt global, hier nur Verknuepfung)
-- ============================================================
-- PowerGym Berlin: Kraft-/Performance-Fokus
insert into public.studio_supplements (studio_id, supplement_id)
select s.id, sup.id
from public.studios s
join public.supplements sup
  on sup.name in ('Kreatin-Monohydrat','Omega-3 (EPA/DHA)','Magnesiumcitrat','L-Citrullin Malat','Vitamin D3')
where s.slug = 'powergym-berlin';

-- FitZone München: Basis-/Gesundheitsfokus
insert into public.studio_supplements (studio_id, supplement_id)
select s.id, sup.id
from public.studios s
join public.supplements sup
  on sup.name in ('Multivitamin Sport','Vitamin D3','Vitamin B12 (Methylcobalamin)','Eisenbisglycinat','Ashwagandha (KSM-66)')
where s.slug = 'fitzone-muenchen';
