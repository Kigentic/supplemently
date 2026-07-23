-- Masteradmin-Flag: sieht/verwaltet alle Teilnehmer, umgeht die
-- Wochen-Freischaltung (kann jederzeit Check-ins machen).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ist_admin BOOLEAN NOT NULL DEFAULT false;

UPDATE public.profiles SET ist_admin = true WHERE email = 'fitnessstudioinhaber@gmail.com';
