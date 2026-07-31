-- Plan B: Turnkiste als "Referenz-Studio" anlegen — löst das Henne-Ei-Problem
-- "Multi-Tenant erst nach dem B2C-Launch anfassen", indem die laufende
-- Longevity-Challenge rückwirkend einem echten Studio zugeordnet wird, statt
-- studio_id für immer NULL zu lassen. Sicher, weil aktuell nur 1 Teilnahme
-- existiert (der Masteradmin-Testaccount selbst) — keine echten B2C-Kunden
-- betroffen. Der Newsletter-Launch bekommt B2C-Kunden künftig direkt als
-- "virtuelle Mitglieder" von Turnkiste.

INSERT INTO public.studios (name, slug, kontakt_email, abo_status)
VALUES ('Turnkiste', 'turnkiste', 'fitnessstudioinhaber@gmail.com', 'active');

INSERT INTO public.studio_admins (studio_id, user_id, rolle)
VALUES (
  (SELECT id FROM public.studios WHERE slug = 'turnkiste'),
  '476f129b-f9fd-4cc6-952a-2bb6386be1aa',  -- fitnessstudioinhaber@gmail.com (Masteradmin)
  'inhaber'
);

INSERT INTO public.studio_challenge_typen (studio_id, challenge_typ_id)
VALUES (
  (SELECT id FROM public.studios WHERE slug = 'turnkiste'),
  (SELECT id FROM public.challenge_typen WHERE slug = 'longevity-lifestyle')
);

-- Bestehende (einzige) Challenge-Kohorte rückwirkend Turnkiste zuordnen.
UPDATE public.challenges
SET studio_id = (SELECT id FROM public.studios WHERE slug = 'turnkiste')
WHERE studio_id IS NULL;
