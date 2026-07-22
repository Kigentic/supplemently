# Longevity Lifestyle Challenge — Gameplan

**Stand:** Juli 2026 · **Status:** Konzeptphase

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
