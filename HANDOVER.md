# Supplemently — Projekt-Handover

**Stand:** Juli 2026 · **Commits:** 18 · **Branch:** `main`

---

## Was ist Supplemently?

B2B SaaS für Fitnessstudios. Das Studio bettet einen personalisierten Supplement-Check ein — Mitglieder beantworten 20+ Fragen, bekommen eine ranked Empfehlungsliste mit Begründung pro Supplement. Das Studio verdient an Produktverkäufen (CopeCart-Integration geplant).

---

## Tech Stack

| Schicht | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Sprache | TypeScript 5.7 (strict) |
| Styling | Tailwind CSS v4 mit CSS Custom Properties |
| Datenbank | Supabase (PostgreSQL) |
| Auth | Supabase (noch nicht implementiert) |
| Deployment | GitHub → Vercel (noch nicht verbunden) |
| React | React 19 |

### Design-System (CSS-Variablen)
```
bg-bg, bg-surface, text-text, text-text-muted
text-accent, bg-accent, bg-accent-hover, text-on-accent
border-outline
```

---

## Projektstruktur

```
app/
  page.tsx                          — Landingpage
  layout.tsx                        — Root Layout + Fonts
  fragebogen/page.tsx               — 7-Schritt-Wizard (Client Component)
  ergebnis/[sessionId]/page.tsx     — Ergebnisseite (Client Component)
  admin/tiers/page.tsx              — Temporäres Tier-Klassifizierungs-Tool
  api/
    match/route.ts                  — POST: Scoring + Session speichern
    session/[sessionId]/route.ts    — GET: Session für Ergebnisseite laden
    interessent/route.ts            — POST: Interessenten-Registrierung
    admin/tiers/route.ts            — GET/POST: Tier-Verwaltung
  _components/
    SiteHeader.tsx
    SiteFooter.tsx
    RegistrierungForm.tsx

lib/
  matching.ts                       — Scoring-Engine (rule-based, kein LLM)
  questions.ts                      — Fragen, Typen, Validierung
  supabaseServer.ts                 — Service-Role-Client (server-only)
  disclaimer.ts                     — Disclaimer-Text

supabase/migrations/
  0001_init.sql                     — supplements + sessions Tabellen
  0002_interessenten.sql            — interessenten Tabelle
  0003_neue_supplements.sql         — Ergänzungen
  0004_supplement_matrix.sql        — 98-Supplement-Matrix (TRUNCATE + INSERT)
  0005_remove_omega_6_7_9.sql       — Omega-6/7/9 gelöscht
  0006_add_tier_column.sql          — tier-Spalte (⚠ noch manuell anzuwenden)

scripts/
  fixtures.ts                       — Offline-Fixtures für Tests
  test-matching.ts                  — Matching-Logik offline testen
```

---

## Datenbank (Supabase)

### Tabelle: `supplements`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | z.B. "Vitamin D3" |
| `kategorie` | text | Vitamin / Mineral / Aminosäuren / ... |
| `tier` | text | `basis` / `advanced` / `addon` ⚠ noch anzulegen |
| `zielgruppe` | text[] | `['alle']` oder `['weiblich']` etc. |
| `wirkung` | text | Freitext-Wirkungsbeschreibung |
| `bevorzugte_form` | text | z.B. "Bisglycinat für Verträglichkeit; alternativ Oxid" |
| `kombinationen` | text[] | Synergistisch wirkende Supplements |
| `dosierung_empfehlung` | text | |
| `kontraindikationen` | text | |
| `evidenzlevel` | int | 1–5 |
| `ist_kombipraeparat` | bool | |
| `inhaltsstoffe` | jsonb | Array `[{name, menge_mg}]` |

**98 Supplements** in 15 Kategorien: Vitamin, Mineral, Aminosäuren, Antioxidantien, Adaptogen, Fettsäuren, Kognition, Darm, Longevity, Energie, Glucose, Gelenke, Pilze, Pflanzenstoffe, Protein, Kombipräparat

### Tabelle: `sessions`

| Spalte | Typ | Beschreibung |
|---|---|---|
| `id` | uuid | PK |
| `studio_id` | uuid | FK → studios (nullable) |
| `antworten` | jsonb | Komplette Answers-Objekt |
| `ergebnis` | jsonb | MatchResult mit essenziell + optional |
| `created_at` | timestamptz | |

### Tabelle: `interessenten`

Leads von der Landingpage-Registrierung (Studio-Name, E-Mail, Telefon).

---

## Fragebogen — 7 Schritte, 24 Fragen

| Schritt | Titel | Fragen |
|---|---|---|
| 1 | Persönliche Daten | Geschlecht, Alter, Größe*, Gewicht*, Körperform* |
| 2 | Training | Trainingslevel, Trainingsziel |
| 3 | Ernährung | Ernährungsstil, Restriktionen, Kochverhalten, Mahlzeiten/Tag, Auswärts essen, Alkohol, Raucher |
| 4 | Schlaf | Schlafdauer, Aufwachgefühl, Durchschlafen |
| 5 | Stress & Mental | Stresslevel, Entspannung, Gedanken abschalten |
| 6 | Symptome | Verdauung/Blähungen, Heißhunger |
| 7 | Medikamente & Supplements | Medikamente (Multi-Select), aktuelle Supplements |

*Pflichtfelder (Größe, Gewicht, Körperform = nicht optional)

**Letzter Schritt:** Pflicht-Checkbox "Kein Ersatz für ärztliche Beratung" vor Submit.

---

## Matching-Engine (`lib/matching.ts`)

Rein rule-based — **kein LLM**.

- Lädt alle 98 Supplements aus der DB
- Filtert nach Zielgruppe (geschlecht)
- Filtert bereits eingenommene Supplements raus
- ~60+ Scoring-Regeln: jede Antwort-Kombination gibt Punkte
- Schwellen: `THRESHOLD_ESSENZIELL = 3.0`, `THRESHOLD_OPTIONAL = 1.5`
- Limits: `MAX_ESSENZIELL = 7`, `MAX_OPTIONAL = 3` → max 10 Empfehlungen
- Gibt `Empfehlung[]` zurück mit: name, score, begruendung, dosierung, bevorzugte_form

**Aktueller Output-Shape:**
```ts
interface MatchResult {
  essenziell: Empfehlung[];   // Score ≥ 3.0
  optional: Empfehlung[];     // Score ≥ 1.5
  disclaimer: string;
  meta: { total_scored, schwellen }
}
```

**Geplant (nächster Schritt):** Umbau auf 3 Tiers → `basis`, `advanced`, `addon` je nach `tier`-Spalte in der DB.

---

## Ergebnisseite

- Client Component, lädt via `GET /api/session/:id`
- Zeigt personalisierte Insights (bis 3 Sätze) basierend auf Antworten
- Ranked Liste: Priorität: Hoch (orange Badge) + Ergänzend (grau)
- Pro Karte: Rank-Nummer, Name, Begründung, Empfohlene Form
- Disclaimer-Box unten
- "Neuen Check starten" Link

---

## Offene Aufgaben (Roadmap)

### Unmittelbar nächste Schritte

1. **Tier-Spalte anlegen** — SQL im Supabase Dashboard ausführen:
   ```sql
   ALTER TABLE public.supplements
     ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'addon'
     CHECK (tier IN ('basis', 'advanced', 'addon'));
   ```
2. **Tiers klassifizieren** — `/admin/tiers` aufrufen, Radio-Buttons setzen, speichern
3. **Matching auf 3 Tiers umbauen** — `MatchResult` auf `{ basis, advanced, addon }` umstellen
4. **Ergebnisseite: 3 Sektionen** — Basis / Advanced / Add-on mit eigener Optik

### Mittelfristig

- **Vercel verbinden** — GitHub Repo `Kigentic/supplemently` in Vercel importieren + 3 Env-Vars setzen
- **Studio-Auth** — Supabase Auth + RLS für Multi-Tenant (Studio sieht nur eigene Sessions)
- **Admin-Backend** — Sessions pro Studio, Conversion-Tracking
- **Payment** — CopeCart-Integration für Produktlinks in der Ergebnisseite

### Später

- Impressum / Datenschutz (aktuell Platzhalter-Links)
- Omega-6-Scoring-Bug: `is(supp, 'omega')` matcht auch Omega-6 — substring-Check schärfen

---

## Env-Variablen (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://okhrbbkoiobpxtloljcq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   ← NIEMALS client-seitig verwenden
```

Für Vercel-Deployment: alle 3 unter **Settings → Environment Variables** eintragen.

---

## Lokale Entwicklung

```bash
npm install
npm run dev          # localhost:3000
npm run test:match   # Matching offline testen (gegen fixtures)
npx tsc --noEmit     # TypeScript-Check
```

---

## Sicherheit

- `SUPABASE_SERVICE_ROLE_KEY` nur in `lib/supabaseServer.ts` — nie in Client-Komponenten
- `.env.local` in `.gitignore`
- Alle API-Routes validieren Input via `validateAnswers()` bevor DB-Zugriff
- `router.push()` außerhalb von try-catch (Next.js 15 Concurrent-Feature-Bug-Fix)
