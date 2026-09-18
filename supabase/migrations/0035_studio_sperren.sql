-- Sperr-Mechanismus für Studios (Platform-Admin) und einzelne Teilnehmer.
-- "Sperren" eines Studios soll ALLE laufenden Teilnehmer aussperren (auch
-- bereits aktive), "Freischalten" stellt exakt den Zustand von davor wieder
-- her (status_vor_sperre) statt pauschal alles auf 'aktiv' zu setzen — sonst
-- würden z.B. noch nicht freigeschaltete Teilnehmer beim Entsperren
-- fälschlich aktiviert.

alter table public.studios
  add column if not exists gesperrt boolean not null default false;

-- Muss als eigenständiges Statement laufen (Postgres erlaubt keine Nutzung
-- eines frisch hinzugefügten Enum-Werts in derselben Transaktion, in der er
-- angelegt wurde) — diese Migration referenziert 'gesperrt' als Literal
-- bewusst nirgends.
alter type teilnahme_status add value if not exists 'gesperrt';

alter table public.challenge_teilnahmen
  add column if not exists status_vor_sperre teilnahme_status;
