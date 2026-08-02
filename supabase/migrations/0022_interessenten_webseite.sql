-- Neues Feld für die B2B-Partneranfrage auf der neuen Startseite.
ALTER TABLE public.interessenten ADD COLUMN IF NOT EXISTS webseite TEXT;
