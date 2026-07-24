-- Erstbefüllung der Affiliate-Links mit echten Partnerprodukten, passend zur
-- 8-Wochen-Challenge. Geschlechtsunabhängige Auswahl (Vivobarefoot-Modelle
-- jeweils in Herren- und Damen-Variante), gestreut über Schlaf, Bewegung,
-- Mobility, Regeneration und Training. Bewusst mehr Produkte als Wochen für
-- Abwechslung. Aktiv geschaltet, auch wenn die Ausspiel-Logik im Check-in
-- noch nicht gebaut ist (siehe GAMEPLAN Kap. 11.7).

INSERT INTO public.affiliate_links (partner_name, produkt_name, kategorie, beschreibung, url, trigger_tags, woche, ist_aktiv) VALUES
  ('Centa-Star', 'Regeneration Kopfkissen', 'schlaf',
   'Nackenstützkissen mit CELLIANT®-Technologie — wandelt Körperwärme in Infrarot um, soll Regeneration im Schlaf unterstützen. Made in Germany.',
   'https://www.centa-star.com/shop/kopfkissen/regeneration/2888.00',
   ARRAY['schlecht_geschlafen','schlafqualitaet','regeneration'], 4, true),

  ('Centa-Star', 'Regeneration Ganzjahresdecke', 'schlaf',
   'Bettdecke mit CELLIANT®-Mineralfaser-Technologie, passend zum Regeneration-Kissen. Ganzjahrestauglich, Made in Germany.',
   'https://www.centa-star.com/shop/bettdecken/regeneration/0900.00',
   ARRAY['schlecht_geschlafen','schlafqualitaet','regeneration'], 4, true),

  ('Vivobarefoot', 'Primus Lite IV (Herren)', 'equipment',
   'Leichter Einstiegs-Barfußschuh für den Alltag — dünne, flexible Sohle für mehr Fußmuskel-Aktivierung beim Gehen.',
   'https://www.vivobarefoot.com/de/primus-lite-iv-mens',
   ARRAY['bewegung','schritte','mobility'], 3, true),

  ('Vivobarefoot', 'Primus Lite IV (Damen)', 'equipment',
   'Leichter Einstiegs-Barfußschuh für den Alltag — dünne, flexible Sohle für mehr Fußmuskel-Aktivierung beim Gehen.',
   'https://www.vivobarefoot.com/de/primus-lite-iv-womens',
   ARRAY['bewegung','schritte','mobility'], 3, true),

  ('Vivobarefoot', 'Gobi III Sneaker Leather (Herren)', 'equipment',
   'Barfuß-Sneaker aus Leder für den Alltag — vielseitig zwischen Büro und Freizeit, breiter Zehenraum.',
   'https://www.vivobarefoot.com/de/gobi-iii-sneaker-leather-mens',
   ARRAY['bewegung','alltag'], NULL, true),

  ('Vivobarefoot', 'Gobi III Sneaker Leather (Damen)', 'equipment',
   'Barfuß-Sneaker aus Leder für den Alltag — vielseitig zwischen Büro und Freizeit, breiter Zehenraum.',
   'https://www.vivobarefoot.com/de/gobi-iii-sneaker-leather-womens',
   ARRAY['bewegung','alltag'], NULL, true),

  ('BlackROLL', 'BLACKROLL Standard', 'regeneration',
   'Die klassische Faszienrolle — für Selbstmassage nach dem Training oder gegen Verspannungen aus dem Alltag.',
   'https://blackroll.com/de/products/blackroll-standard',
   ARRAY['mobility','verspannung','muskelkater'], 3, true),

  ('BlackROLL', 'DUOBALL', 'regeneration',
   'Doppelball für punktuelle Selbstmassage — v.a. Nacken, Schultern, Rücken. Ideal bei Verspannungen durch Stress oder Sitzen.',
   'https://blackroll.com/de/products/duo-ball',
   ARRAY['verspannung','nacken','stress'], NULL, true),

  ('BlackROLL', 'BLACKROLL MAT', 'equipment',
   'Faszien- und Trainingsmatte für Mobility-Routine, Atemübungen oder Stretching zuhause.',
   'https://blackroll.com/de/products/blackroll-mat',
   ARRAY['stress','atemuebung','mobility'], 5, true),

  ('BlackROLL', 'LOOP BAND', 'equipment',
   'Widerstandsband in 6 Stärken — kompaktes Zusatzgerät fürs Krafttraining zuhause oder unterwegs.',
   'https://blackroll.com/de/products/blackroll-loop-band',
   ARRAY['training','krafttraining'], 6, true),

  ('feels.like', 'Night Complex', 'schlaf',
   'Neuro-Komplex mit beruhigenden Wirkstoffen zur Einnahme vor dem Schlafen — unterstützt Einschlafen und Regeneration über Nacht.',
   'https://feelslike.sport/collections/neurocomplexe/products/night-complex',
   ARRAY['schlecht_geschlafen','stress'], 4, true),

  ('feels.like', 'Repair Complex', 'sportnahrung',
   'Neuro-Komplex zur Regeneration nach intensiven Trainingseinheiten.',
   'https://feelslike.sport/collections/neurocomplexe/products/repair-complex',
   ARRAY['muskelkater','regeneration'], NULL, true);
