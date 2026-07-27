// Gestion de l'authentification et session utilisateur en production avec Supabase

const isClient = () => typeof window !== 'undefined';

// Stocke les données de session utilisateur en sessionStorage (remplace localStorage pour la sécurité)
export const setAuthSession = (phone: string, email?: string) => {
  if (!isClient()) return;
  sessionStorage.setItem('doole_auth_phone', phone);
  if (email) sessionStorage.setItem('doole_auth_email', email);
};

export const getAuthPhone = (): string | null => {
  if (!isClient()) return null;
  return sessionStorage.getItem('doole_auth_phone');
};

export const getAuthEmail = (): string | null => {
  if (!isClient()) return null;
  return sessionStorage.getItem('doole_auth_email');
};

export const getAuthIdentifier = (): string | null => {
  // Préfère l'email s'il existe, sinon le téléphone
  return getAuthEmail() || getAuthPhone();
};

export const clearAuthSession = () => {
  if (!isClient()) return;
  sessionStorage.removeItem('doole_auth_phone');
  sessionStorage.removeItem('doole_auth_email');
};

export const isAuthenticated = (): boolean => {
  return getAuthPhone() !== null || getAuthEmail() !== null;
};
