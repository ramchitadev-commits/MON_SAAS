import { supabase } from './supabase';

// Récupère l'ID de la boutique actuelle (table mono-ligne)
// Utilisé côté admin/seller (contexte authentifié)
export async function getActiveShopId(): Promise<string> {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('id')
    .order('createdAt', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Chargement de la boutique impossible : ${error.message}`);
  if (!data) throw new Error('Aucune boutique créée. Complétez d\'abord l\'onboarding.');
  return data.id;
}

// Récupère l'ID de la boutique à partir du slug (storefront publique)
export async function getShopIdBySlug(slug: string): Promise<string> {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Boutique non trouvée : ${error.message}`);
  if (!data) throw new Error(`Aucune boutique avec le slug "${slug}"`);
  return data.id;
}
