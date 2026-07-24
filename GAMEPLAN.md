# Longevity Lifestyle Challenge — Gameplan

**Stand:** Juli 2026 · **Status:** Konzeptphase (Kapitel 1–10) + **implementierter Kern** (Kapitel 11)

> Kapitel 1–10 sind der ursprüngliche Plan. Kapitel 11 dokumentiert, was davon inzwischen tatsächlich gebaut ist — teils abweichend vom Plan (z.B. Check-in-Modell, Habit-Katalog statt generischem Aufgaben-Katalog). Bei Widerspruch gilt Kapitel 11 als aktueller Stand.

---

## Vision

B2C Endkunden-Challenge rund um Longevity & Lifestyle. Teilnehmer durchlaufen eine geführte X-Wochen-Challenge mit Wochen-Aufgaben, Self-Tracking, Community-Score und personalisierten Supplement-Empfehlungen über Affiliate-Links. Monetarisierung über Affiliate + optionale Paywall.

---

## Dauer

**8 Wochen.** Festes Start- und Enddatum. Challenge läuft in Kohorten (immer wieder neu buchbar).

---

## Komponenten im Überblick

```
Registrierung → Onboarding-Fragebogen → Woche 1
  → Montagsmail (Aufgaben) → Freitagsfragebogen (Check-in)
  → Score-Update → Empfehlungen + Affiliate-Links
  → ... × 8-10 Wochen → Finale Auswertung → Sieger
```

---

## 1. Registrierung & User-Account

### Pflichtfelder
- Vorname, Nachname
- E-Mail-Adresse
- Handynummer (optional: für WhatsApp-Notifications)
- Passwort (E-Mail + Passwort Login)
- Bestätigungsmail mit Verifizierungslink

### Optionale Paywall
- Einmalig **9,90 €** für Challenge-Zugang
- Payment: **CopeCart** (vorbereitet, aber im MVP deaktiviert — erst zum Launch aktivieren)
- Für Testzwecke läuft die Challenge ohne Zahlung durch

### Einladungsfunktion
- Nach Registrierung: "Lade Freunde ein"-Screen
- Generierter persönlicher Invite-Link mit Referral-Code
- Share via:
  - WhatsApp-Button (vorgefertigter Text + Link)
  - E-Mail-Button
  - Link kopieren
- Referral-Tracking: wer hat wen eingeladen (für spätere Gamification)

### Technisch
- Supabase Auth (E-Mail + Passwort) — bereits im Stack
- RLS: User sieht nur eigene Daten
- `users`-Tabelle mit Profildaten
- `challenge_teilnahmen`-Tabelle (User ↔ Challenge-Kohorte)

---

## 2. Onboarding-Fragebogen

Erweiterung des bestehenden Supplemently-Fragebogens (24 Fragen, 7 Schritte) um Baseline-Messung:

### Neue Baseline-Felder
- Aktuelles Gewicht (bereits vorhanden)
- Körperfettanteil (Schätzung: schlank/normal/untersetzt) (bereits vorhanden)
- Energie-Level subjektiv (1–10 Skala)
- Schlafqualität subjektiv (1–10)
- Stress-Level subjektiv (1–10)
- Sport-Einheiten pro Woche aktuell
- Schrittzahl täglich (Schätzung)
- Hauptmotivation für die Challenge (Freitext oder Kategorien)

→ Diese Baseline wird am Ende der Challenge mit den Endwerten verglichen für die persönliche Transformation-Story.

---

## 3. Wochen-Struktur

### Montag: Aufgaben-Mail
Jede Woche neue Aufgaben aus 5 Kategorien:

| Kategorie | Beispiele |
|---|---|
| **Bewegung** | X.000 Schritte/Tag · 3× Workout · 2× Kardio 20 min |
| **Ernährung** | Kein Zucker 5 Tage · 2L Wasser täglich · Meal Prep Sonntag |
| **Schlaf** | 7h Minimum · Kein Handy 30 min vor Schlaf |
| **Stress & Mental** | 5 min Atemübung täglich · Journaling · Digitale Detox |
| **Supplements** | Diese Woche: X ausprobieren (Affiliate-Link) |

### Aufgaben-Plan (Beispiel 10 Wochen)
*(Detaillierter Plan folgt — Aufgaben steigern sich in Intensität)*
- Wochen 1–2: Fundament legen (Basics, Gewohnheiten)
- Wochen 3–5: Intensivierung (mehr Sport, Ernährungsumstellung)
- Wochen 6–8: Optimierung (Schlaf, Mental, Supplements)
- Wochen 9–10: Consolidierung + Finale

### Freitag/Sonntag: Check-in Fragebogen
Kurz, max. 10 Fragen:
- Aufgaben-Compliance (Hast du X gemacht? Ja/Nein/Teilweise)
- Befindlichkeit-Updates:
  - Energie-Level diese Woche (1–10)
  - Schlafqualität (1–10)
  - Verdauung verbessert? (besser/gleich/schlechter)
  - Training gesteigert? (ja/nein)
  - Heißhunger-Attacken? (weniger/gleich/mehr)
  - Stimmung allgemein (1–10)
- Freitext: Was war dein größter Erfolg diese Woche?

---

## 4. Scoring-System

### Punkte pro Woche
| Aktion | Punkte |
|---|---|
| Check-in ausgefüllt | +10 |
| Aufgabe vollständig erfüllt | +20 |
| Aufgabe teilweise erfüllt | +10 |
| Einladung angenommen (Referral) | +25 |
| Befindlichkeit verbessert (Energie/Schlaf/etc.) | +5 je Kategorie |
| Streak: 2 Wochen in Folge alles | +30 Bonus |

### Gesamt-Score
- Max. ~350 Punkte/Woche × 8 Wochen = ~2.800 Punkte
- **Kein öffentliches Leaderboard** (DSGVO + unnötig komplex)
- Stattdessen: **fiktive Positionierung** — "Du bist diese Woche unter den Top 10 aller Teilnehmer" als motivierender Text, ohne echte Rankings zu veröffentlichen
- Finale Sieger: Preis TBD (evtl. Prozis-Gutschein)

---

## 5. Personalisierte Auswertung

### Wöchentlich (nach Check-in)
- Score diese Woche + Gesamtscore
- Empfehlungen basierend auf Antworten:
  - Supplement-Empfehlung mit Affiliate-Link (z.B. Magnesium bei Schlafproblemen)
  - Produkt-Empfehlung (z.B. BlackRoll bei Muskelverspannungen)
  - Content-Empfehlung (Artikel, Video)
- Als Screen UND als Mail

### Am Ende der Challenge (Woche 10)
- Vollständige Transformation-Story: Baseline vs. jetzt
- Top-Empfehlungen für danach (Supplement-Stack)
- Leaderboard + Sieger-Bekanntgabe

---

## 6. Affiliate & Monetarisierung

### Affiliate-Partner (geplant)
- **Supplement-Hersteller** (TBD) — Hauptpartner, Produkt-Empfehlungen weekly
- **BlackRoll** — Regeneration (Faszienrolle, Kissen etc.)
- Weitere: Sportnahrung, Wearables, Schlaf-Gadgets

### Link-Mechanik
- Antwortspezifische Empfehlung: If schlecht_geschlafen → Magnesiumglycinat + Affiliate-Link
- Wöchentliche Featured Product in der Montagsmail
- Finale Auswertung: kompletter personalisierter Stack mit Links

### Umsatz-Modell
1. **Paywall**: 9,90 € Einmalbeitrag pro Challenge-Kohorte
2. **Affiliate Commission**: % auf jeden Kauf über die Links
3. **Sponsor-Sichtbarkeit**: Partner-Logo in Mails + Challenge-Seite

---

## 7. E-Mail-Flows (Automatisierung)

| Trigger | Mail |
|---|---|
| Registrierung | Welcome + Bestätigungslink |
| Bestätigung | Onboarding-Start: Fragebogen ausfüllen |
| Montag jede Woche | Wochenaufgaben + Motivations-Push |
| Freitag jede Woche | Check-in Reminder: "Füll deinen Fragebogen aus" |
| Nach Check-in | Auswertung + Empfehlungen + Score |
| Nicht ausgefüllt nach 48h | Reminder-Mail |
| Challenge-Ende | Finale Auswertung + Gewinner + "Was jetzt?" |
| Einladung verschickt | Einladungsmail an Freund |

**Technologie:** Resend (passt zu Next.js/Supabase-Stack) oder Brevo

---

## 8. Tech-Stack Erweiterungen

| Was | Technologie |
|---|---|
| Auth (E-Mail + PW) | Supabase Auth — bereits geplant |
| E-Mail-Versand | Resend.com (oder Brevo) |
| Payment | Stripe oder CopeCart |
| Cron Jobs (Montags-/Freitags-Mails) | Vercel Cron oder Supabase Edge Functions |
| Leaderboard | Supabase Realtime oder einfaches Polling |
| Referral-Tracking | Eigene Logik in Supabase |

### Neue DB-Tabellen (geplant)
```
users                    — Profil + Auth-Daten
challenges               — Challenge-Kohorten (Start, Ende, Name)
challenge_teilnahmen     — User ↔ Challenge, Score
wochen_aufgaben          — Aufgaben pro Woche (fix, wiederverwendbar)
wochencheckins           — Antworten des Freitags-Fragebogens
empfehlungen_log         — Welche Affiliate-Links dem User gezeigt wurden
referrals                — Wer hat wen eingeladen
```

---

## 9. Entscheidungen (getroffen)

| Frage | Entscheidung |
|---|---|
| Challenge-Dauer | **8 Wochen** |
| Paywall | **CopeCart, 9,90 €** — vorbereitet, im MVP deaktiviert |
| Max. Teilnehmer pro Kohorte | **Unbegrenzt** (vorerst) |
| Leaderboard | **Gestrichen** (DSGVO) — fiktive Top-10-Meldung stattdessen |
| Preise für Sieger | TBD — evtl. Prozis-Gutschein |
| Supplement-Hauptpartner | **Prozis** (in Planung) |
| E-Mail-Tool | **Resend** |
| Wochenaufgaben-Katalog | Muss ausgearbeitet werden (8 Wochen × 5 Kategorien) |

---

## 10. Feature-Entscheidungen

| Feature | Status | Notiz |
|---|---|---|
| Foto-Tracking | **Raus** | — |
| Abschluss-Testimonial | **Drin** | Nach Woche 8: Bewertung + Statement einholen. Verifizierbar weil echte Teilnahme nachweisbar → Social Proof |
| Buddy-System | **Drin (opt-in)** | Schalter im Registrierungsflow: "Möchtest du einen Buddy?" Extrabelohnung wenn beide Check-in machen |
| Streak-Mechanik | **Drin** | Wer alle 8 Wochen ohne Lücke — Bonus-Punkte am Ende |
| Woche 1 Gratification | **Drin** | Direkt nach Onboarding: personalisierter Supplement-Stack (bestehende Supplemently-Logik) als sofortiger Mehrwert |
| DSGVO | **Pflicht** | Explizites Opt-in für Affiliate-Empfehlungen + E-Mail-Marketing im Registrierungsflow. Double opt-in für Mailingliste. |
| Kündigung/Pause | **Klar** | Wer raus ist, ist raus. Score bleibt eingefroren, kein Re-join in laufende Kohorte |
| Öffentliche Landingpage | **Drin** | Pro Kohorte: "Challenge #X startet am [Datum]" + Pre-Register-Button. Einladungslinks landen hier |
| Push-Notifications | **Später** | MVP ohne. WhatsApp via Twilio/360dialog als nächster Schritt |
| Gamification-Badges | **Vorbereiten** | DB-Struktur anlegen, aber UI später. Achievements: "Erster Check-in", "4 Wochen Streak", "3 Einladungen" |
| Wochenaufgaben-KI | **Mittelfristig** | Aufgaben adaptiv nach Check-in personalisieren. Erst wenn Basis steht |

---

## Nächste Schritte (Priorität)

1. [ ] Wochenaufgaben-Katalog ausarbeiten (8 Wochen × 5 Kategorien)
2. [ ] DB-Schema: `users`, `challenges`, `challenge_teilnahmen`, `wochen_aufgaben`, `wochencheckins`, `referrals`, `badges` (Supabase Migration)
3. [ ] Registrierungsflow bauen — Supabase Auth + Formular (inkl. DSGVO-Opt-in + Buddy-Schalter)
4. [ ] Öffentliche Challenge-Landingpage mit Pre-Register
5. [ ] Onboarding-Fragebogen (bestehender Supplemently-Flow erweitern um Baseline-Felder)
6. [ ] Resend einbinden: Welcome-Mail + Bestätigungsmail
7. [ ] Wöchentlicher Check-in-Fragebogen (Freitagsflow)
8. [ ] Scoring-Engine + fiktive Top-10-Meldung
9. [ ] CopeCart-Integration (vorbereiten, deaktiviert lassen)
10. [ ] Abschluss-Flow: Testimonial-Seite + finale Auswertungsmail

---

## 11. Implementierter Stand (tatsächliches Schema)

Migrationen `0008`–`0012` in `supabase/migrations/`. Weicht in 2 Punkten vom ursprünglichen Plan (Kap. 3–4) ab: **8 Wochen fix** (kein 9–10-Wochen-Fall), und das Check-in-Modell ist ein **Habit-Ampelsystem** statt Einzel-Befindlichkeitsfragen + generischem Aufgaben-Katalog.

### 11.1 DB-Tabellen (Migration `0008_challenge_platform.sql`)

```
profiles                — erweitert auth.users: Vorname/Nachname/E-Mail, DSGVO-Opt-ins,
                           Buddy-System (buddy_gewuenscht, buddy_partner_id), ist_admin (0012)
challenges               — Kohorten: slug, start_datum, end_datum, wochen_anzahl (fix 8),
                           ist_aktiv/ist_offen, paywall_aktiv, preis_cent
challenge_teilnahmen     — User↔Challenge, status (pre_registered/aktiv/abgeschlossen/abgebrochen),
                           gesamt_score, onboarding_antworten (JSONB), baseline_*/end_*-Felder,
                           referral_code, eingeladen_von
referrals                — Einladungs-Tracking: geklickt_at/registriert_at/bezahlt_at, punkte_gutgeschrieben
wochen_aufgaben          — generischer Aufgaben-Katalog (Kategorie-Enum, Punkte) — angelegt,
                           aber NICHT genutzt; die tatsächlichen Wochenaufgaben leben in lib/challengeWeeks.ts
wochencheckins           — 1 Zeile pro Teilnahme+Woche (UNIQUE teilnahme_id+woche):
                           wohlbefinden (1-10), schwierigkeit (1-10), habit_status (JSONB),
                           erfolg_freitext, score_woche
checkin_aufgaben         — generische Compliance-Tabelle — angelegt, aber NICHT genutzt
                           (habit_status-JSONB in wochencheckins übernimmt diese Rolle)
supplement_empfehlungen  — Snapshot der Matching-Engine-Ausgabe pro Teilnahme
affiliate_links          — Partner/Produkt/Kategorie, trigger_tags[], woche-Targeting, Klick-Zähler
empfehlungen_log         — welcher Affiliate-Link wem wann gezeigt/geklickt wurde
badge_definitionen        — 6 geseedete Badges (erster_checkin, streak_4, streak_8, drei_einladungen,
                           buddy_beide, woche1_komplett)
user_badges               — vergebene Badges pro Teilnahme
testimonials              — Sterne, Statement, Veröffentlichungs-Opt-in, verifiziert-Flag
email_log                 — Resend-Versand-Tracking pro Typ/Woche
```

Alle Tabellen RLS-geschützt: User sieht nur eigene Zeilen (`auth.uid() = user_id` bzw. per Join über `teilnahme_id`), Service-Role umgeht RLS für Cron/Admin-Schreibzugriffe.

### 11.2 Check-in-Modell (Migration `0010_checkin_ampelsystem.sql`, ersetzt Plan aus Kap. 3)

Statt der ursprünglich geplanten Einzelfragen (Energie/Schlaf/Verdauung/Training/Heißhunger/Stimmung je 1-10 oder besser/gleich/schlechter) nutzt der gebaute Check-in ein **Ampelsystem pro Habit**:

- `wochencheckins.habit_status` (JSONB): Key `w{woche}_h{index}` (z.B. `w3_h1`) → `gruen` (komplett) / `gelb` (teilweise) / `rot` (gar nicht)
- Zusätzlich zwei generische 1–10-Skalen: `wohlbefinden`, `schwierigkeit`
- `erfolg_freitext` (optional)
- **Carry-forward:** jeder Check-in ab Woche 2 zeigt und bewertet alle Habits von Woche 1 bis zur aktuellen Woche (`habitsUpTo()` in `lib/challengeWeeks.ts`) — alte Gewohnheiten bleiben dauerhaft im Check-in aktiv, nicht nur die der laufenden Woche
- Serverseitig validiert (`app/api/challenge/checkin/route.ts`): erwartete Keys werden aus `habitsUpTo(woche)` berechnet, fremde/unerwartete Keys werden verworfen, jede erwartete Ampel ist Pflicht

### 11.3 Wochenaufgaben-Katalog (tatsächliche Quelle: `lib/challengeWeeks.ts`, nicht `wochen_aufgaben`-Tabelle)

8 Wochen, je 2–6 Habits mit Titel + `why`-Begründungstext (angezeigt auf `/challenge/woche/[num]`):

| Woche | Theme | Kern-Habits |
|---|---|---|
| 1 | Fundament | KI-Fragebogen ausfüllen, Ernährungs-App-Setup (kein Tracking-Anspruch), Body-Check (Baseline: Fotos/Maße/Gewicht), 2,5 L Wasser, Tagesschritte-Baseline |
| 2 | Gesunde Ernährung | Neues Rezept/Woche (läuft ab hier durch), optionale externe Kalorien-App (klar als optional markiert), **Trainings-Einstieg: 1× Kraft/Woche**, 20–30g Protein/Mahlzeit, 1 Vollwertkost-Tausch/Tag, Sonntags-Meal-Prep |
| 3 | Bewegung & Mobility | 8.000 Schritte/Tag, 10 Min. Mobility täglich (Training läuft aus Woche 2 weiter, keine eigene neue Trainings-Vorgabe) |
| 4 | Schlaf & Regeneration | feste Schlafzeit, Bildschirm-Sperrstunde, Abendroutine, Schlafqualitäts-Notiz im Handy (statt App-Tracking), **Trainings-Stufe 2: +1× Cardio/Woche** |
| 5 | Stressmanagement | Atemübung morgens, handyfreie Morgen-Minuten, wöchentlicher Offline-Abend, Supplement-Selbstcheck |
| 6 | Verdauung & Darmgesundheit | fermentierte Lebensmittel, langsam essen, Ballaststoffziel ~30g/Tag (ohne App-Tracking-Anspruch), Warmwasser+Zitrone-Ritual, **Trainings-Stufe 3: 2× Kraft + 1× Cardio/Woche** |
| 7 | Level Up | KI-Fragebogen erneut (Empfehlung anpassen), Body-Check-Wiederholung (Vergleich zur Woche-1-Baseline) |
| 8 | Dein neues Normal | Habit-Audit, Vorher/Nachher-Ergebnisse, Langzeit-Supplementplan, nächste 8 Wochen planen |

**Trainings-Stufenplan** (kein eigenes DB-Feld, läuft implizit über die obigen Habit-Texte): Woche 2–3 → 1× Kraft. Woche 4–5 → 1× Kraft + 1× Cardio. Woche 6–7 → 2× Kraft + 1× Cardio. Mobility/Stretching und Atemübungen unverändert ab Einführung.

**Wichtig — Ernährungs-App im Produkt ist Rezept-/Meal-Planner, kein Tracker.** Kann keine Kalorien, Makros oder Schlafqualität erfassen; alle Habit-Texte, die das fälschlich unterstellten ("in der App tracken"), wurden entfernt/umformuliert.

### 11.4 Scoring (tatsächliche Formel, `app/api/challenge/checkin/route.ts`) — ersetzt Punktetabelle aus Kap. 4

```
score_woche = 10 (Basispunkte fürs Einreichen)
            + Σ über alle erwarteten Habit-Keys (Woche 1..aktuell, carry-forward):
                gruen (komplett)   → +20
                gelb  (teilweise)  → +10
                rot   (gar nicht)  → +0
```

- Kein separates Streak-Bonus-Feld aktiv genutzt (Spalte `streak_bonus` existiert, wird aktuell nicht befüllt)
- Kein Referral-Punkte-Handling aktiv verdrahtet (Tabelle `referrals` + `punkte_gutgeschrieben`-Flag existieren, aber keine API setzt sie)
- `gesamt_score` der Teilnahme wird nach jedem Check-in per RPC `update_gesamt_score(p_teilnahme_id)` neu berechnet: Summe aller `score_woche` + Summe der Bonuspunkte vergebener Badges (`0011_fix_update_gesamt_score.sql` behebt einen Bug in dieser Funktion)
- Da `habitsUpTo()` mit jeder Woche mehr Habits akkumuliert, steigt das maximal erreichbare Wochen-Score mit fortschreitender Challenge (Woche 1: 5 Habits × 20 + 10 = 110 max; Woche 8: alle ~29 Habits × 20 + 10 ≈ 590 max) — bewusst kein fixes Punktedeckel wie im ursprünglichen Plan.

### 11.5 Wochen-Freischaltung (`lib/challengeSchedule.ts`)

- Neue Woche startet kalenderfest am Montag (unabhängig vom exakten Registrierungs-Wochentag), berechnet aus `challenge.start_datum`
- Check-in für die laufende Woche erst ab Sonntag freigeschaltet (`checkinUnlocked`)
- `currentWeek` wird auf `[1, wochen_anzahl]` geclampt
- **Masteradmin-Ausnahme** (`ist_admin`-Flag, `0012_masteradmin.sql`): umgeht Datums-Gate komplett, serverseitig in der Checkin-API durchgesetzt — kann jede Woche jederzeit einchecken. Genutzt für die Admin-Testseite `/challenge/admin/checkin-test`

### 11.6 Gebaute Seiten/Routen (Ist-Stand, ergänzt Kap. 8 Tech-Stack)

```
app/challenge/
  registrierung/, bestaetigung/, login/     — Auth-Flow
  dashboard/                                — Wochen-Übersicht (2-Spalten-Grid, Akkordeon)
  woche/[num]/                              — Detailseite "Warum diese Aufgaben?"
  checkin/                                  — echter wöchentlicher Check-in
  admin/                                    — Masteradmin-Übersicht aller User + Teilnahmen
  admin/checkin-test/                       — alle Wochen-Check-ins ohne Datums-Gate durchklicken
  ernaehrungsapp/                           — verlinkte Rezept-/Meal-Planner-Seite

app/api/challenge/
  registrierung/route.ts
  onboarding/route.ts
  checkin/route.ts                          — Scoring-Logik, siehe 11.4

app/api/admin/users/route.ts                — Masteradmin: alle User + neueste Teilnahme + Score
```

### 11.7 Noch nicht gebaut (aus Kap. 1–10 weiterhin offen)

- Registrierungs-Einladungsfunktion (Referral-Link-UI, WhatsApp/E-Mail-Share) — DB-Feld `referral_code` existiert, kein UI
- E-Mail-Flows (Resend-Anbindung, alle Trigger aus Kap. 7)
- Payment/CopeCart-Integration
- Badge-Vergabe-Logik (Tabellen + Seed vorhanden, kein Trigger/Cron, der sie tatsächlich vergibt)
- Testimonial-Flow nach Woche 8
- Buddy-System-UI (nur DB-Feld)

---

## 12. Affiliate-Touchpoints (implementiert)

Die `affiliate_links`-Tabelle ist mit 12 echten Partnerprodukten befüllt (Centa-Star, Vivobarefoot,
BlackROLL, feels.like — Migration `0013_affiliate_links_seed.sql`) inkl. Rabattcodes pro Partner
(Spalte `rabattcode`, Migration `0014_affiliate_links_rabattcode.sql`): BlackROLL `TURNKISTE-10`,
feels.like `PKTRAINING`, Vivobarefoot `VIVOFOREVER`, Centa-Star `PK10`. Supplement-Partner sind noch
in Verhandlung, kommen später separat dazu.

Matching-Logik in `lib/affiliateMatching.ts` — schlanker als `lib/matching.ts` (kein
Score-Threshold-System, Top-1/2-Auswahl per Tag-Überschneidung). **3 Touchpoints, nicht zwingend
dasselbe Produkt pro Touchpoint:**

### 12.1 Touchpoint 1 — nach dem Onboarding-Fragebogen

Neue Seite `/challenge/empfehlung` — der Fragebogen leitet nach dem Challenge-Onboarding (POST
`/api/challenge/onboarding`) dorthin statt direkt zur Ernährungs-App. Die API berechnet beim
Absenden `matchForOnboarding()` aus den Fragebogen-Antworten (Schlaf/Stress/Training/Gelenke →
Tags) und loggt das Ergebnis in `empfehlungen_log` (Kontext `onboarding`). Die Seite selbst liest
über `GET /api/challenge/empfehlung` die geloggten Einträge zurück (kein Neu-Berechnen bei jedem
Aufruf — stabile Empfehlung). Bewusst getrennt von der bestehenden Supplement-Matching-Analyse
(`lib/matching.ts`) gehalten, Integration beider folgt später.

### 12.2 Touchpoint 2 — Wochenseite zum jeweiligen Thema

`/challenge/woche/[num]` lädt über `GET /api/challenge/woche/[num]/empfehlung` das zur Woche
passende Produkt (`matchForWeek()`, filtert auf `affiliate_links.woche`, Fallback auf
wochenunabhängige Produkte). Loggt nur einmal pro Teilnahme+Woche in `empfehlungen_log`
(Kontext `wochenemail`), kein Spam bei wiederholtem Aufruf.

### 12.3 Touchpoint 3 — nach dem Wochen-Check-in (Auswertung)

`POST /api/challenge/checkin` berechnet zusätzlich zum Score `matchForCheckin()` aus Woche +
Wohlbefinden + Schwierigkeit (schlechtes Wohlbefinden → Regeneration/Schlaf-Produkte, hohes
Wohlbefinden + niedrige Schwierigkeit → Trainings-Produkte als Belohnung) und gibt die Treffer in
der Response zurück (`affiliate_empfehlungen`). Die Check-in-Seite zeigt sie direkt in der
Erfolgsansicht neben dem Score. Loggt in `empfehlungen_log` (Kontext `checkin_auswertung`).

### Gemeinsame Komponente

`app/_components/AffiliateProductCard.tsx` — Partner, Produktname, Beschreibung, Link-Button,
Rabattcode-Badge. Wird an allen 3 Touchpoints wiederverwendet.

### 12.4 Klick-Tracking + Statistik (implementiert)

`AffiliateProductCard` verlinkt nicht mehr direkt auf die Partner-URL, sondern auf
`/api/challenge/klick/[empfehlungLogId]` — ein Redirect-Endpoint (öffentlich, keyed über die
unratbare `empfehlungen_log`-UUID), der beim ersten Klick `geklickt_at` setzt, den Zähler
`affiliate_links.klicks` per RPC `increment_affiliate_klicks()` (Migration
`0015_affiliate_klick_tracking.sql`) atomar erhöht und dann zur echten Produkt-URL weiterleitet.
Wiederholte Klicks auf denselben Log-Eintrag zählen nicht doppelt.

Masteradmin-Statistikseite `/challenge/admin/affiliate-stats` (+ `GET /api/admin/affiliate-stats`):
Gezeigt vs. geklickt pro Produkt (CTR) und pro Touchpoint (`onboarding`/`wochenemail`/
`checkin_auswertung`), verlinkt von der Haupt-Admin-Seite.

### Noch offen

- Integration mit der Supplement-Matching-Analyse (Touchpoint 1) — bewusst verschoben
- Supplement-Partner-Produkte fehlen noch (Verhandlung läuft), kommen als weitere `affiliate_links`-Zeilen
