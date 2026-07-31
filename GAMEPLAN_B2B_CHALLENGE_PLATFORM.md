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

## Nächster Schritt

Kein Code, keine Migration — dieses Dokument wartet auf grünes Licht. Wenn's losgehen soll: erst
Phase 1 (Datenmodell) einzeln planen, bevor irgendetwas an den bestehenden Challenge-Tabellen
angefasst wird.
