'use server';

import { createOrder as createOrderDb } from './orders';
import { verifyStockAvailability } from './products';
import { OrderInput } from './orders';
import { Order } from '@/types';
import { getMonerooAdapter } from './payment/moneroo';

/**
 * Crée une commande avec paiement simulé (pour compatibilité avec l'ancien flux)
 * DEPRECATED: Utilisez createOrderAndInitiatePayment pour les vrais paiements Moneroo
 */
export async function createOrderWithAutoDispatch(input: OrderInput): Promise<Order> {
  // 0. Vérification atomique du stock AVANT création de commande
  const itemsToVerify = input.items
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId as string,
      quantity: item.quantity,
    }));
  if (itemsToVerify.length > 0) {
    await verifyStockAvailability(itemsToVerify);
  }

  // 1. Crée la commande en base de données (le webhook Moneroo mettra à jour le statut)
  const order = await createOrderDb(input);

  return order;
}

/**
 * Crée une commande et lance une session de paiement réelle via Moneroo
 * Retourne l'URL de checkout vers laquelle rediriger l'acheteur
 */
export async function createOrderAndInitiatePayment(
  input: Omit<OrderInput, 'status' | 'paymentRef' | 'paidAt'> & {
    paymentProvider: 'wave' | 'orange_money';
  }
): Promise<{ order: Order; checkoutUrl: string }> {
  // 0. Vérification du stock
  const itemsToVerify = input.items
    .filter((item) => item.productId)
    .map((item) => ({
      productId: item.productId as string,
      quantity: item.quantity,
    }));
  if (itemsToVerify.length > 0) {
    await verifyStockAvailability(itemsToVerify);
  }

  // 1. Crée la commande en base (status = 'en_attente', jamais 'payee' tant que le webhook n'a pas confirmé)
  const order = await createOrderDb({
    ...input,
    status: 'en_attente',
    paymentRef: undefined, // Sera rempli après l'appel Moneroo
    paidAt: null,
  });

  // 2. Initie la session de paiement via Moneroo
  const moneroo = getMonerooAdapter();

  try {
    const paymentResult = await moneroo.createPayment({
      orderId: order.id,
      amount: order.total,
      customerPhone: order.customerPhone,
      method: input.paymentProvider,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${input.deliveryZone}/confirmation/${order.id}`, // TODO: slugifier la zone en URL
    });

    // 3. Met à jour la commande avec la référence de paiement Moneroo
    order.paymentRef = paymentResult.providerRef;
    const { error: updateError } = await (async () => {
      const { supabase } = await import('./supabase');
      return supabase
        .from('orders')
        .update({ paymentRef: paymentResult.providerRef })
        .eq('id', order.id);
    })();

    if (updateError) {
      throw new Error(`Erreur lors de la mise à jour de la référence de paiement: ${updateError.message}`);
    }

    return {
      order,
      checkoutUrl: paymentResult.checkoutUrl,
    };
  } catch (error) {
    // Supprime la commande en cas d'erreur de paiement
    await (async () => {
      const { supabase } = await import('./supabase');
      await supabase.from('orders').delete().eq('id', order.id);
    })();

    throw error;
  }
}
