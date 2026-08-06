-- Fix: einige Tabellen aus 0008 referenzieren challenge_teilnahmen(id) ohne
-- ON DELETE CASCADE (empfehlungen_log, user_badges, testimonials). Das
-- verhinderte das Löschen eines Users (auth.users → profiles → CASCADE →
-- challenge_teilnahmen bricht mit Foreign-Key-Verletzung ab, sobald einer
-- dieser drei Sätze existiert). Konstistent mit den anderen
-- teilnahme_id-Referenzen (wochencheckins, empfehlungslink) auf CASCADE
-- umstellen.

ALTER TABLE public.empfehlungen_log
  DROP CONSTRAINT empfehlungen_log_teilnahme_id_fkey,
  ADD CONSTRAINT empfehlungen_log_teilnahme_id_fkey
    FOREIGN KEY (teilnahme_id) REFERENCES public.challenge_teilnahmen(id) ON DELETE CASCADE;

ALTER TABLE public.user_badges
  DROP CONSTRAINT user_badges_teilnahme_id_fkey,
  ADD CONSTRAINT user_badges_teilnahme_id_fkey
    FOREIGN KEY (teilnahme_id) REFERENCES public.challenge_teilnahmen(id) ON DELETE CASCADE;

ALTER TABLE public.testimonials
  DROP CONSTRAINT testimonials_teilnahme_id_fkey,
  ADD CONSTRAINT testimonials_teilnahme_id_fkey
    FOREIGN KEY (teilnahme_id) REFERENCES public.challenge_teilnahmen(id) ON DELETE CASCADE;
