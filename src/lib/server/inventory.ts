import 'server-only';

import { adminDb } from './db';

type Reserved = { productId: string; quantity: number };

// Décrémente le stock seulement si la valeur lue n'a pas changé entre-temps.
export async function reserveStock(
  items: Array<{ productId: string; quantity: number; stock: number | null; name: string }>
): Promise<void> {
  const reserved: Reserved[] = [];

  try {
    for (const item of items) {
      if (item.stock === null) continue;
      if (item.stock < item.quantity) {
        throw new Error(`Stock insuffisant pour « ${item.name} ».`);
      }

      const next = item.stock - item.quantity;
      const { data, error } = await adminDb()
        .from('products')
        .update({ stock: next })
        .eq('id', item.productId)
        .eq('stock', item.stock)
        .select('id');

      if (error || !data || data.length === 0) {
        throw new Error(`Stock insuffisant pour « ${item.name} ».`);
      }
      reserved.push({ productId: item.productId, quantity: item.quantity });
    }
  } catch (err) {
    await releaseStock(reserved);
    throw err;
  }
}

export async function releaseStock(items: Reserved[]): Promise<void> {
  for (const item of items) {
    const { data, error } = await adminDb()
      .from('products')
      .select('stock')
      .eq('id', item.productId)
      .maybeSingle();

    if (error || !data || data.stock === null) continue;

    const next = (data.stock as number) + item.quantity;
    await adminDb()
      .from('products')
      .update({ stock: next })
      .eq('id', item.productId)
      .eq('stock', data.stock);
  }
}
