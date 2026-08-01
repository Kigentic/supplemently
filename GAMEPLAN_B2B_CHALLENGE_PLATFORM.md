# Plan B — B2B Challenge-Plattform für inhabergeführte Fitnessstudios

**Stand:** Juli 2026 · **Status:** Schritt 1–4 + 6 (Kern) umgesetzt und verifiziert — Studios können
sich unter `/studio/registrierung` selbst anlegen und unter `/challenge/admin/durchgaenge` eigene
Challenge-Durchgänge (Startdatum wählbar, fix 8 Wochen) anlegen. Offen: Schritt 5 (Affiliate-Ebene
pro Typ), Payment, Anmeldelink für Endkunden pro Durchgang, sowie separat Konto-Reaktivierung/
Einladungslink/Mitglieder-Detailauswertung für den Studio-Admin.
>
> **Begriffsklärung:** Was in Supabase/Code als "Kohorte" bezeichnet wurde (ein konkreter Lauf einer
> Challenge mit Start-/Enddatum), heißt ab jetzt durchgängig **"Challenge-Durchgang"** oder kurz
> **"Durchgang"** — verständlicher, "Kohorte" wird hier nicht mehr verwendet.

> **Wichtige Abgrenzung:** Dieses Dokument ist bewusst getrennt von [`GAMEPLAN.md`](GAMEPLAN.md) gehalten.
> Die dort beschriebene Longevity-Lifestyle-Challenge ist die **laufende B2C-Geschichte** — die geht
> so live, wie sie ist. Newsletter an bestehende Leads/Endkunden gehen voraussichtlich nächste Woche
> raus. Nichts aus diesem Plan-B-Dokument darf den B2C-Launch verzögern oder das bestehende
> Challenge-System destabilisieren.
>
> **Auflösung des "erst nach dem Launch"-Dilemmas (diese Session):** Die bestehende Longevity-Challenge
> wurde einem echten Referenz-Studio **"Turnkiste"** zugeordnet (Migration `0018_turnkiste_studio.sql`),
> statt bis nach dem Launch mit `studio_id = NULL` zu warten. Der Masteradmin ist gleichzeitig
> Studio-Admin von Turnkiste. B2C-Kunden aus dem Newsletter werden dadurch automatisch zu
> "virtuellen Mitgliedern" von Turnkiste — die Multi-Tenant-Struktur existiert von Anfang an, ohne
> dass sich am B2C-Verhalten irgendetwas ändert (kein Code liest `studio_id` bisher).

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
Masteradmin, ein Durchgang). Der Umbau ist also: **bestehendes `studios`-Konzept auf die
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

### Schritt 1 — Neue Tabellen: Challenge-Typen als Daten ✅ umgesetzt (Migration `0016_challenge_typen.sql`)

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

### Schritt 2 — Multi-Tenant-Spalten (additiv, nullable) ✅ umgesetzt (Migration `0017_multi_tenant_columns.sql`)

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

### Schritt 3 — Studio-Admin-Rolle (Kern) ✅ umgesetzt

`getAdminScope()`/`hasAdminAccess()` in `lib/apiAuth.ts`: Masteradmin (`profiles.ist_admin`) hat
Vorrang und sieht alles; sonst wird gegen `studio_admins` geprüft, für welche Studio(s) der User
Admin ist. Kein neuer Routen-Satz nötig — die 3 bestehenden Admin-Routen wurden direkt gescopt:

- `/api/admin/users` — Studio-Admin sieht nur Teilnehmer + Profile der eigenen Studio(s)
- `/api/admin/teilnahme/[id]/checkins` — prüft, dass die Teilnahme zum eigenen Studio gehört
- `/api/admin/affiliate-stats` — Klicks/Impressions nur aus dem eigenen Scope (über die eigenen
  Teilnahme-IDs gefiltert, da `empfehlungen_log` keine direkte `studio_id`-Spalte hat)

Frontend (`/challenge/admin`, `/challenge/admin/affiliate-stats`) zeigt je nach zurückgegebenem
`scope` ("all"/"studio") "Masteradmin" oder "Studio-Admin". "Check-in-Fragen testen" bleibt
Masteradmin-only (Content-Testing-Tool, keine Studio-Management-Funktion).

**Isolation verifiziert:** temporäres zweites Studio + Challenge + Teilnahme gegen die
Produktions-DB angelegt, exakte Route-Query beidseitig getestet (gescoped auf Turnkiste zeigt
NICHT die fremde Teilnahme, gescoped auf das andere Studio zeigt NUR diese) — kein Datenleck,
danach vollständig aufgeräumt.

**Bewusst nicht Teil davon (eigener Task, siehe User-Anfrage):** Konto-Reaktivierung,
Einladungslink-Versand, Mitglieder-Detailauswertung/Fortschrittsbalken pro Mitglied. Diese
Features existieren aktuell auch für den Masteradmin nirgends — kein reines Scoping-Thema,
sondern neue Funktionalität.

### Schritt 4 — Code-Refactor: Datenquelle austauschen, Interfaces behalten ✅ umgesetzt

Content-Migration + Code-Cutover abgeschlossen (Migration `0016` seit Schritt 1 bereits angelegt,
Inhalte per Einmal-Skript befüllt — Skript danach gelöscht, da CHALLENGE_WEEKS als Quelle entfernt
wurde). `lib/challengeWeeks.ts` exportiert jetzt `fetchChallengeWeeks(supabase, challengeTypId)`
(async DB-Query) statt der hartkodierten Konstante — TS-Interfaces blieben unverändert bis auf
`icon: TablerIcon` → `icon_name: string` (Auflösung über `ICON_MAP`, da React-Komponenten nicht in
der DB liegen können).

`habitsUpTo()` und die Scoring-Funktionen (`maxScoreForWeek`/`maxGesamtScore`) nehmen jetzt `weeks`
als Parameter statt implizit auf die Konstante zuzugreifen. Alle 6 betroffenen Konsumenten angepasst:
`ChallengeWeeksOverview.tsx`, `woche/[num]/page.tsx`, `checkin/page.tsx`, `admin/checkin-test/page.tsx`,
`api/challenge/checkin/route.ts`, `api/admin/teilnahme/[teilnahmeId]/checkins/route.ts`,
`api/admin/users/route.ts`.

**Verifiziert:** Inhalts-Struktur/Sortierung per Skript exakt gegen die alte Konstante geprüft, dann
live im Browser (Test-Session) durch Dashboard, Wochenseite (inkl. "So geht's"-Popup), Check-in-Test
(Score exakt korrekt berechnet) und Admin-Übersicht (Score/Note/Aufgaben-Breakdown) geklickt —
alles identisch zum bisherigen Verhalten. `tsc`/Build sauber.

**Bewusst noch offen (Schritt 3):** Der `isStudioAdminFor()`-Helper + eigene Studio-Admin-Routes
sind noch nicht gebaut — aktuell sieht weiterhin nur der globale Masteradmin alles. Wird gebraucht,
sobald ein zweites Studio echten Zugriff braucht (Schritt 6).

### Schritt 5 — Affiliate-Ebene um Challenge-Typ ergänzen (optional, additiv)

`ALTER TABLE affiliate_links ADD COLUMN challenge_typ_id UUID REFERENCES challenge_typen(id);`
(nullable = für alle Typen nutzbar, wie bisher). Verhindert z.B., dass eine Rücken-Challenge
Barfußschuhe empfiehlt, nur weil `trigger_tags` zufällig matchen.

### Schritt 6 — Studio-Onboarding-Flow ✅ Kern umgesetzt (ohne Payment)

`/studio/registrierung` — öffentliche Registrierungsseite: Studioname, Challenge-Typ-Dropdown
(Longevity Lifestyle, **Rückenfit**, **Abnehmen** — die beiden neuen Typen sind reine
Datenbank-Platzhalter ohne Wocheninhalte, siehe Schritt 1), Ansprechpartner
(Vorname/Nachname/E-Mail/Telefon), Passwort, DSGVO-Einwilligung. Gleiches Bestätigungsmail-Muster
wie B2C (Resend statt Supabase-Standardmail, `lib/email.ts` `layout()` jetzt mit `brandLabel`-Parameter).

`POST /api/studio/registrierung` legt an: Auth-User für den Ansprechpartner, `profiles`-Zeile,
`studios`-Zeile (Slug mit Kollisionsauflösung), `studio_admins`-Verknüpfung (`rolle: 'inhaber'`),
`studio_challenge_typen`-Buchung des gewählten Typs. Login-Seite leitet Studio-Admins ohne eigene
Teilnahme jetzt zu `/challenge/admin` statt fälschlich zum Fragebogen.

**Bewusst nicht dabei bei der Registrierung selbst:** Payment/CopeCart (separates Vorhaben, offene
Preismodell-Frage siehe "Offene Fragen" oben). Ein Anmeldelink für Endkunden pro Durchgang fehlt
noch — siehe Schritt 6b.

**Verifiziert:** End-to-End gegen die Produktions-DB getestet (echte Registrierung mit
Rückenfit-Auswahl durchgespielt, alle Verknüpfungen korrekt, danach aufgeräumt).

### Schritt 6b — Challenge-Durchgänge anlegen ✅ umgesetzt

`/challenge/admin/durchgaenge`: Studio-Admin wählt Startdatum + Challenge-Typ (aus den fürs Studio
gebuchten), Dauer ist bewusst **fix 8 Wochen** (kein variables Feld — sonst Chaos mit den
Wocheninhalten, die pro Woche fest durchnummeriert sind). `POST/GET /api/studio/durchgaenge` legt
an bzw. listet bestehende Durchgänge. `getAdminScope()` (`lib/apiAuth.ts`) ermittelt jetzt immer
auch die Studio-Zugehörigkeit (auch für den Masteradmin, der z.B. gleichzeitig Studio-Admin von
Turnkiste ist) — nötig, damit er einen Durchgang für sein eigenes Studio anlegen kann.

**Sicherheitsfix im Zuge dessen:** `app/api/challenge/registrierung` + `onboarding` suchten bislang
global nach "irgendeiner offenen Challenge" ohne Studio-Filter. Sobald ein zweites Studio einen
eigenen offenen Durchgang anlegt, hätte das den B2C-Anmeldeflow kapern können. Beide Routen sind
jetzt bewusst auf Turnkiste beschränkt (`lib/studio.ts`).

**Verifiziert:** neuen Durchgang mit Startdatum 01.09.2026 angelegt, Enddatum korrekt auf
27.10.2026 berechnet (exakt 8 Wochen), danach wieder gelöscht.

**Noch offen:** ein Anmeldelink, den das Studio an seine Endkunden weitergeben kann, damit sich
diese gezielt für EINEN bestimmten Durchgang registrieren (aktuell landet jede B2C-Registrierung
nur bei Turnkiste, siehe Sicherheitsfix oben).

### Reihenfolge & Sicherheits-Leitplanke

1. ✅ Schritt 1+2 als reine additive Migrationen — umgesetzt, gegen die Produktions-DB angewendet
   und verifiziert (Backfill korrekt, `tsc`/Build weiterhin sauber, B2C-Challenge unverändert
   funktionsfähig — nichts liest die neuen Tabellen bisher).
2. ✅ Referenz-Studio "Turnkiste" angelegt (Migration `0018_turnkiste_studio.sql`) — Masteradmin ist
   Studio-Admin, bestehende Challenge ist Turnkiste zugeordnet. **Damit ist die "erst nach dem
   Launch"-Bremse für die Multi-Tenant-Grundstruktur aufgehoben:** neue B2C-Anmeldungen aus dem
   Newsletter landen automatisch als virtuelle Turnkiste-Mitglieder, die Struktur muss nicht mehr
   nachträglich eingezogen werden.
3. ✅ Content-Migration + Schritt 4 (Code-Cutover) — umgesetzt und end-to-end verifiziert (Details
   oben bei Schritt 4). `lib/challengeWeeks.ts` lädt jetzt aus der DB, Longevity-Inhalte liegen in
   den `challenge_typ_*`-Tabellen.
4. ✅ Schritt 3 (Studio-Admin-Rolle) — umgesetzt, Isolation gegen die Produktions-DB verifiziert
   (Details oben bei Schritt 3).
5. ✅ Schritt 6 (Kern) + 6b — umgesetzt und verifiziert (Details oben). Offen bleibt: Payment,
   Schritt 5 (Affiliate-Ebene pro Typ), Anmeldelink pro Durchgang für Endkunden, sowie als eigener
   Task vorgemerkt: Konto-Reaktivierung, Einladungslink-Versand,
   Mitglieder-Detailauswertung/Fortschrittsbalken für den Studio-Admin.
