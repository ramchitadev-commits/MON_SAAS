import { supabase } from './supabase';

// Récupère l'ID de la boutique actuelle (table mono-ligne)
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
