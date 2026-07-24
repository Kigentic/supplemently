-- Klick-Tracking für Affiliate-Empfehlungen: atomarer Zähler-Increment,
-- analog zum bestehenden update_gesamt_score()-Muster.

CREATE OR REPLACE FUNCTION public.increment_affiliate_klicks(p_affiliate_link_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.affiliate_links
  SET klicks = klicks + 1, updated_at = now()
  WHERE id = p_affiliate_link_id;
END;
$$;
