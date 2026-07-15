import { createClient } from '@supabase/supabase-js';

// Client Supabase côté navigateur (initialisation paresseuse pour éviter les erreurs de build).
// Les variables doivent être préfixées NEXT_PUBLIC pour être exposées au client.
// Ce fichier s'exécute lors du build, mais on ne crée le client que lors du premier accès côté client.

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function initializeSupabase() {
  // Initialisation paresseuse : ne valide les variables que lors du premier accès au client
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Variables Supabase manquantes. Vérifiez NEXT_PUBLIC_SUPABASE_URL et " +
          "NEXT_PUBLIC_SUPABASE_ANON_KEY dans le fichier .env.local."
      );
      // Retourne un proxy qui lance une erreur si on essaie d'utiliser le client
      return new Proxy({}, {
        get() {
          throw new Error(
            "Variables Supabase manquantes. Vérifiez NEXT_PUBLIC_SUPABASE_URL et " +
              "NEXT_PUBLIC_SUPABASE_ANON_KEY dans le fichier .env.local."
          );
        },
      });
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
}

// Export un lazy-getter pour l'accès au client
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    const client = initializeSupabase();
    return (client as any)[prop];
  },
});
