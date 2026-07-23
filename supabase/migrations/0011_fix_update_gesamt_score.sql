-- Fix: update_gesamt_score() setzte updated_at, obwohl challenge_teilnahmen
-- diese Spalte nie hatte (Bug aus Migration 0008, fiel erst beim ersten
-- echten Aufruf über den Wochen-Check-in auf).

CREATE OR REPLACE FUNCTION public.update_gesamt_score(p_teilnahme_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.challenge_teilnahmen
  SET gesamt_score = (
    SELECT COALESCE(SUM(score_woche), 0)
    FROM public.wochencheckins
    WHERE teilnahme_id = p_teilnahme_id
  ) + (
    SELECT COALESCE(SUM(b.punkte_bonus), 0)
    FROM public.user_badges ub
    JOIN public.badge_definitionen b ON b.id = ub.badge_id
    WHERE ub.teilnahme_id = p_teilnahme_id
  )
  WHERE id = p_teilnahme_id;
END;
$$;
