// Browser-seitiger Supabase-Client (Anon Key). Nur für Auth-Flows im Client.
import { createClient } from '@supabase/supabase-js';

let _client: ReturnType<typeof createClient> | null = null;

export function getBrowserClient() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase ENV-Variablen fehlen.');
  _client = createClient(url, key);
  return _client;
}
