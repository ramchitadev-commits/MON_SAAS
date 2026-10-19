'use server';

import { randomBytes } from 'crypto';
import { z } from 'zod';
import { Order } from '@/types';
import { adminDb } from './server/db';
import { shopBySlug } from './server/access';
import { releaseAbandonedOrders } from './server/abandoned';
import { releaseStock, reserveStock } from './server/inventory';
import { feeForZone } from './delivery-zones';
import { checkOrderLimit } from './subscriptions';
import { getMonerooAdapter } from './payment/moneroo';
import { publicEnv } from './env';

const checkoutSchema = z.object({
  shopSlug: z.string().trim().min(1),
  customerName: z.string().trim().min(1, 'Le nom du client est obligatoire.'),
  customerPhone: z.string().regex(/^\+221\d{9}$/, 'Numéro de téléphone invalide.'),
  deliveryZone: z.string().trim().min(1),
  deliveryAddress: z.string().trim().min(1, "L'adresse de livraison est obligatoire."),
  deliveryNote: z.string().nullable().optional(),
  gpsLocation: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
  paymentProvider: z.enum(['wave', 'orange_money']),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export async function createOrderAndInitiatePayment(
  input: CheckoutInput
): Promise<{ order: Order; checkoutUrl: string }> {
  const parsed = checkoutSchema.parse(input);
  const shop = await shopBySlug(parsed.shopSlug);
  if (!shop) throw new Error('Boutique introuvable.');
  await releaseAbandonedOrders(shop.id);

  const deliveryFee = feeForZone(parsed.deliveryZone);
  if (deliveryFee === null) throw new Error('Zone de livraison inconnue.');

  await checkOrderLimit(shop.id);

  const quantities = new Map<string, number>();
  for (const item of parsed.items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }

  const { data: products, error: productsError } = await adminDb()
    .from('products')
    .select('id, name, price, stock, isAvailable')
    .eq('shopId', shop.id)
    .in('id', [...quantities.keys()]);

  if (productsError) {
    console.error('[checkout] produits', productsError.message);
    throw new Error('Vérification du panier impossible.');
  }

  const byId = new Map((products ?? []).map((product) => [product.id as string, product]));
  const lines: Array<{ productId: string; name: string; unitPrice: number; quantity: number; stock: number | null }> = [];

  for (const [productId, quantity] of quantities) {
    const product = byId.get(productId);
    if (!product || !product.isAvailable) throw new Error('Un article du panier n’est plus disponible.');
    lines.push({
      productId,
      name: product.name as string,
      unitPrice: product.price as number,
      quantity,
      stock: product.stock as number | null,
    });
  }

  await reserveStock(lines);

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const total = subtotal + deliveryFee;
  const db = adminDb();
  let orderId: string | null = null;

  try {
    const { data: orderRow, error: orderError } = await db
      .from('orders')
      .insert({
        shopId: shop.id,
        customerName: parsed.customerName,
        customerPhone: parsed.customerPhone,
        deliveryZone: parsed.deliveryZone,
        deliveryAddress: parsed.deliveryAddress,
        deliveryNote: parsed.deliveryNote || null,
        gpsLocation: parsed.gpsLocation || null,
        deliveryDate: parsed.deliveryDate || null,
        subtotal,
        deliveryFee,
        total,
        status: 'en_attente',
        paymentProvider: parsed.paymentProvider,
        trackingToken: randomBytes(24).toString('hex'),
      })
      .select()
      .single();

    if (orderError || !orderRow) {
      console.error('[checkout] commande', orderError?.message);
      throw new Error('Création de la commande échouée.');
    }

    orderId = orderRow.id as string;
    const { error: itemsError } = await db.from('order_items').insert(
      lines.map((line) => ({
        orderId,
        productId: line.productId,
        name: line.name,
        unitPrice: line.unitPrice,
        quantity: line.quantity,
      }))
    );
    if (itemsError) {
      console.error('[checkout] lignes', itemsError.message);
      throw new Error('Enregistrement des articles échoué.');
    }

    const moneroo = getMonerooAdapter();
    const payment = await moneroo.createPayment({
      orderId,
      amount: total,
      customerPhone: parsed.customerPhone,
      customerName: parsed.customerName,
      method: parsed.paymentProvider,
      returnUrl: `${publicEnv.APP_URL}/${parsed.shopSlug}/confirmation/${orderId}`,
    });

    const { error: updateError } = await db
      .from('orders')
      .update({ paymentRef: payment.providerRef })
      .eq('id', orderId);
    if (updateError) {
      console.error('[checkout] référence', updateError.message);
      throw new Error('Paiement non démarré.');
    }

    const { data: created, error: reloadError } = await db
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .single();
    if (reloadError || !created) throw new Error('Commande introuvable après création.');

    return { order: created as Order, checkoutUrl: payment.checkoutUrl };
  } catch (err) {
    if (orderId) {
      await db.from('orders').delete().eq('id', orderId);
    }
    await releaseStock(lines.map((line) => ({ productId: line.productId, quantity: line.quantity })));
    throw err instanceof Error ? err : new Error('Création de la commande échouée.');
  }
}
