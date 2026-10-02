/**
 * Configuration centralisée des variables d'environnement.
 * Validée au démarrage de l'application.
 * À utiliser plutôt que d'accéder directement à process.env
 */

// Variables PUBLIQUES (exposées au client, safe de partager)
export const publicEnv = {
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

// Variables PRIVÉES (côté serveur uniquement)
export const privateEnv = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  MONEROO_API_KEY: process.env.MONEROO_API_KEY || '',
  MONEROO_WEBHOOK_SECRET: process.env.MONEROO_WEBHOOK_SECRET || '',
  BREVO_API_KEY: process.env.BREVO_API_KEY || '',
  BREVO_SMS_SENDER: process.env.BREVO_SMS_SENDER || 'Doole',
} as const;

// Énumération des variables obligatoires
const REQUIRED_PUBLIC_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
] as const;

const REQUIRED_PRIVATE_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'MONEROO_API_KEY',
  'MONEROO_WEBHOOK_SECRET',
  'BREVO_API_KEY',
] as const;

/**
 * Valide la configuration au démarrage.
 * Appelée dans le middleware ou une route root.
 * NE LANCE PAS D'ERREUR - affiche juste des warnings
 */
export function validateEnv(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifie les variables publiques
  REQUIRED_PUBLIC_VARS.forEach((varName) => {
    const envKey = `NEXT_PUBLIC_${varName.replace('NEXT_PUBLIC_', '')}`;
    const value = process.env[envKey];
    if (!value || value.trim() === '') {
      errors.push(`❌ ${envKey} manquante ou vide`);
    }
  });

  // Vérifie les variables privées (côté serveur seulement)
  if (typeof window === 'undefined') {
    REQUIRED_PRIVATE_VARS.forEach((varName) => {
      const value = process.env[varName];
      if (!value || value.trim() === '') {
        errors.push(`❌ ${varName} manquante ou vide (serveur seulement)`);
      }
    });
  }

  if (errors.length > 0) {
    console.warn(
      '\n⚠️  AVERTISSEMENT - VARIABLES D\'ENVIRONNEMENT MANQUANTES:\n',
      errors.join('\n'),
      '\n\nL\'app fonctionnera partiellement. Certaines fonctionnalités peuvent échouer.\n' +
      'Vérifiez votre fichier .env.local ou configurez les variables sur Vercel.\n'
    );
  } else {
    console.log('✅ Configuration environnement validée avec succès.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Vérifie qu'une variable publique spécifique est définie.
 * Utile pour les checks conditionnels en Client Components.
 */
export function hasPublicEnv(key: keyof typeof publicEnv): boolean {
  return Boolean(publicEnv[key] && publicEnv[key].trim() !== '');
}

/**
 * Récupère une variable privée de manière sûre (serveur uniquement).
 * Lève une erreur claire si appelée côté client.
 */
export function getPrivateEnv(key: keyof typeof privateEnv): string {
  if (typeof window !== 'undefined') {
    throw new Error(
      `❌ Impossible d'accéder à des variables privées côté client: ${key}`
    );
  }
  return privateEnv[key];
}
