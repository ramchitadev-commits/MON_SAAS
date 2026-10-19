import 'server-only';

import { requireSellerPhone } from '../session';
import { adminDb } from './db';

export async function requireShopId(): Promise<string> {
  const phone = await requireSellerPhone();
  const { data, error } = await adminDb()
    .from('shop_settings')
    .select('id')
    .eq('sellerPhone', phone)
    .maybeSingle();

  if (error) {
    console.error('[shop] lecture impossible', error.message);
    throw new Error('Chargement de la boutique impossible.');
  }
  if (!data) throw new Error("Aucune boutique créée. Complétez d'abord l'onboarding.");
  return data.id as string;
}

export async function shopBySlug(slug: string): Promise<{ id: string } | null> {
  const { data, error } = await adminDb()
    .from('shop_settings')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (error) {
    console.error('[shop] slug illisible', error.message);
    throw new Error('Boutique introuvable.');
  }
  return data ? { id: data.id as string } : null;
}
