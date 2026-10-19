import 'server-only';

import { isAbandonedOrder } from '../abandoned-orders';
import { adminDb } from './db';
import { releaseStock } from './inventory';

// Annule les paiements jamais confirmés et rend le stock.
export async function releaseAbandonedOrders(shopId: string): Promise<void> {
  const { data, error } = await adminDb()
    .from('orders')
    .select('id, createdAt, items:order_items(productId, quantity)')
    .eq('shopId', shopId)
    .eq('status', 'en_attente')
    .order('createdAt', { ascending: true })
    .limit(20);

  if (error) {
    console.error('[orders] abandon', error.message);
    return;
  }

  for (const row of data ?? []) {
    if (!isAbandonedOrder(row.createdAt as string)) continue;

    const { data: cancelled, error: updateError } = await adminDb()
      .from('orders')
      .update({ status: 'annulee' })
      .eq('id', row.id)
      .eq('status', 'en_attente')
      .select('id')
      .maybeSingle();

    if (updateError || !cancelled) continue;

    const items = ((row.items ?? []) as Array<{ productId: string | null; quantity: number }>)
      .filter((item) => item.productId)
      .map((item) => ({ productId: item.productId as string, quantity: item.quantity }));
    await releaseStock(items);
  }
}
