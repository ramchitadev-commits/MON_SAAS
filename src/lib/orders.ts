'use server';

import { Order, OrderStatus } from '@/types';
import { adminDb } from './server/db';
import { requireShopId, shopBySlug } from './server/access';
import { releaseAbandonedOrders } from './server/abandoned';
import { releaseStock } from './server/inventory';

const ORDERS = 'orders';
const SELECT_WITH_ITEMS = '*, items:order_items(*)';

const SELLER_STATUSES: OrderStatus[] = ['a_envoyer', 'en_route', 'livre', 'annulee'];

async function loadSellerOrder(id: string, shopId: string): Promise<Order | null> {
  const { data, error } = await adminDb()
    .from(ORDERS)
    .select(SELECT_WITH_ITEMS)
    .eq('id', id)
    .eq('shopId', shopId)
    .maybeSingle();

  if (error) {
    console.error('[orders] lecture', error.message);
    throw new Error('Commande introuvable.');
  }
  return (data as Order | null) ?? null;
}

export async function getOrders(): Promise<Order[]> {
  const shopId = await requireShopId();
  await releaseAbandonedOrders(shopId);
  const { data, error } = await adminDb()
    .from(ORDERS)
    .select(SELECT_WITH_ITEMS)
    .eq('shopId', shopId)
    .order('createdAt', { ascending: false });

  if (error) {
    console.error('[orders] liste', error.message);
    throw new Error('Chargement des commandes impossible.');
  }
  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const shopId = await requireShopId();
  return loadSellerOrder(id, shopId);
}

export async function getPublicOrder(orderId: string, slug: string): Promise<Order | null> {
  const shop = await shopBySlug(slug);
  if (!shop) return null;

  const { data, error } = await adminDb()
    .from(ORDERS)
    .select(SELECT_WITH_ITEMS)
    .eq('id', orderId)
    .eq('shopId', shop.id)
    .maybeSingle();

  if (error) {
    console.error('[orders] confirmation', error.message);
    throw new Error('Commande introuvable.');
  }
  return (data as Order | null) ?? null;
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const view = await getTrackingOrder(token);
  return view?.order ?? null;
}

export async function getTrackingOrder(
  token: string
): Promise<{ order: Order; courier: { name: string; phone: string } | null } | null> {
  const { data, error } = await adminDb()
    .from(ORDERS)
    .select(SELECT_WITH_ITEMS)
    .eq('trackingToken', token)
    .maybeSingle();

  if (error) {
    console.error('[orders] suivi', error.message);
    throw new Error('Suivi de commande introuvable.');
  }
  if (!data) return null;

  const order = data as Order;
  if (!order.courierId) return { order, courier: null };

  const { data: courier } = await adminDb()
    .from('couriers')
    .select('name, phone')
    .eq('id', order.courierId)
    .maybeSingle();

  return {
    order,
    courier: courier ? { name: courier.name as string, phone: courier.phone as string } : null,
  };
}

export async function countActiveOrders(): Promise<number> {
  const shopId = await requireShopId();
  const { count, error } = await adminDb()
    .from(ORDERS)
    .select('id', { count: 'exact', head: true })
    .eq('shopId', shopId)
    .in('status', ['payee', 'en_attente']);

  if (error) {
    console.error('[orders] compteur', error.message);
    throw new Error('Comptage des commandes impossible.');
  }
  return count ?? 0;
}

export async function updateOrder(order: Order): Promise<Order> {
  const shopId = await requireShopId();
  const existing = await loadSellerOrder(order.id, shopId);
  if (!existing) throw new Error('Commande introuvable.');

  if (order.status !== existing.status && !SELLER_STATUSES.includes(order.status)) {
    throw new Error('Ce changement de statut n’est pas autorisé.');
  }
  if (existing.status === 'en_attente' && order.status !== existing.status && order.status !== 'annulee') {
    throw new Error('La commande doit être payée avant expédition.');
  }

  let courierId = order.courierId ?? null;
  if (courierId) {
    const { data: courier, error } = await adminDb()
      .from('couriers')
      .select('id')
      .eq('id', courierId)
      .eq('shopId', shopId)
      .maybeSingle();
    if (error || !courier) throw new Error('Livreur introuvable pour cette boutique.');
  } else {
    courierId = null;
  }

  const nextStatus = order.status;
  const { error } = await adminDb()
    .from(ORDERS)
    .update({
      status: nextStatus,
      courierId,
      dispatchedAt:
        nextStatus === 'en_route'
          ? existing.dispatchedAt ?? new Date().toISOString()
          : existing.dispatchedAt ?? null,
    })
    .eq('id', existing.id)
    .eq('shopId', shopId);

  if (error) {
    console.error('[orders] mise à jour', error.message);
    throw new Error('Mise à jour de la commande échouée.');
  }

  if (nextStatus === 'annulee' && existing.status !== 'annulee') {
    const items = (existing.items ?? [])
      .filter((item) => item.productId)
      .map((item) => ({ productId: item.productId as string, quantity: item.quantity }));
    await releaseStock(items);
  }

  const updated = await loadSellerOrder(existing.id, shopId);
  if (!updated) throw new Error('Commande introuvable après mise à jour.');
  return updated;
}
