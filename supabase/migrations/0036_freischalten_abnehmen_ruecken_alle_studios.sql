-- Abnehmen- und Rückenfit-Challenge für ALLE Studios buchen/freischalten
-- (studio_challenge_typen), damit jedes Studio (bestehend und künftig neu
-- registriert) diese Challenge-Typen sofort in seinem Dashboard anlegen kann
-- (app/api/studio/durchgaenge prüft genau diese Tabelle vor dem Erstellen
-- eines Durchgangs). Longevity war bisher nur für Turnkiste gebucht.

insert into public.studio_challenge_typen (studio_id, challenge_typ_id)
select s.id, ct.id
from public.studios s
cross join public.challenge_typen ct
where ct.slug in ('abnehmen', 'ruecken-fit')
on conflict (studio_id, challenge_typ_id) do nothing;
