-- Supplemently — Landingpage: Lead-Erfassung.
-- Bewusst getrennt von studios (dort landen erst aktive/zahlende Studios, ab Stage 6).

create table public.interessenten (
  id              uuid primary key default gen_random_uuid(),
  studioname      text not null,
  ansprechpartner text not null,
  email           text not null,
  telefon         text,
  nachricht       text,
  created_at      timestamptz not null default now()
);

alter table public.interessenten enable row level security;

-- Oeffentliches Formular: anonyme Inserts erlaubt.
create policy "interessenten public insert"
  on public.interessenten for insert
  to anon, authenticated
  with check (true);

-- Lesen nur Masteradmin.
create policy "interessenten admin read"
  on public.interessenten for select
  to authenticated
  using (public.is_master_admin());
