import { supabase } from './supabase';
import { getAuthPhone, getAuthEmail } from './auth';

// Récupère l'ID de la boutique du vendeur authentifié (multi-tenancy)
export async function getActiveShopId(): Promise<string> {
  const sellerPhone = getAuthPhone();
  const sellerEmail = getAuthEmail();

  if (!sellerPhone && !sellerEmail) {
    throw new Error('Aucun utilisateur authentifié. Veuillez vous connecter.');
  }

  let query = supabase.from('shop_settings').select('id');

  if (sellerEmail) {
    query = query.eq('sellerEmail', sellerEmail);
  } else if (sellerPhone) {
    query = query.eq('sellerPhone', sellerPhone);
  }

  const { data, error } = await query.maybeSingle();

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
