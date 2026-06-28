import { createClient } from '@supabase/supabase-js';

// Client Supabase côté navigateur.
// Les variables doivent être préfixées NEXT_PUBLIC pour être exposées au client.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variables Supabase manquantes. Vérifiez NEXT_PUBLIC_SUPABASE_URL et " +
      "NEXT_PUBLIC_SUPABASE_ANON_KEY dans le fichier .env.local."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
