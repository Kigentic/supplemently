-- Supplemently — Stage 1: Datenbankstruktur
-- Nur DB. Kein Frontend, keine Matching-Logik, kein Whitelabel-Import.

-- ============================================================
-- Extensions
-- ============================================================
create extension if not exists "pgcrypto";  -- gen_random_uuid()

-- ============================================================
-- Trigger-Funktion: updated_at automatisch pflegen
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Masteradmin-Allowlist
-- E-Mails hier drin = Masteradmin. Der User meldet sich per
-- Supabase Auth mit dieser E-Mail an -> RLS erkennt ihn.
-- (auth.users kann nicht sauber per SQL angelegt werden ->
--  Anlage via Supabase Dashboard / Admin-API, siehe README.)
-- ============================================================
create table public.app_admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- Helper: ist der aktuelle Request ein Masteradmin?
-- security definer -> darf app_admins trotz RLS lesen.
create or replace function public.is_master_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.app_admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ============================================================
-- Tabelle: anbieter (Hersteller / Whitelabel-Instanzen, spaeter)
-- ============================================================
create table public.anbieter (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  branding_config jsonb not null default '{}'::jsonb,  -- Logo-URL, Farben, etc.
  created_at      timestamptz not null default now()
);

-- ============================================================
-- Tabelle: studios
-- id = zentraler Identifikationsschluessel. slug unique
-- -> eindeutige Microsite, Studioname darf doppelt sein.
-- ============================================================
create table public.studios (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                     -- darf doppelt sein (z.B. Kette)
  slug          text not null unique,              -- Microsite-URL, eindeutig
  branding      jsonb not null default '{}'::jsonb, -- Logo, Farben
  voucher_text  text,                              -- z.B. "4 Wochen gratis trainieren"
  kontakt_email text,
  abo_status    text not null default 'trial'
                  check (abo_status in ('active','trial','cancelled')),
  owner_id      uuid references auth.users(id) on delete set null,  -- optionale Zusatzinfo
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- Tabelle: supplements  (EINE Gesamtliste, global)
-- ============================================================
create table public.supplements (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  kategorie            text,                       -- Vitamin, Mineralstoff, Fettsaeure, Kombipraeparat
  zielgruppe           text[] not null default array['alle']::text[],  -- maennlich/weiblich/divers/alle
  wirkung              text,
  dosierung_empfehlung text,
  kontraindikationen   text,
  evidenzlevel         int check (evidenzlevel between 1 and 5),
  ist_kombipraeparat   boolean not null default false,
  inhaltsstoffe        jsonb not null default '[]'::jsonb,  -- Wirkstoffe bei Kombipraeparaten
  affiliate_link       text,
  anbieter_id          uuid references public.anbieter(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ============================================================
-- Join: studio_supplements
-- Zuordnung "welches Studio nutzt welches Supplement".
-- Gesamtliste bleibt schlank, hier nur Verknuepfung.
-- ============================================================
create table public.studio_supplements (
  studio_id     uuid not null references public.studios(id)     on delete cascade,
  supplement_id uuid not null references public.supplements(id) on delete cascade,
  aktiv         boolean not null default true,
  created_at    timestamptz not null default now(),
  primary key (studio_id, supplement_id)
);

-- ============================================================
-- Tabelle: sessions (Fragebogen-Durchlaeufe)
-- ============================================================
create table public.sessions (
  id         uuid primary key default gen_random_uuid(),
  studio_id  uuid references public.studios(id) on delete set null,  -- Referrer, nullable bei Direkt-Traffic
  antworten  jsonb not null default '{}'::jsonb,   -- Fragebogen-Antworten
  ergebnis   jsonb not null default '{}'::jsonb,   -- berechnete Empfehlungen
  created_at timestamptz not null default now()
);

-- ============================================================
-- Indexe
-- ============================================================
create index idx_studios_slug             on public.studios (slug);
create index idx_supplements_anbieter     on public.supplements (anbieter_id);
create index idx_sessions_studio          on public.sessions (studio_id);
create index idx_studsupp_supplement      on public.studio_supplements (supplement_id);
create index idx_studsupp_studio          on public.studio_supplements (studio_id);

-- ============================================================
-- updated_at Trigger
-- ============================================================
create trigger trg_supplements_updated
  before update on public.supplements
  for each row execute function public.set_updated_at();

create trigger trg_studios_updated
  before update on public.studios
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.app_admins         enable row level security;
alter table public.anbieter           enable row level security;
alter table public.studios            enable row level security;
alter table public.supplements        enable row level security;
alter table public.studio_supplements enable row level security;
alter table public.sessions           enable row level security;

-- --- app_admins: kein Public-Zugriff. Nur Masteradmin liest. ---
create policy "app_admins admin read"
  on public.app_admins for select
  to authenticated
  using (public.is_master_admin());

-- --- anbieter: Public Read (Branding), Write nur Masteradmin ---
create policy "anbieter public read"
  on public.anbieter for select
  to anon, authenticated using (true);
create policy "anbieter admin write"
  on public.anbieter for all
  to authenticated
  using (public.is_master_admin())
  with check (public.is_master_admin());

-- --- studios: Public Read (Microsite per Slug) ---
create policy "studios public read"
  on public.studios for select
  to anon, authenticated using (true);
-- Masteradmin legt Studios an / verwaltet alle.
create policy "studios admin write"
  on public.studios for all
  to authenticated
  using (public.is_master_admin())
  with check (public.is_master_admin());
-- Studio-Owner darf eigene Zeile aktualisieren.
create policy "studios owner update"
  on public.studios for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- --- supplements: Public Read (Katalog), Write NUR Masteradmin ---
create policy "supplements public read"
  on public.supplements for select
  to anon, authenticated using (true);
create policy "supplements admin write"
  on public.supplements for all
  to authenticated
  using (public.is_master_admin())
  with check (public.is_master_admin());

-- --- studio_supplements: Public Read (Microsite), Write NUR Masteradmin ---
create policy "studsupp public read"
  on public.studio_supplements for select
  to anon, authenticated using (true);
create policy "studsupp admin write"
  on public.studio_supplements for all
  to authenticated
  using (public.is_master_admin())
  with check (public.is_master_admin());

-- --- sessions: anonyme Endkunden duerfen anlegen ---
create policy "sessions public insert"
  on public.sessions for insert
  to anon, authenticated
  with check (true);
-- Studios sehen nur ihre eigenen Sessions; Masteradmin sieht alle.
create policy "sessions studio read"
  on public.sessions for select
  to authenticated
  using (
    public.is_master_admin()
    or studio_id in (select id from public.studios where owner_id = auth.uid())
  );

-- ============================================================
-- Masteradmin seeden (E-Mail -> aendern falls andere Adresse)
-- ============================================================
insert into public.app_admins (email)
values ('fitnessstudioinhaber@gmail.com')
on conflict (email) do nothing;
