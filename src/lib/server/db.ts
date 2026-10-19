import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { getAdminSupabaseClient } from '../supabase/admin';

export function adminDb(): SupabaseClient {
  return getAdminSupabaseClient();
}
