import 'server-only';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Client Supabase avec clé service-role (côté serveur UNIQUEMENT)
// Utilisé pour : webhooks, Server Actions sensibles, opérations qui doivent bypass RLS
// JAMAIS à importer côté client (la garde 'server-only' le bloque)

export function createAdminSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Supabase service-role configuration missing. Ensure NEXT_PUBLIC_SUPABASE_URL ' +
      'and SUPABASE_SERVICE_ROLE_KEY are set in .env.local or Vercel.'
    );
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
