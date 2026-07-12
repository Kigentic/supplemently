# Supplemently — Datenbank (Stage 1)

Nur DB-Struktur. Kein Frontend, keine Matching-Logik, kein Whitelabel-Import.

## Anwenden

```bash
supabase db reset            # lokal: Migration + seed.sql
# Prod:
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql
```

## Datenmodell

- **studios** — `id` (UUID) = zentraler Identifikationsschlüssel. `name` + `slug` unique → keine Verwechslung. `owner_id` optional.
- **supplements** — EINE globale Gesamtliste.
- **studio_supplements** — Join: welches Studio nutzt welches Supplement (Many-to-Many).
- **anbieter** — Hersteller/Whitelabel (Datenmodell vorbereitet, Feature später).
- **sessions** — Fragebogen-Durchläufe, `studio_id` = Referrer (nullable).
- **app_admins** — E-Mail-Allowlist für Masteradmin.

## Masteradmin

Supplements + Studio-Zuordnungen darf **nur** der Masteradmin schreiben (RLS via `is_master_admin()`, prüft `auth.jwt() ->> 'email'` gegen `app_admins`).

Aktuell geseedet: `fitnessstudioinhaber@gmail.com`. Ändern/ergänzen:

```sql
insert into public.app_admins (email) values ('andere@mail.de');
```

Der eigentliche Auth-User muss über Supabase Auth angelegt werden (nicht per SQL):

```bash
# via Supabase Admin-API (Service-Role-Key)
curl -X POST "$SUPABASE_URL/auth/v1/admin/users" \
  -H "apikey: $SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"fitnessstudioinhaber@gmail.com","password":"<stark>","email_confirm":true}'
```

Oder: Dashboard → Authentication → Add user. E-Mail muss mit `app_admins` übereinstimmen.
