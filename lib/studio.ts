// Hilfsfunktionen rund um Studios — siehe GAMEPLAN_B2B_CHALLENGE_PLATFORM.md.
import type { SupabaseClient } from '@supabase/supabase-js';

/** Das Referenz-Studio, dem die bestehende B2C-Longevity-Challenge zugeordnet ist. */
export const TURNKISTE_STUDIO_SLUG = 'turnkiste';

export async function getStudioIdBySlug(supabase: SupabaseClient, slug: string): Promise<string | null> {
  const { data } = await supabase.from('studios').select('id').eq('slug', slug).maybeSingle();
  return data?.id ?? null;
}
