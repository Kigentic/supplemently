-- Neue Dimension "Ort" (Studio/Zuhause) + neuer Fokus-Wert "fatburn" +
-- 8 neue kuratierte Trainingspläne (HF1-HF3, HM1-HM3, M6, M7).

-- ── Schema: Ort-Dimension + Fatburn-Fokus ────────────────────────────────────

ALTER TABLE public.challenge_teilnahmen
  ADD COLUMN IF NOT EXISTS trainingsplan_ort TEXT CHECK (trainingsplan_ort IN ('studio', 'zuhause'));

ALTER TABLE public.challenge_teilnahmen
  DROP CONSTRAINT IF EXISTS challenge_teilnahmen_trainingsplan_fokus_check;
ALTER TABLE public.challenge_teilnahmen
  ADD CONSTRAINT challenge_teilnahmen_trainingsplan_fokus_check
    CHECK (trainingsplan_fokus IN ('kein', 'ruecken', 'beine_po', 'bauch_core', 'fatburn'));

ALTER TABLE public.trainingsplan_zuordnung
  ADD COLUMN IF NOT EXISTS ort TEXT NOT NULL DEFAULT 'studio' CHECK (ort IN ('studio', 'zuhause'));

ALTER TABLE public.trainingsplan_zuordnung
  DROP CONSTRAINT IF EXISTS trainingsplan_zuordnung_geschlecht_level_fokus_key;
ALTER TABLE public.trainingsplan_zuordnung
  ADD CONSTRAINT trainingsplan_zuordnung_geschlecht_level_fokus_ort_key
    UNIQUE (geschlecht, level, fokus, ort);

ALTER TABLE public.trainingsplan_zuordnung
  DROP CONSTRAINT IF EXISTS trainingsplan_zuordnung_fokus_check;
ALTER TABLE public.trainingsplan_zuordnung
  ADD CONSTRAINT trainingsplan_zuordnung_fokus_check
    CHECK (fokus IN ('kein', 'ruecken', 'beine_po', 'bauch_core', 'fatburn'));

-- ── Neue Übungsbibliothek-Einträge (Homeworkout-Signature-Moves mit eigener
--    Ausführungsanleitung aus den Quell-Plänen — Studio-Varianten-Texte
--    ("mit Langhantel/Maschine...") passen nicht für Zuhause-Kontext, daher
--    eigene Einträge statt Wiederverwendung bestehender Studio-Zeilen) ──────

INSERT INTO public.uebungsbibliothek (muskelgruppe, name, varianten, sort_order) VALUES
  ('Beine & Gesäß', 'Bulgarian Split Squats', 'Hinterer Fuß auf dem Stuhl, vorderer Fuß einen großen Schritt nach vorne. Gerader Oberkörper, Knie sinkt kontrolliert nach unten – Fokus auf den vorderen Oberschenkel und das Gesäß.', 90),
  ('Beine & Gesäß', 'Glute Bridge / Beckenheben', 'Rückenlage, Füße hüftbreit, Becken zügig nach oben drücken und wieder absenken – nicht ganz ablegen, Spannung halten. Oben kurz in den Po spannen.', 91),
  ('Beine & Gesäß', 'Donkey Kicks (Vierfüßlerstand)', 'Vierfüßlerstand, Rücken gerade. Ein Bein im 90°-Winkel nach oben drücken – Fußsohle zeigt zur Decke. Bewusst in den Po spannen oben, kontrolliert absenken. Hüfte bleibt parallel zum Boden – kein Drehen.', 92),
  ('Beine & Gesäß', 'Side Lying Abduktion', 'Seitlage auf dem Boden, Körper gerade. Oberes Bein gestreckt langsam anheben und wieder absenken – kein Schwung, volle Kontrolle. Füße leicht nach vorne zeigen für bessere Gluteusaktivierung.', 93),
  ('Beine & Gesäß', 'Innenschenkel-Squeeze (Wasserflasche)', 'Rückenlage, Knie angewinkelt, eine Wasserflasche zwischen die Knie klemmen. Knie aktiv zusammendrücken, kurz halten, langsam lösen – nicht komplett loslassen.', 94),
  ('Beine & Gesäß', 'Sliding Lunges (seitlich)', 'Handtuch unter einen Fuß legen (auf glattem Boden). Standbein leicht gebeugt, den Fuß mit Handtuch langsam zur Seite gleiten lassen – Knie des Standbeins beugt sich dabei. Kontrolliert zurückziehen. Wechsel nach allen Wiederholungen einer Seite.', 95),
  ('Beine & Gesäß', 'Step-ups', 'Zügig aber kontrolliert auf den Stuhl steigen – das Standbein macht die Arbeit, nicht der Schwung. Pro Seite durchzählen.', 96),
  ('Rücken', 'Handtuch-Rudern (am Türrahmen)', 'Tür öffnen, Handtuch um den Türrahmen schlingen, beide Enden fest greifen. Füße nah an die Tür, Oberkörper nach hinten lehnen und sich zur Tür ziehen – Schulterblätter aktiv zusammenziehen, oben kurz halten, kontrolliert zurück.', 97),
  ('Rücken', 'Bird Dog', 'Vierfüßlerstand, Rücken gerade wie ein Tablett – kein Hohlkreuz, kein Rundrücken. Gleichzeitig rechten Arm und linkes Bein strecken, 2 Sekunden halten, dann wechseln. Hüfte bleibt parallel zum Boden.', 98),
  ('Rücken', 'Reverse Snow Angels', 'Bäuchlinge auf dem Boden, Arme seitlich am Körper. Arme langsam über den Boden nach oben (wie ein Schneeengel) führen und wieder zurück – der Oberkörper hebt sich dabei leicht an. Schulterblätter werden aktiv zusammengezogen.', 99),
  ('Rumpf & Bauch', 'Dead Bug', 'Rückenlage, Arme senkrecht zur Decke, Beine im 90°-Winkel angewinkelt. Gleichzeitig rechten Arm und linkes Bein langsam zur Matte absenken ohne den unteren Rücken von der Matte zu heben – zurück und wechseln.', 100),
  ('Schultern', 'Vorgebeugtes Seitheben hinten (Wasserflasche)', 'Oberkörper ca. 45° nach vorne beugen, Arme locker hängen. Wasserflaschen seitlich nach oben führen – Fokus auf hintere Schulter und oberen Rücken. Langsam und kontrolliert.', 101),
  ('Rumpf & Bauch', 'Sliding Mountain Climbers', 'Handtuch unter beide Füße legen (auf glattem Boden – Fliesen oder Parkett). In der Liegestützposition abwechselnd die Knie zur Brust gleiten lassen – gleichmäßig und kontrolliert, kein Hochschieben des Pos.', 102),
  ('Rücken', 'Superman (liegend)', 'Bäuchlinge auf dem Boden, Arme nach vorne gestreckt. Arme und Beine gleichzeitig anheben, oben kurz halten, dann kontrolliert absenken.', 103),
  ('Brust', 'Decline Liegestütze (Füße auf Stuhl)', 'Füße auf dem Stuhl, Hände schulterbreit auf dem Boden. Körper bildet eine gerade Linie – Fokus liegt durch den Winkel auf dem oberen Brustbereich und vorderen Schultern.', 104);

-- ── HF1 · Frauen | Homeworkout Allgemein ─────────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'HF1', 'weiblich', 'Frauen | Homeworkout Allgemein',
    'Frauen jedes Fitnessniveaus, die zuhause trainieren wollen – kein Studio, keine Geräte',
    'Ganzkörper – Bauch, Beine & Po mit vollständiger Oberkörperabdeckung',
    '3× pro Woche (z. B. Mo / Mi / Fr)', 60, '60–75 Sekunden', NULL,
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Bewegungsmuster lernen, Körpergefühl entwickeln, Basis aufbauen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Wiederholungen steigern, Pausen leicht kürzen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale Ausbelastung, Körper spürbar straffer"}]'::jsonb,
    ARRAY[
      'Innenschenkel-Squeeze als Adduktoren-Ersatz: Kein Gerät nötig – eine Wasserflasche zwischen den Knien ist überraschend effektiv für die Oberschenkelinnenseite.',
      'Glute Bridge & Donkey Kicks: Drei bzw. zwei Sätze – das sind die Po-Grundübungen dieses Plans. Oben in der Bewegung immer kurz in den Po spannen und halten.',
      'Side Lying Abduktion: Der Haushalts-Ersatz für die Abduktoren-Maschine – langsam und bewusst ist hier wichtiger als viele Wiederholungen.',
      'Erhöhte Liegestütze: Hände auf dem Stuhl reduziert das Körpergewicht – ideal für Einsteiger. Wer stärker wird, wechselt in Phase 3 zur klassischen Liegestütze auf dem Boden.',
      'Plank-Steigerung: Wo. 1–3: 30 Sek. · Wo. 4–6: 35 Sek. · Wo. 7–8: 40 Sek.',
      'Phase 3 (Wo. 7–8): Glute Bridge einbeinig für mehr Intensität – Kniebeugen mit Wasserflaschen als Zusatzgewicht.'
    ], 14
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Kniebeugen (Körpergewicht)', NULL::text, 2, '20', 60),
  (2, 'Ausfallschritte auf der Stelle', NULL, 2, '12 je Seite', 60),
  (3, 'Bulgarian Split Squats', 'Bulgarian Split Squats', 2, '10 je Seite', 75),
  (4, 'Glute Bridge / Beckenheben', 'Glute Bridge / Beckenheben', 3, '20', 45),
  (5, 'Donkey Kicks (Vierfüßlerstand)', 'Donkey Kicks (Vierfüßlerstand)', 2, '15 je Seite', 45),
  (6, 'Side Lying Abduktion (Seitlage)', 'Side Lying Abduktion', 2, '20 je Seite', 45),
  (7, 'Innenschenkel-Squeeze (Wasserflasche zwischen Knien)', 'Innenschenkel-Squeeze (Wasserflasche)', 2, '20', 45),
  (8, 'Wadenheben beidbeinig', NULL, 3, '20', 45),
  (9, 'Erhöhte Liegestütze (Hände auf Stuhl)', NULL, 2, '10–15', 75),
  (10, 'Handtuch-Rudern (am Türrahmen)', 'Handtuch-Rudern (am Türrahmen)', 2, '12', 75),
  (11, 'Schulterdrücken (Wasserflasche)', NULL, 2, '15', 60),
  (12, 'Seitheben (Wasserflasche)', NULL, 3, '15', 60),
  (13, 'Bizepscurls (Wasserflasche)', NULL, 2, '15', 60),
  (14, 'Crunches', NULL, 2, '20', 60),
  (15, 'Plank', NULL, 3, '30–40 Sek.', 60)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── HF2 · Frauen | Homeworkout Rücken Fokus ──────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'HF2', 'weiblich', 'Frauen | Homeworkout Rücken Fokus',
    'Frauen mit Rückenbeschwerden, Nackenverspannungen oder Fehlhaltung durch langes Sitzen – Training zuhause ohne Geräte',
    'Rücken, Haltungskorrektur, Nackenstabilisierung & Ganzkörper',
    '3× pro Woche (z. B. Mo / Mi / Fr)', 60, '60–90 Sekunden',
    'Dieser Plan ist präventiv und kräftigend ausgerichtet – kein Ersatz für ärztliche Behandlung bei akuten Beschwerden. Bei starken oder ausstrahlenden Schmerzen bitte zuerst einen Arzt aufsuchen.',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Schmerzfreie Bewegungsmuster etablieren, tiefe Rücken- und Nackenmuskulatur aktivieren"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Haltungsmuskulatur gezielt kräftigen, Schulterposition korrigieren"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Belastbarkeit festigen, aufrechte Haltung im Alltag spürbar verbessert"}]'::jsonb,
    ARRAY[
      'Vier Übungen mit drei Sätzen: Handtuch-Rudern, Superman, Bird Dog und vorgebeugtes Seitheben – das sind die vier Schlüsselübungen für Rücken und Haltung in diesem Plan.',
      'Vorgebeugtes Seitheben hinten: Der Haushalts-Ersatz für den Reverse Butterfly an der Pec-Deck-Maschine – trifft die hintere Schulter und den oberen Rücken, die bei Frauen mit Bürojob fast immer vernachlässigt sind.',
      'Bird Dog: Klingt harmlos, ist aber eine der effektivsten Übungen für die tiefe Rückenmuskulatur – Qualität vor Quantität, lieber langsamer und stabiler.',
      'Dead Bug: Unterer Rücken bleibt die ganze Zeit flach – sobald er sich hebt, ist das Bein zu weit unten. Amplitude reduzieren, nicht die Technik opfern.',
      'Seitlicher Plank: Hüfte bleibt oben – kein Durchhängen. Wer es noch nicht schafft, macht die Knienvariante (unteres Knie auf dem Boden).',
      'Tägliche Ergänzung empfohlen: 5 Min. Mobilisation nach dem Aufstehen – Katze-Kuh, Brustöffner an der Wand, Nackendehnung zur Seite. Macht langfristig den größten Unterschied.',
      'Plank-Steigerung: Wo. 1–3: 30 Sek. · Wo. 4–6: 35 Sek. · Wo. 7–8: 40 Sek.',
      'Phase 3 (Wo. 7–8): Handtuch-Rudern mit 2–3 Sek. Haltezeit oben – Glute Bridge einbeinig für mehr Intensität im Po-Bereich.'
    ], 15
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Handtuch-Rudern (am Türrahmen)', 'Handtuch-Rudern (am Türrahmen)', 3, '12–15', 90),
  (2, 'Superman (liegend)', 'Superman (liegend)', 3, '15', 60),
  (3, 'Bird Dog (Vierfüßlerstand)', 'Bird Dog', 3, '10 je Seite', 60),
  (4, 'Reverse Snow Angels (Bäuchlings)', 'Reverse Snow Angels', 2, '12', 60),
  (5, 'Vorgebeugtes Seitheben hinten (Wasserflasche)', 'Vorgebeugtes Seitheben hinten (Wasserflasche)', 3, '15', 60),
  (6, 'Vorgebeugtes Rudern (Wasserflasche)', NULL, 2, '15', 75),
  (7, 'Dead Bug (Rückenlage)', 'Dead Bug', 2, '10 je Seite', 60),
  (8, 'Glute Bridge / Beckenheben', 'Glute Bridge / Beckenheben', 2, '20', 60),
  (9, 'Donkey Kicks (Vierfüßlerstand)', 'Donkey Kicks (Vierfüßlerstand)', 2, '15 je Seite', 45),
  (10, 'Kniebeugen (Körpergewicht)', NULL, 2, '15', 75),
  (11, 'Ausfallschritte auf der Stelle', NULL, 2, '10 je Seite', 75),
  (12, 'Erhöhte Liegestütze (Hände auf Stuhl)', NULL, 2, '10–12', 75),
  (13, 'Seitheben (Wasserflasche)', NULL, 3, '15', 60),
  (14, 'Plank (Unterarmstütz)', NULL, 3, '30–40 Sek.', 60),
  (15, 'Seitlicher Plank', NULL, 2, '20–30 Sek. je Seite', 60)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── HF3 · Frauen | Homeworkout Fat Burn ──────────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'HF3', 'weiblich', 'Frauen | Homeworkout Fat Burn',
    'Frauen, die zuhause gezielt Fett verbrennen, den Stoffwechsel ankurbeln und gleichzeitig Bauch, Beine & Po straffen wollen',
    'Maximaler Kalorienverbrauch mit BBP-Schwerpunkt & Ganzkörper',
    '3–4× pro Woche (z. B. Mo / Di / Do / Sa)', 60, '30–45 Sekunden', NULL,
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Körper an hohe Belastung gewöhnen, Ausdauer aufbauen, Technik sichern"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Pausen auf 30 Sek. reduzieren, Wiederholungen steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale Intensität – jeder Satz bis zur sauberen Grenze"}]'::jsonb,
    ARRAY[
      '🔥 Prinzip: Kurze Pausen + große Muskelgruppen + hohe Wiederholungen = Puls dauerhaft oben, Kalorien weg, Problemzonen unter Dauerdruck. Kein Gerät nötig – der eigene Körper reicht vollkommen aus.',
      'Pausen konsequent einhalten: 30–45 Sek. ist kurz – ein Timer ist Pflicht. Wer länger pausiert, verliert den Fat-Burn-Effekt komplett.',
      'BBP-Block (Nr. 1–9): Neun Übungen für Beine, Po und Innenschenkel – das ist der Verbrennungsmotor dieses Plans. Große Muskelgruppen = großer Kalorienverbrauch.',
      'Sliding Lunges: Funktionieren nur auf glattem Boden (Parkett, Fliesen) – auf Teppich einfach normale Ausfallschritte zur Seite machen.',
      'Glute Bridge mit 25 Wdh.: Klingt nach viel – aber schnell ausgeführt mit 30 Sek. Pause danach bringt die Oberschenkel und den Po ans Limit.',
      'Donkey Kicks zügig: Hier darf das Tempo höher sein als im normalen BBP-Plan – Fokus liegt auf Kalorienverbrauch, nicht auf maximaler Isolation.',
      '4× pro Woche ab Phase 2: Wer Feuer gefangen hat, kann ab Woche 4 eine vierte Einheit einbauen – mindestens einen Ruhetag zwischen zwei Einheiten.',
      'Ernährung: Ein moderates Kaloriendefizit von 300–500 kcal täglich ist der schnellste Weg zum Ziel – dieser Plan liefert den Verbrauch, die Küche liefert den Rest.',
      'Plank-Steigerung: Wo. 1–3: 30 Sek. · Wo. 4–6: 35 Sek. · Wo. 7–8: 40 Sek.',
      'Phase 3 (Wo. 7–8): Kniebeugen auf 30 Wdh. steigern, Glute Bridge einbeinig für mehr Intensität, Pausen konsequent auf 30 Sek. halten.'
    ], 16
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Kniebeugen (Körpergewicht)', NULL::text, 2, '25', 45),
  (2, 'Ausfallschritte gehend', NULL, 2, '15 je Seite', 45),
  (3, 'Sliding Lunges (seitlich)', 'Sliding Lunges (seitlich)', 2, '12 je Seite', 45),
  (4, 'Step-ups (zügig)', 'Step-ups', 2, '15 je Seite', 45),
  (5, 'Glute Bridge (schnell)', 'Glute Bridge / Beckenheben', 3, '25', 30),
  (6, 'Donkey Kicks (zügig)', 'Donkey Kicks (Vierfüßlerstand)', 2, '20 je Seite', 30),
  (7, 'Side Lying Abduktion (zügig)', 'Side Lying Abduktion', 2, '20 je Seite', 30),
  (8, 'Innenschenkel-Squeeze (Wasserflasche)', 'Innenschenkel-Squeeze (Wasserflasche)', 2, '25', 30),
  (9, 'Wadenheben beidbeinig (schnell)', NULL, 3, '25', 30),
  (10, 'Erhöhte Liegestütze (Hände auf Stuhl)', NULL, 2, '12–15', 45),
  (11, 'Handtuch-Rudern (am Türrahmen)', 'Handtuch-Rudern (am Türrahmen)', 2, '15', 45),
  (12, 'Schulterdrücken (Wasserflasche)', NULL, 2, '20', 30),
  (13, 'Seitheben (Wasserflasche)', NULL, 3, '20', 30),
  (14, 'Sliding Mountain Climbers', 'Sliding Mountain Climbers', 2, '20 je Seite', 30),
  (15, 'Crunches', NULL, 2, '25', 30),
  (16, 'Beinheben (Rückenlage)', NULL, 2, '15', 30),
  (17, 'Plank', NULL, 3, '40 Sek.', 30)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── HM1 · Männer | Homeworkout Allgemein ─────────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'HM1', 'maennlich', 'Männer | Homeworkout Allgemein',
    'Männer jedes Fitnessniveaus, die zuhause trainieren wollen – kein Studio, keine Geräte',
    'Ganzkörper – Kraft, Ausdauer & Körperspannung',
    '3× pro Woche (z. B. Mo / Mi / Fr)', 60, '60–90 Sekunden', NULL,
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Bewegungsmuster lernen, Körperspannung aufbauen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Wiederholungen steigern, Pausen kürzen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale Ausbelastung mit Körpergewicht"}]'::jsonb,
    ARRAY[
      'Wasserflasche = Kurzhantel: Eine volle 1,5L-Flasche wiegt ca. 1,5 kg – leicht, aber bei 15 Wdh. Seitheben durchaus spürbar. Wer mehr will: 2× 5L-Kanister nehmen.',
      'Liegestütze: Max. Wiederholungen bedeutet so viele wie mit sauberer Technik möglich – kein halbes Durchdrücken zählt.',
      'Dips am Stuhl: Hände auf der Sitzfläche, Füße nach vorne gestreckt, Körper senkt sich kontrolliert ab. Ellbogen zeigen nach hinten, nicht zur Seite.',
      'Steigerung in Phase 3: Liegestütze mit Füßen auf dem Stuhl (Decline) für mehr Brustoberteil – Bulgarian Split Squats mit Wasserflaschen als Zusatzgewicht.',
      'Plank-Steigerung: Wo. 1–3: 30 Sek. · Wo. 4–6: 40 Sek. · Wo. 7–8: 45 Sek.'
    ], 17
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Kniebeugen (Körpergewicht)', NULL::text, 2, '20', 75),
  (2, 'Bulgarian Split Squats', 'Bulgarian Split Squats', 2, '10 je Seite', 90),
  (3, 'Ausfallschritte gehend', NULL, 2, '12 je Seite', 75),
  (4, 'Step-ups', 'Step-ups', 2, '12 je Seite', 75),
  (5, 'Wadenheben einbeinig', NULL, 3, '15 je Seite', 45),
  (6, 'Liegestütze (klassisch)', NULL, 2, 'Max.', 90),
  (7, 'Enge Liegestütze (Trizepsfokus)', NULL, 2, '10–15', 75),
  (8, 'Dips', NULL, 2, '10–15', 90),
  (9, 'Handtuch-Rudern (am Türrahmen)', 'Handtuch-Rudern (am Türrahmen)', 2, '12', 90),
  (10, 'Superman (liegend)', 'Superman (liegend)', 2, '15', 60),
  (11, 'Schulterdrücken', NULL, 2, '15', 60),
  (12, 'Seitheben', NULL, 3, '15', 60),
  (13, 'Bizepscurls', NULL, 2, '15', 60),
  (14, 'Crunches', NULL, 2, '20', 60),
  (15, 'Plank', NULL, 3, '30–45 Sek.', 60)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── HM2 · Männer | Homeworkout Rücken Fokus ──────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'HM2', 'maennlich', 'Männer | Homeworkout Rücken Fokus',
    'Männer mit Rückenbeschwerden, Verspannungen oder Fehlhaltung durch langes Sitzen – Training zuhause ohne Geräte',
    'Rücken, Haltungskorrektur & Rumpfstabilisierung & Ganzkörper',
    '3× pro Woche (z. B. Mo / Mi / Fr)', 60, '60–90 Sekunden',
    'Dieser Plan ist präventiv und kräftigend ausgerichtet – kein Ersatz für ärztliche Behandlung bei akuten Beschwerden. Bei starken oder ausstrahlenden Schmerzen bitte zuerst einen Arzt aufsuchen.',
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Schmerzfreie Bewegungsmuster etablieren, tiefe Rückenmuskulatur aktivieren"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Haltungsmuskulatur kräftigen, Rumpfstabilität aufbauen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Belastbarkeit festigen, Alltagshaltung spürbar verbessert"}]'::jsonb,
    ARRAY[
      'Handtuch-Rudern & Superman bekommen drei Sätze: Das sind die zwei Schlüsselübungen für den Rücken in diesem Plan – hier wird die Arbeit gemacht.',
      'Bird Dog: Klingt einfach, ist es nicht – die Herausforderung liegt darin, die Hüfte komplett stabil zu halten. Wer wackelt, macht es richtig.',
      'Dead Bug: Unterer Rücken bleibt die ganze Zeit flach auf dem Boden – sobald er sich hebt, ist das Bein zu weit unten. Amplitude reduzieren, nicht die Technik.',
      'Erhöhte Liegestütze (Hände auf Stuhl): Durch den erhöhten Winkel wird weniger Gewicht belastet – ideal für Leute, die normale Liegestütze noch nicht sauber schaffen.',
      'Tägliche Ergänzung empfohlen: 5 Minuten Mobilisation für Brustwirbelsäule und Nacken nach dem Aufstehen – Katze-Kuh, Brustöffner an der Wand, Nackendehnung.',
      'Plank-Steigerung: Wo. 1–3: 30 Sek. · Wo. 4–6: 40 Sek. · Wo. 7–8: 45 Sek.',
      'Phase 3 (Wo. 7–8): Handtuch-Rudern mit längerer Haltezeit oben (2–3 Sek.) für mehr Muskelspannung – Bulgarian Split Squats mit Wasserflaschen als Progression.'
    ], 18
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Handtuch-Rudern (am Türrahmen)', 'Handtuch-Rudern (am Türrahmen)', 3, '12–15', 90),
  (2, 'Superman (liegend)', 'Superman (liegend)', 3, '15', 60),
  (3, 'Bird Dog (Vierfüßlerstand)', 'Bird Dog', 2, '10 je Seite', 60),
  (4, 'Reverse Snow Angels (Bäuchlings)', 'Reverse Snow Angels', 2, '12', 60),
  (5, 'Vorgebeugtes Rudern (Wasserflasche)', NULL, 2, '15', 75),
  (6, 'Vorgebeugtes Seitheben hinten (Wasserflasche)', 'Vorgebeugtes Seitheben hinten (Wasserflasche)', 3, '15', 60),
  (7, 'Glute Bridge / Beckenheben (Boden)', 'Glute Bridge / Beckenheben', 2, '20', 60),
  (8, 'Dead Bug (Rückenlage)', 'Dead Bug', 2, '10 je Seite', 60),
  (9, 'Kniebeugen (Körpergewicht)', NULL, 2, '15', 75),
  (10, 'Ausfallschritte auf der Stelle', NULL, 2, '10 je Seite', 75),
  (11, 'Erhöhte Liegestütze (Hände auf Stuhl)', NULL, 2, '12–15', 75),
  (12, 'Seitheben (Wasserflasche)', NULL, 3, '15', 60),
  (13, 'Plank (Unterarmstütz)', NULL, 3, '30–45 Sek.', 60),
  (14, 'Seitlicher Plank', NULL, 2, '20–30 Sek. je Seite', 60)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── HM3 · Männer | Homeworkout Fat Burn ──────────────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'HM3', 'maennlich', 'Männer | Homeworkout Fat Burn',
    'Männer, die zuhause gezielt Fett verbrennen und den Stoffwechsel ankurbeln wollen – kein Studio, keine Geräte',
    'Maximaler Kalorienverbrauch, hohe Wiederholungen, kurze Pausen & Ganzkörper',
    '3–4× pro Woche (z. B. Mo / Di / Do / Sa)', 60, '30–45 Sekunden', NULL,
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Körper an hohe Belastung gewöhnen, Ausdauer aufbauen, Technik sichern"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Pausen auf 30 Sek. reduzieren, Wiederholungen steigern"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximale Intensität – jeder Satz bis zur sauberen Grenze"}]'::jsonb,
    ARRAY[
      '🔥 Prinzip: Kurze Pausen + große Muskelgruppen + hohe Wiederholungen = Puls oben, Kalorien weg. Kein Gewicht nötig – der eigene Körper reicht als Widerstand vollkommen aus.',
      'Pausen sind der Schlüssel: 30–45 Sek. ist kurz – ein Timer ist Pflicht. Wer länger pausiert, verliert den Fat-Burn-Effekt.',
      '25 Kniebeugen als Einstieg: Das klingt nach nichts – aber mit 45 Sek. Pause danach direkt weiter wird man schnell merken, dass der Körper arbeitet.',
      'Liegestütze Max.: So viele wie mit sauberer Technik möglich – keine halben Wdh. zählen. Lieber 6 saubere als 15 schlechte.',
      'Sliding Mountain Climbers: Funktionieren nur auf glattem Boden – auf Teppich einfach normale Mountain Climbers ohne Handtuch machen.',
      '4× pro Woche ab Phase 2: Wer Feuer gefangen hat, kann ab Woche 4 eine vierte Einheit einbauen – aber zwischen zwei Einheiten immer mindestens einen Ruhetag.',
      'Ernährung: Kaloriendefizit ist der Motor – dieser Plan liefert den Verbrauch, die Küche liefert das Defizit.',
      'Phase 3 (Wo. 7–8): Kniebeugen auf 30 Wdh. steigern, Pausen konsequent auf 30 Sek. halten – das ist die finale Steigerungsschraube.'
    ], 19
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Kniebeugen (Körpergewicht)', NULL::text, 2, '25', 45),
  (2, 'Step-ups', 'Step-ups', 2, '15 je Seite', 45),
  (3, 'Ausfallschritte gehend', NULL, 2, '15 je Seite', 45),
  (4, 'Glute Bridge / Beckenheben (schnell)', 'Glute Bridge / Beckenheben', 2, '25', 30),
  (5, 'Wadenheben beidbeinig (schnell)', NULL, 3, '25', 30),
  (6, 'Liegestütze (klassisch)', NULL, 2, 'Max.', 45),
  (7, 'Decline Liegestütze (Füße auf Stuhl)', 'Decline Liegestütze (Füße auf Stuhl)', 2, '10–15', 45),
  (8, 'Dips', NULL, 2, '15', 45),
  (9, 'Handtuch-Rudern (am Türrahmen)', 'Handtuch-Rudern (am Türrahmen)', 2, '15', 45),
  (10, 'Superman (liegend, zügig)', 'Superman (liegend)', 2, '20', 30),
  (11, 'Schulterdrücken (Wasserflasche)', NULL, 2, '20', 30),
  (12, 'Seitheben (Wasserflasche)', NULL, 3, '20', 30),
  (13, 'Sliding Mountain Climbers', 'Sliding Mountain Climbers', 2, '20 je Seite', 30),
  (14, 'Crunches', NULL, 2, '25', 30),
  (15, 'Beinheben (Rückenlage)', NULL, 2, '15', 30),
  (16, 'Plank', NULL, 3, '40 Sek.', 30)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── M6 · Männer | Abnehmen Einsteiger (Studio) ───────────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'M6', 'maennlich', 'Männer | Abnehmen Einsteiger',
    'Männer mit Übergewicht oder wenig Trainingserfahrung, die gezielt abnehmen und den Stoffwechsel ankurbeln wollen',
    'Kalorienverbrauch, Stoffwechselaktivierung & Ganzkörper',
    '3× pro Woche (z. B. Mo / Mi / Fr)', 60, '45–60 Sekunden', NULL,
    '[{"nummer":1,"wochen_von":1,"wochen_bis":3,"ziel":"Bewegungsmuster lernen, Ausdauer aufbauen, Körper an Belastung gewöhnen"},{"nummer":2,"wochen_von":4,"wochen_bis":6,"ziel":"Pausen schrittweise kürzen, Gewichte leicht steigern, Belastung erhöhen"},{"nummer":3,"wochen_von":7,"wochen_bis":8,"ziel":"Maximaler Kalorienverbrauch, spürbare Veränderungen im Körpergefühl"}]'::jsonb,
    ARRAY[
      '🔥 Prinzip: Höhere Wiederholungszahlen + kürzere Pausen = mehr Kalorienverbrauch während und nach dem Training (Nachbrenneffekt). Gewicht ist sekundär – Bewegung ist primär.',
      'Kurze Pausen konsequent einhalten: Das ist der entscheidende Hebel bei diesem Plan – der Puls bleibt oben und der Kalorienverbrauch steigt deutlich.',
      'Gewichtwahl: Leichter als gedacht starten – bei 20 Wdh. muss das Gewicht so gewählt sein, dass die letzten 3–4 Wdh. brennen, aber die Technik sauber bleibt.',
      'Ausfallschritte: Falls Knie oder Gleichgewicht am Anfang ein Problem sind, einfach auf der Stelle marschieren als Alternative – Hauptsache Bewegung.',
      'Pausen in Phase 2 (ab Wo. 4) schrittweise kürzen: Von 60 auf 45 Sek. bei allen Übungen – das erhöht die Intensität ohne mehr Gewicht.',
      'Rückenstrecken: Wichtig für Körperhaltung und als Gegengewicht zu den vielen Beinübungen – nicht überspringen.',
      'Ernährung: Training allein reicht nicht – ein moderates Kaloriendefizit von 300–500 kcal täglich ist der schnellste Weg zum Ziel.',
      'Ausdauer ergänzen: An trainingsfreien Tagen 20–30 Min. lockeres Cardio (Spazieren, Radfahren, Schwimmen) beschleunigt den Fortschritt deutlich.'
    ], 5
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Beinpresse', 'Beinpresse (Leg Press)', 2, '20', 60),
  (2, 'Beinstrecken (Maschine)', 'Beinstrecken (Leg Extension)', 2, '20', 45),
  (3, 'Beinbeugen sitzend (Maschine)', 'Beinbeugen (Leg Curl)', 2, '20', 45),
  (4, 'Ausfallschritte auf der Stelle (Körpergewicht oder leichte Kurzhantel)', 'Ausfallschritte (Lunges)', 2, '12 je Seite', 60),
  (5, 'Wadenheben stehend (Maschine)', 'Wadenheben stehend', 3, '20', 45),
  (6, 'Latzug zur Brust (breiter Griff)', 'Latzug zum Nacken / zur Brust', 2, '15', 60),
  (7, 'Rudern sitzend (Kabelzug, V-Griff)', 'Rudern sitzend', 2, '15', 60),
  (8, 'Rückenstrecken / Hyperextensions', 'Rückenstrecken (Hyperextensions)', 2, '15', 60),
  (9, 'Brustpresse (Maschine)', 'Bankdrücken (Flachbank)', 2, '15', 60),
  (10, 'Schulterdrücken (Maschine)', 'Schulterdrücken / Military Press', 2, '15', 60),
  (11, 'Seitheben (Kurzhantel, leicht)', 'Seitheben', 3, '15', 45),
  (12, 'Bizepscurls (Kurzhantel, alternierend)', 'Bizepscurls', 2, '15', 45),
  (13, 'Trizeps-Pushdowns (Kabelzug, Seil)', 'Trizepsdrücken / Kabel-Pushdowns', 2, '15', 45),
  (14, 'Crunches (Matte)', 'Crunches', 2, '20', 45),
  (15, 'Plank (Unterarmstütz)', 'Plank (Unterarmstütz)', 3, '30 Sek.', 45)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── M7 · Männer | Abnehmen Fortgeschritten (Studio) ──────────────────────────

WITH plan AS (
  INSERT INTO public.trainingsplaene (plan_key, geschlecht, name, zielgruppe, fokus_text, frequenz, netto_minuten, pause_hinweis, voraussetzung, phasen, trainer_hinweise, sort_order)
  VALUES (
    'M7', 'maennlich', 'Männer | Abnehmen Fortgeschritten',
    'Männer mit Trainingserfahrung, die gezielt Körperfett abbauen und gleichzeitig Muskelmasse erhalten wollen',
    'Maximaler Kalorienverbrauch durch schwere Grundübungen mit hohen Wiederholungen & Ganzkörper',
    '3× pro Woche (z. B. Mo / Mi / Fr)', 60, '45–60 Sekunden', NULL,
    '[{"nummer":1,"wochen_von":1,"wochen_bis":2,"ziel":"Technik bei hohen Wdh. unter Ermüdung sichern, Körper anpassen lassen"},{"nummer":2,"wochen_von":3,"wochen_bis":5,"ziel":"Pausen konsequent kurz halten, Gewichte moderat steigern"},{"nummer":3,"wochen_von":6,"wochen_bis":8,"ziel":"Maximale Intensität – Puls oben, Gewichte hoch, Fettverbrennung auf Hochtouren"}]'::jsonb,
    ARRAY[
      '🔥 Prinzip: Schwere Verbundübungen verbrennen deutlich mehr Kalorien als Isolationsübungen – wer mit Kniebeugen und Kreuzheben bei hohen Wiederholungen arbeitet, bringt den Stoffwechsel richtig auf Touren. Kurze Pausen halten den Puls dauerhaft oben.',
      'Pausen sind heilig: 45–60 Sek. – nicht länger. Ein Timer hilft. Wer länger pausiert, verliert den Effekt.',
      'Gewicht anpassen: Bei 15 Wdh. Kniebeugen ist das Gewicht natürlich niedriger als beim Krafttraining – Ego weglegen.',
      'Technik unter Ermüdung: Gerade bei Kniebeugen und Rudern gegen Ende des Satzes auf den Rücken achten – lieber eine Wdh. weniger.',
      'Puls oben halten: Ziel ist ein dauerhaft erhöhter Puls – das Studio ist heute kein Kraftraum, sondern ein Verbrennungsmotor.',
      'Kniebeugen & RDL mit 15 Wdh.: Das ist anstrengender als es klingt – die Oberschenkel werden brennen. Genau das ist der Punkt.',
      'Vorgebeugtes Rudern mit 15 Wdh.: Rücken bleibt parallel zum Boden, kein Aufrichten zum Schwung holen – Körperspannung die ganzen 15 Wdh. halten.',
      'Bankdrücken & Dips: Die Kombination aus beiden deckt die gesamte Brust und den Trizeps effizient ab – kurze Pause dazwischen hält den Oberkörper unter Dampf.',
      'Klimmzüge: Falls noch nicht ohne Unterstützung möglich – Maschine nutzen und Gewicht jede Woche reduzieren. Das Ziel ist freie Klimmzüge bis Woche 8.',
      'Ab-Wheel Rollouts: Nur so weit rollen, wie der untere Rücken flach bleibt – kein Hohlkreuz.',
      'Ernährung: Proteinzufuhr hochhalten (mind. 1,6–2g pro kg Körpergewicht) – das schützt die Muskelmasse während des Kaloriendefizits.',
      'Ausdauer an freien Tagen: 30–45 Min. lockeres Cardio (Radfahren, Schwimmen, Walken) an den trainingsfreien Tagen maximiert den wöchentlichen Kalorienverbrauch.',
      'Phase 3 (Wo. 6–8): Pausen auf konsequent 45 Sek. reduzieren – das ist die finale Steigerungsschraube dieses Plans.'
    ], 6
  ) RETURNING id
)
INSERT INTO public.trainingsplan_uebungen (trainingsplan_id, sort_order, name, uebung_id, saetze, wiederholungen, pause_sekunden)
SELECT plan.id, v.sort_order, v.name, (SELECT id FROM uebungsbibliothek WHERE name = v.bib), v.saetze, v.wdh, v.pause
FROM plan, (VALUES
  (1, 'Kniebeugen (Langhantel oder Multipresse)', 'Kniebeugen (Squats)', 2, '15', 60),
  (2, 'Rumänisches Kreuzheben (Langhantel)', 'Rumänisches Kreuzheben (RDL)', 2, '15', 60),
  (3, 'Ausfallschritte gehend (Kurzhantel)', 'Ausfallschritte (Lunges)', 2, '12 je Seite', 60),
  (4, 'Beinbeugen liegend (Maschine)', 'Beinbeugen (Leg Curl)', 2, '20', 45),
  (5, 'Wadenheben stehend (Maschine)', 'Wadenheben stehend', 3, '20', 45),
  (6, 'Klimmzüge (Unterstützungsmaschine oder frei)', 'Klimmzüge (Pull-ups / Chin-ups)', 2, '10–12', 60),
  (7, 'Vorgebeugtes Langhantelrudern', 'Vorgebeugtes Langhantelrudern', 2, '15', 60),
  (8, 'Rückenstrecken / Hyperextensions', 'Rückenstrecken (Hyperextensions)', 2, '15', 60),
  (9, 'Bankdrücken (Langhantel, Flachbank)', 'Bankdrücken (Flachbank)', 2, '15', 60),
  (10, 'Dips (am Barren oder Dip-Maschine)', 'Dips', 2, '12–15', 60),
  (11, 'Military Press (Kurzhantel, stehend)', 'Schulterdrücken / Military Press', 2, '12', 60),
  (12, 'Seitheben (Kabelzug)', 'Seitheben', 3, '15', 45),
  (13, 'Bizepscurls (SZ-Stange)', 'Bizepscurls', 2, '15', 45),
  (14, 'Beinheben hängend (Klimmzugstange)', 'Beinheben', 2, '12–15', 60),
  (15, 'Ab-Wheel Rollouts', 'Ab-Wheel Rollouts', 2, '10', 60),
  (16, 'Plank (Unterarmstütz)', 'Plank (Unterarmstütz)', 3, '40 Sek.', 45)
) AS v(sort_order, name, bib, saetze, wdh, pause);

-- ── Zuordnung: Ort=zuhause (kein/ruecken je Geschlecht, alle Level) ──────────

INSERT INTO public.trainingsplan_zuordnung (geschlecht, level, fokus, ort, trainingsplan_id)
SELECT g.geschlecht, l.level, f.fokus, 'zuhause', t.id
FROM (VALUES ('maennlich'), ('weiblich')) AS g(geschlecht)
CROSS JOIN (VALUES ('beginner'), ('leicht_aktiv'), ('regelmaessig'), ('intensiv')) AS l(level)
CROSS JOIN (VALUES ('kein'), ('ruecken')) AS f(fokus)
JOIN public.trainingsplaene t ON t.plan_key = (
  CASE WHEN g.geschlecht = 'maennlich' AND f.fokus = 'kein' THEN 'HM1'
       WHEN g.geschlecht = 'maennlich' AND f.fokus = 'ruecken' THEN 'HM2'
       WHEN g.geschlecht = 'weiblich' AND f.fokus = 'kein' THEN 'HF1'
       WHEN g.geschlecht = 'weiblich' AND f.fokus = 'ruecken' THEN 'HF2'
  END
);

-- Fatburn zuhause (beide Geschlechter, alle Level → je ein Plan)
INSERT INTO public.trainingsplan_zuordnung (geschlecht, level, fokus, ort, trainingsplan_id)
SELECT g.geschlecht, l.level, 'fatburn', 'zuhause', t.id
FROM (VALUES ('maennlich'), ('weiblich')) AS g(geschlecht)
CROSS JOIN (VALUES ('beginner'), ('leicht_aktiv'), ('regelmaessig'), ('intensiv')) AS l(level)
JOIN public.trainingsplaene t ON t.plan_key = (CASE WHEN g.geschlecht = 'maennlich' THEN 'HM3' ELSE 'HF3' END);

-- Fatburn Studio (nur Männer — Einsteiger/Leicht Aktiv → M6, Regelmäßig/Intensiv → M7)
INSERT INTO public.trainingsplan_zuordnung (geschlecht, level, fokus, ort, trainingsplan_id)
SELECT 'maennlich', l.level, 'fatburn', 'studio', t.id
FROM (VALUES ('beginner', 'M6'), ('leicht_aktiv', 'M6'), ('regelmaessig', 'M7'), ('intensiv', 'M7')) AS l(level, plan_key)
JOIN public.trainingsplaene t ON t.plan_key = l.plan_key;
