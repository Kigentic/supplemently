# Plan B — B2B Challenge-Plattform für inhabergeführte Fitnessstudios

**Stand:** Juli 2026 · **Status:** Konzeptphase, noch nicht begonnen

> **Wichtige Abgrenzung:** Dieses Dokument ist bewusst getrennt von [`GAMEPLAN.md`](GAMEPLAN.md) gehalten.
> Die dort beschriebene Longevity-Lifestyle-Challenge ist die **laufende B2C-Geschichte** — die geht
> so live, wie sie ist. Newsletter an bestehende Leads/Endkunden gehen voraussichtlich nächste Woche
> raus. Nichts aus diesem Plan-B-Dokument darf den B2C-Launch verzögern oder das bestehende
> Challenge-System destabilisieren. Dieses Dokument ist reine Konzeptarbeit für eine mögliche
> **zweite, parallele Produktlinie** — kein Auftrag, jetzt etwas umzubauen.

---

## Vision

Das für die Longevity-Challenge gebaute System (Registrierung, Onboarding, Wochen-Struktur,
Check-in mit Ampelsystem, Scoring/Noten, Affiliate-Empfehlungen mit Klick-Tracking) ist im Kern
**themen-unabhängig**. Die Idee: dasselbe System als **Done-for-you-Challenge-Baukasten** an
inhabergeführte Fitnessstudios verkaufen — nicht nur eine Longevity-Challenge, sondern austauschbare
Challenge-Typen (Rücken-Challenge, Abnehm-Challenge, Anti-Cellulite-Challenge, ...) in einem
festen 8-Wochen-Zyklus.

**Der Kern-Pitch fürs Studio:** "Du musst dir kein strukturiertes Neukunden-Onboarding-System selbst
bauen (das schafft eh kaum ein inhabergeführtes Studio). Du kaufst eins — wählst den Challenge-Typ,
zahlst, fertig. Automatisierte Teilnehmerbetreuung, Score/Gamification, Supplement- und
Produkt-Upsells (Affiliate) sind schon drin."

**Bewusst kein Studio-Branding nötig** — Vorbild sind bestehende unbrandete Drittanbieter-Systeme
(z.B. Online-Abnehmprogramme, die Studios ohne eigenes Branding weiterverkaufen). Das reduziert die
Komplexität massiv: kein Theming-System pro Studio nötig, ein einziges Produkt-Erlebnis für alle
Endkunden, unabhängig vom Studio.

---

## Zwei Landingpages, zwei Zielgruppen

| Landingpage | Zielgruppe | Zweck |
|---|---|---|
| **B2C** (bestehend, Kap. 1–12 in `GAMEPLAN.md`) | Endkunden | Direkte Challenge-Anmeldung — läuft unverändert weiter |
| **B2B** (neu, Teil dieses Plans) | Studio-Inhaber | Studio registriert sich, wählt Challenge-Typ(en), zahlt, bekommt eigenen Anmelde-Link für seine Endkunden |

Der B2B-Flow ist im Kern: **Studio registrieren → Challenge-Typ auswählen → zahlen → fertig
konfigurierter Anmeldelink für die eigenen Kunden.** Alles andere (Wochenaufgaben, Check-ins,
Score, Upsells) läuft danach automatisiert, ohne dass das Studio operativ eingreifen muss.

---

## Wichtige Erkenntnis: Multi-Tenant-Fundament existiert bereits — nur nicht für die Challenge

Das **Kern-Supplemently-Produkt** (Fragebogen + Matching, `GAMEPLAN.md` referenziert es nicht, siehe
`HANDOVER.md`) hat bereits eine `studios`-Tabelle (Migration `0001_init.sql`):

```
studios: id, name, slug (Microsite-URL, unique), branding (jsonb), voucher_text,
         kontakt_email, abo_status ('trial'/'active'/'cancelled'), owner_id, created_at
```

Das ist **fast genau das Fundament**, das die B2B-Challenge-Plattform braucht — `abo_status` ist
im Kern schon ein Subscription-Gate, `slug` schon eine Microsite-URL-Lösung. Die Challenge-Tabellen
(`challenges`, `challenge_teilnahmen`, etc. aus Migration `0008_challenge_platform.sql`) referenzieren
aktuell **keine** `studios` — die Challenge ist komplett single-tenant gebaut (ein globaler
Masteradmin, eine Kohorte). Der Umbau ist also: **bestehendes `studios`-Konzept auf die
Challenge-Tabellen ausweiten**, nicht von null anfangen.

---

## Architektur-Deltas (was sich ändern müsste)

### 1. Challenge-Inhalte: von Code zu Daten

Aktuell lebt die komplette Wochen-/Habit-Struktur (8 Wochen, Titel, Habits, `why`-Texte,
Anleitungs-Varianten für Mobility/Atemübungen) hartkodiert in `lib/challengeWeeks.ts` als
TypeScript-Konstante — spezifisch für die Longevity-Challenge. Für mehrere Challenge-Typen muss das
zu **Daten** werden (eigene Tabellen `challenge_typen` + `challenge_typ_wochen` + `challenge_typ_habits`,
oder ein JSONB-Content-Blob pro Woche). Damit lässt sich "Rücken-Challenge Woche 3" komplett anders
befüllen als "Abnehm-Challenge Woche 3", ohne Code zu ändern.

**Das ist der aufwändigste Teil — und eher ein Content-Problem als ein Code-Problem:** Für jeden
neuen Challenge-Typ müssen 8 Wochen × mehrere Habits × Begründungstexte × ggf. Anleitungen inhaltlich
neu erarbeitet werden (so wie es für Longevity in dieser Session mehrfach passiert ist). Die
Datenstruktur dafür zu bauen ist überschaubar; den Inhalt für "Rücken" oder "Anti-Cellulite" fundiert
zu schreiben ist der eigentliche Aufwand.

### 2. Multi-Tenant-Scoping

- `challenges.studio_id` → FK auf `studios` (bestehende Tabelle erweitern/nutzen)
- `challenge_teilnahmen`, `wochencheckins`, `affiliate_links`-Ausspielung etc. müssen implizit übers
  Studio scoped werden (RLS: Studio sieht nur eigene Teilnehmer, nicht die anderer Studios)
- Der aktuelle Masteradmin-Bereich (`/challenge/admin/*`) ist global gebaut — bräuchte eine
  Studio-Ebene dazwischen: Masteradmin sieht alles, Studio-Admin sieht nur eigene Teilnehmer/Stats

### 3. Studio-Onboarding-Flow (neu)

- Registrierung: Studio-Name, Kontakt, Zahlungsart
- Challenge-Typ-Auswahl (ggf. mehrere gleichzeitig buchbar)
- Zahlung/Abo (analog `studios.abo_status`, evtl. CopeCart/Stripe — siehe offene Payment-Frage
  in `GAMEPLAN.md` Kap. 9, gilt hier genauso)
- Nach Abschluss: generierter Anmeldelink für die Endkunden des Studios (analog zum bestehenden
  `slug`-Konzept bei `studios`)
- Da das Studio rechtlich der Betreiber ist (siehe "Offene Fragen/Risiken" Punkt 3): Studio hinterlegt
  bei der Registrierung eigene Impressums-/Kontaktdaten, die im Endkunden-Flow des jeweiligen Studios
  angezeigt werden — kein globales Impressum für alle Studios

### 4. Affiliate/Upsell-Ebene

Grundsätzlich **direkt wiederverwendbar** (`lib/affiliateMatching.ts`, `affiliate_links`,
Klick-Tracking) — Matching läuft schon über `trigger_tags[]`, nicht über Challenge-spezifische Logik.
Für neue Challenge-Typen einfach passende Produkte mit passenden Tags ergänzen. Studiospezifische
Upsells (eigene Angebote des Studios zusätzlich zu den globalen Affiliate-Partnern) sind eine
denkbare Erweiterung, aber **bewusst nicht Kern-Scope** — Gefahr, das Konzept unnötig zu verkomplizieren
(O-Ton User: "das ist vielleicht schon ein bisschen zu verwuselt").

---

## Was komplett wiederverwendbar ist, ohne Änderung

- **Scoring-Engine** (`lib/challengeScoring.ts`) — Punktelogik (Ampel → Punkte, Noten-Schwellen)
  ist Challenge-Typ-agnostisch, funktioniert für jeden Themenbereich unverändert
- **Check-in-UI** (`CheckinControls.tsx`, Ampelsystem) — komplett generisch
- **"So geht's"-Anleitungs-Popup-Mechanik** (`AnleitungModal.tsx`) — Datenstruktur (Varianten,
  Rotation) ist bereits generisch, nur der Inhalt ist Longevity-spezifisch
- **Affiliate-Matching + Klick-Tracking + Statistik-Seite** — siehe oben, direkt wiederverwendbar
- **Wochen-Freischaltungs-Logik** (`lib/challengeSchedule.ts`) — komplett generisch (Datum-basiert,
  kein Themenbezug)

---

## Offene Fragen / Risiken

1. **Content-Erstellung pro Challenge-Typ** — größter Aufwandsposten, nicht Code. Braucht
   fachlich fundierte Inhalte (z.B. Physio-Hintergrund für Rücken-Challenge).
2. **Preismodell fürs Studio** — einmalig, Abo, pro Teilnehmer, gestaffelt nach Studiogröße? Noch
   nicht entschieden.
3. **Rechtliches bei unbrandeten White-Label-Systemen** — **Entscheidung (diese Session):** Wir
   stellen nur die Architektur/Plattform bereit (reines SaaS-/Infrastruktur-Verhältnis). Der
   eigentliche **Betreiber der jeweiligen Challenge gegenüber den Endkunden ist das Studio** —
   Impressum, Verantwortlichkeit, Kundenbeziehung liegen beim Studio, nicht bei uns. Muss sich in
   AGB/Studio-Vertrag und ggf. im Anmeldeflow (Impressum-Angabe pro Studio statt global) widerspiegeln,
   sobald es konkret wird — aber Grundprinzip steht.
4. **Wie viele Challenge-Typen zum Start?** — Reicht ein zweiter Typ (z.B. Rücken) als
   Machbarkeitsnachweis, bevor in die volle Plattform investiert wird?
5. **Studiospezifische Upsells** — explizit als "später, vielleicht" markiert, nicht Kern-Scope.

---

## Grober Phasenplan (unverbindlich, keine Zeitschätzung)

- **Phase 0 (läuft bereits):** B2C-Longevity-Challenge unverändert launchen — dieser Plan hat
  darauf keinen Einfluss.
- **Phase 1:** Datenmodell-Umbau — Challenge-Inhalte von `lib/challengeWeeks.ts` in eine
  Datenstruktur überführen, die mehrere Challenge-Typen erlaubt. `studio_id` auf `challenges`.
- **Phase 2:** Studio-Onboarding-Flow + B2B-Landingpage + Payment-Anbindung.
- **Phase 3:** Zweiter Challenge-Typ (z.B. Rücken) als echter Feldtest mit einem ersten Pilot-Studio.
- **Phase 4:** Weitere Challenge-Typen, ggf. studiospezifische Upsells, Skalierung.

---

## Implementierungsplan (Architektur — Inhalte kommen später)

Detaillierter Plan für Phase 1+, unten in konkreten Schritten. **Reine Architektur** — überall wo
Inhalte (Wochentexte, Habits, Anleitungen für neue Challenge-Typen) gebraucht würden, wird nur die
Datenstruktur angelegt, nicht befüllt. Leitplanke für die gesamte Umsetzung: **additiv und
nullable, wo immer möglich** — die laufende B2C-Longevity-Challenge darf zu keinem Zeitpunkt
brechen. `lib/challengeWeeks.ts` bleibt bis zum finalen Cutover unangetastet funktionsfähig.

### Schritt 1 — Neue Tabellen: Challenge-Typen als Daten

```
challenge_typen
  id UUID PK, slug TEXT UNIQUE, name TEXT, beschreibung TEXT,
  wochen_anzahl SMALLINT DEFAULT 8, ist_aktiv BOOLEAN, created_at

challenge_typ_wochen                         -- 1 Zeile pro Woche pro Typ
  id UUID PK, challenge_typ_id FK, woche_nummer SMALLINT,
  theme TEXT, motto TEXT, color TEXT, text_color TEXT,
  icon_name TEXT,                            -- String-Referenz, siehe Icon-Mapping unten
  pillars TEXT[], created_at
  UNIQUE(challenge_typ_id, woche_nummer)

challenge_typ_habits                         -- 1 Zeile pro Habit
  id UUID PK, challenge_typ_wochen_id FK, sort_order SMALLINT,
  text TEXT, why TEXT, created_at

challenge_typ_habit_anleitungen              -- optional, "So geht's"-Varianten
  id UUID PK, habit_id FK, titel TEXT, sort_order SMALLINT

challenge_typ_habit_uebungen                 -- Einzelübungen je Variante
  id UUID PK, anleitung_id FK, name TEXT, dauer TEXT, hinweis TEXT, sort_order SMALLINT
```

Diese Struktur bildet 1:1 die bestehenden TS-Interfaces ab (`ChallengeWeek`, `ChallengeHabit`,
`AnleitungsVariante`, `HabitExercise` aus `lib/challengeWeeks.ts`) — normalisiert statt hartkodiert.
**Alternative, leichtgewichtigere Option:** ein einzelnes JSONB-Feld `habits_json` auf
`challenge_typ_wochen`, das die komplette Wochenstruktur als Blob hält, statt 3 zusätzlicher
Tabellen. Spart Migrationskomplexität, macht aber ein späteres Non-Code-Editier-Tool fürs Studio/
Team schwerer zu bauen (kein einzelnes Feld editierbar, nur der ganze Blob). Empfehlung: normalisiert,
falls perspektivisch ein Content-Editor für neue Challenge-Typen entstehen soll — sonst reicht JSONB.

**Migration A:** Tabellen anlegen (leer). **Migration B (separat, später):** Ein-Zeilen-Seed
`challenge_typen` mit genau einem Eintrag `slug='longevity-lifestyle'`, damit die bestehende
Challenge referenzierbar ist, ohne dass sich an ihrem Verhalten etwas ändert.

### Schritt 2 — Multi-Tenant-Spalten (additiv, nullable)

```
ALTER TABLE challenges ADD COLUMN challenge_typ_id UUID REFERENCES challenge_typen(id);  -- nullable
ALTER TABLE challenges ADD COLUMN studio_id       UUID REFERENCES studios(id);           -- nullable

CREATE TABLE studio_admins (
  id UUID PK, studio_id FK, user_id UUID REFERENCES auth.users(id),
  rolle TEXT DEFAULT 'inhaber', created_at
);

CREATE TABLE studio_challenge_typen (           -- welche Typen hat ein Studio gebucht
  studio_id FK, challenge_typ_id FK, freigeschaltet_am TIMESTAMPTZ,
  PRIMARY KEY (studio_id, challenge_typ_id)
);

ALTER TABLE studios ADD COLUMN impressum JSONB DEFAULT '{}'::jsonb;  -- Name/Anschrift/Kontakt fürs Endkunden-Impressum
```

Backfill: bestehende(r) `challenges`-Zeile(n) bekommen `challenge_typ_id` = die geseedete
Longevity-Zeile aus Schritt 1, `studio_id` bleibt NULL (die aktuelle B2C-Challenge gehört keinem
Studio — das ist explizit erlaubt, nicht jede Challenge braucht ein Studio).

### Schritt 3 — RLS/Zugriffslogik erweitern

Der Masteradmin-Check läuft aktuell überall applikationsseitig über `profiles.ist_admin` in den
API-Routes (nicht per RLS-Policy, siehe z.B. `app/api/admin/users/route.ts`). Neue Helper-Funktion
`isStudioAdminFor(userId, studioId)` (Lookup gegen `studio_admins`), genutzt in einem neuen Satz
Studio-Admin-API-Routes (`/api/studio-admin/...`), analog zu den bestehenden `/api/admin/...`-Routes,
aber gefiltert auf `challenges.studio_id = <eigenes Studio>`. Masteradmin-Flag bleibt als globaler
Override bestehen (sieht alle Studios).

### Schritt 4 — Code-Refactor: Datenquelle austauschen, Interfaces behalten

Kernidee: **alle Konsumenten von `CHALLENGE_WEEKS` ändern sich nicht**, wenn die TS-Interfaces
gleich bleiben. Nur die Quelle wechselt von "hartkodierte Konstante" zu "DB-Query".

- `lib/challengeWeeks.ts`: `CHALLENGE_WEEKS`-Konstante wird zu einer Funktion
  `getChallengeContent(challengeTypId): Promise<ChallengeWeek[]>`, die die 5 neuen Tabellen lädt
  und zu exakt derselben `ChallengeWeek[]`-Struktur zusammenbaut wie heute.
- **Icon-Problem:** `icon: TablerIcon` ist aktuell eine React-Komponentenreferenz, kann nicht in der
  DB stehen. Lösung: DB speichert `icon_name: string` (z.B. `"IconMoon"`), ein kleines
  `ICON_MAP: Record<string, TablerIcon>` in Code löst den String zur Laufzeit auf. Endliche,
  überschaubare Icon-Menge — muss nicht dynamisch sein.
- `habitsUpTo()`, `habitKey()`, `carryForwardText()`, `pickAnleitungsVariante()`: bleiben **pure
  Funktionen**, bekommen aber das schon geladene `ChallengeWeek[]` als Parameter statt implizit auf
  die alte Konstante zuzugreifen. Aufrufer (Seiten/API-Routes) laden die Wochen einmal (async) und
  reichen sie durch.
- `lib/challengeScoring.ts`: `maxScoreForWeek()`/`maxGesamtScore()` hängen von `habitsUpTo()` ab —
  bekommen ebenfalls `weeks: ChallengeWeek[]` als Parameter statt es implizit zu importieren.
- Betroffene Aufrufer (Signatur-Änderung durchreichen, aber keine Verhaltensänderung für die
  bestehende Longevity-Challenge): `ChallengeWeeksOverview.tsx`, `woche/[num]/page.tsx`,
  `checkin/page.tsx`, `admin/checkin-test/page.tsx`, `api/challenge/checkin/route.ts`,
  `api/admin/teilnahme/[teilnahmeId]/checkins/route.ts`.

### Schritt 5 — Affiliate-Ebene um Challenge-Typ ergänzen (optional, additiv)

`ALTER TABLE affiliate_links ADD COLUMN challenge_typ_id UUID REFERENCES challenge_typen(id);`
(nullable = für alle Typen nutzbar, wie bisher). Verhindert z.B., dass eine Rücken-Challenge
Barfußschuhe empfiehlt, nur weil `trigger_tags` zufällig matchen.

### Schritt 6 — Studio-Onboarding-Flow + B2B-Landingpage (neues Feature, kein Umbau)

Separates Stück Arbeit, baut auf Schritt 1–5 auf: Registrierung, Challenge-Typ-Auswahl, Payment,
generierter Anmeldelink, Impressum-Eingabe. Kommt erst, wenn das Datenmodell steht und mit der
migrierten Longevity-Challenge als erstem "Typ" durchgetestet ist.

### Reihenfolge & Sicherheits-Leitplanke

1. Schritt 1+2 als reine additive Migrationen — **kann parallel zum B2C-Betrieb passieren**, ändert
   nichts an bestehendem Verhalten (alles nullable, nichts wird gelesen).
2. Content-Migrationsskript (später, separates Vorhaben): bestehende Longevity-Inhalte aus
   `lib/challengeWeeks.ts` per Einmal-Skript in die neuen Tabellen überführen — **erst nachdem**
   Schritt 4 (Code-Refactor) auf einer Kopie/Staging verifiziert wurde.
3. Schritt 3+4 (RLS + Code-Cutover): erst wenn Content-Migration steht, **und erst nach dem
   B2C-Newsletter-Launch**, nicht währenddessen anfassen.
4. Schritt 5+6: eigene Vorhaben danach.

Kein Code, keine Migration wird durch dieses Dokument ausgelöst — das hier ist der Bauplan, auf den
sich Schritt 1 bezieht, sobald grünes Licht kommt.
