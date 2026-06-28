// État conservé en localStorage pour le prototype.
//
// Les produits, livreurs, commandes et paramètres boutique ont été migrés vers
// Supabase (voir src/lib/products.ts, couriers.ts, orders.ts, settings.ts).
// Il ne reste ici que l'auth / onboarding simulés (pas de vrai backend d'auth).

const isClient = () => typeof window !== 'undefined';

// --- AUTH (prototype : simulation, pas de vraie authentification) ---

// Mémorise le numéro de la vendeuse « connectée » après l'écran OTP.
export const setAuthenticated = (phone: string) => {
  if (!isClient()) return;
  localStorage.setItem('doole_auth_phone', phone);
};

// --- ONBOARDING ---

// Passe à true une fois la boutique configurée. Pilote la redirection après OTP
// (onboarding vs accueil).
export const isOnboarded = (): boolean => {
  if (!isClient()) return false;
  return localStorage.getItem('doole_onboarded') === 'true';
};

export const setOnboarded = (value: boolean) => {
  if (!isClient()) return;
  localStorage.setItem('doole_onboarded', value ? 'true' : 'false');
};

// Réinitialise l'état connexion/onboarding pour rejouer le parcours de démo.
// (Les données produits/commandes/livreurs/boutique vivent désormais dans Supabase.)
export const resetAllData = () => {
  if (!isClient()) return;
  localStorage.removeItem('doole_auth_phone');
  localStorage.removeItem('doole_onboarded');
};
