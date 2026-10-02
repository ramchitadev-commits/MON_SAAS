import 'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { publicEnv, privateEnv } from '../env';

// Client Supabase avec clé service-role (côté serveur UNIQUEMENT)
// Utilisé pour : webhooks, Server Actions sensibles, opérations qui doivent bypass RLS
// JAMAIS à importer côté client (la garde 'server-only' le bloque)

export function createAdminSupabaseClient(): SupabaseClient {
  const supabaseUrl = publicEnv.SUPABASE_URL;
  const serviceRoleKey = privateEnv.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      '❌ Configuration Supabase service-role manquante.\n' +
      'Vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.'
    );
    // Retourne un proxy qui lance une erreur si utilisé
    return new Proxy({} as SupabaseClient, {
      get() {
        throw new Error('Supabase service-role non configuré');
      },
    });
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

// Export un singleton pour les opérations serveur
let adminInstance: SupabaseClient | null = null;

export function getAdminSupabaseClient(): SupabaseClient {
  if (!adminInstance) {
    adminInstance = createAdminSupabaseClient();
  }
  return adminInstance;
}
