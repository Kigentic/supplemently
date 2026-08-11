-- email_log.empfaenger_id referenzierte profiles(id) ohne ON DELETE CASCADE
-- (wie schon empfehlungen_log/user_badges/testimonials in 0028 — die Tabelle
-- war bis jetzt einfach nie genutzt, daher fiel es nicht auf). Jetzt, wo die
-- Reminder-Cron sie aktiv befüllt, würde jedes Löschen eines Users mit
-- geloggten Reminder-Mails an der FK scheitern.

ALTER TABLE public.email_log
  DROP CONSTRAINT email_log_empfaenger_id_fkey,
  ADD CONSTRAINT email_log_empfaenger_id_fkey
    FOREIGN KEY (empfaenger_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
