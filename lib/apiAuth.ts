// Verifiziert den Bearer-Token einer Route Handler-Anfrage gegen Supabase Auth.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export async function getUserFromAuthHeader(req: Request) {
  const authHeader = req.headers.get('authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const anon = createClient(url, anonKey, { auth: { persistSession: false } });
  const { data, error } = await anon.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export interface AdminScope {
  isMasterAdmin: boolean;
  /** Studio-IDs, für die der User als studio_admins-Eintrag Zugriff hat (leer bei Masteradmin). */
  studioIds: string[];
}

/**
 * Ermittelt den Admin-Zugriff eines Users: globaler Masteradmin (profiles.ist_admin)
 * oder Studio-Admin für eine oder mehrere Studios (studio_admins-Tabelle), siehe
 * GAMEPLAN_B2B_CHALLENGE_PLATFORM.md Schritt 3. Masteradmin hat Vorrang und sieht alles.
 */
export async function getAdminScope(supabase: SupabaseClient, userId: string): Promise<AdminScope> {
  const { data: profile } = await supabase.from('profiles').select('ist_admin').eq('id', userId).maybeSingle();
  if (profile?.ist_admin) {
    return { isMasterAdmin: true, studioIds: [] };
  }

  const { data: rows } = await supabase.from('studio_admins').select('studio_id').eq('user_id', userId);
  return { isMasterAdmin: false, studioIds: (rows ?? []).map((r) => r.studio_id) };
}

export function hasAdminAccess(scope: AdminScope): boolean {
  return scope.isMasterAdmin || scope.studioIds.length > 0;
}
