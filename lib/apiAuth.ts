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
  /**
   * Studio-IDs, für die der User einen studio_admins-Eintrag hat — wird IMMER
   * ermittelt, auch für den Masteradmin (der z.B. gleichzeitig echter
   * Studio-Admin von Turnkiste sein kann). Beim Filtern von Teilnehmerdaten
   * hat `isMasterAdmin` trotzdem Vorrang (sieht alles, unabhängig von
   * studioIds) — studioIds wird dort gebraucht, wo der Masteradmin konkret
   * "als sein eigenes Studio" handelt (z.B. einen neuen Challenge-Durchgang
   * anlegen).
   */
  studioIds: string[];
}

/**
 * Ermittelt den Admin-Zugriff eines Users: globaler Masteradmin (profiles.ist_admin)
 * und/oder Studio-Admin für eine oder mehrere Studios (studio_admins-Tabelle), siehe
 * GAMEPLAN_B2B_CHALLENGE_PLATFORM.md Schritt 3. Masteradmin hat beim Datenzugriff
 * Vorrang und sieht alles, unabhängig von studioIds.
 */
export async function getAdminScope(supabase: SupabaseClient, userId: string): Promise<AdminScope> {
  const [{ data: profile }, { data: rows }] = await Promise.all([
    supabase.from('profiles').select('ist_admin').eq('id', userId).maybeSingle(),
    supabase.from('studio_admins').select('studio_id').eq('user_id', userId),
  ]);

  return {
    isMasterAdmin: !!profile?.ist_admin,
    studioIds: (rows ?? []).map((r) => r.studio_id),
  };
}

export function hasAdminAccess(scope: AdminScope): boolean {
  return scope.isMasterAdmin || scope.studioIds.length > 0;
}
