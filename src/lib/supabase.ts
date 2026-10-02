import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { publicEnv } from './env';

// Client Supabase côté navigateur (initialisation paresseuse).
// Utilise publicEnv pour accéder aux variables validées.

let supabaseInstance: SupabaseClient | null = null;

function initializeSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = publicEnv;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error(
        '❌ Variables Supabase manquantes: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseInstance;
}

// Export un lazy-getter pour l'accès au client
export const supabase = new Proxy({} as SupabaseClient, {
  get: (_target, prop) => {
    const client = initializeSupabase();
    return Reflect.get(client, prop);
  },
});
