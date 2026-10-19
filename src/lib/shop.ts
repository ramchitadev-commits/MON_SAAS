import 'server-only';

import { requireShopId, shopBySlug } from './server/access';

export async function getActiveShopId(): Promise<string> {
  return requireShopId();
}

export async function getShopIdBySlug(slug: string): Promise<string> {
  const shop = await shopBySlug(slug);
  if (!shop) throw new Error(`Aucune boutique avec le slug "${slug}"`);
  return shop.id;
}
