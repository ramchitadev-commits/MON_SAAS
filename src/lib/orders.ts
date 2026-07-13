import { z } from 'zod';
import { supabase } from './supabase';
import { Order, OrderStatus, Courier } from '@/types';

const ORDERS = 'orders';
const ITEMS = 'order_items';
// Embarque les lignes de commande sous la clé `items` (relation order_items.orderId -> orders.id).
const SELECT_WITH_ITEMS = '*, items:order_items(*)';

// --- Validation Zod (règle AGENTS.md) ---
export const orderItemInputSchema = z.object({
  productId: z.string().nullable().optional(),
  name: z.string().trim().min(1),
  unitPrice: z.number().int().min(0),
  quantity: z.number().int().min(1),
});

export const orderInputSchema = z.object({
  customerName: z.string().trim().min(1, 'Le nom du client est obligatoire.'),
  customerPhone: z.string().trim().min(1, 'Le téléphone du client est obligatoire.'),
  deliveryZone: z.string().trim().min(1, 'La zone de livraison est obligatoire.'),
  deliveryAddress: z.string().trim().min(1, "L'adresse de livraison est obligatoire."),
  deliveryNote: z.string().nullable().optional(),
  gpsLocation: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
  subtotal: z.number().int().min(0),
  deliveryFee: z.number().int().min(0),
  total: z.number().int().min(0),
  status: z.enum(['en_attente', 'payee', 'a_envoyer', 'en_route', 'livre', 'annulee']).default('en_attente'),
  paymentProvider: z.enum(['wave', 'orange_money']),
  paymentRef: z.string().nullable().optional(),
  trackingToken: z.string().trim().min(1),
  paidAt: z.string().nullable().optional(),
  items: z.array(orderItemInputSchema).min(1, 'La commande doit contenir au moins un article.'),
});

export type OrderInput = z.infer<typeof orderInputSchema>;

// --- Lecture ---
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from(ORDERS)
    .select(SELECT_WITH_ITEMS)
    .order('createdAt', { ascending: false });

  if (error) throw new Error(`Chargement des commandes impossible : ${error.message}`);
  return (data ?? []) as unknown as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from(ORDERS)
    .select(SELECT_WITH_ITEMS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(`Commande introuvable : ${error.message}`);
  return (data as unknown as Order) ?? null;
}

export async function getOrderByToken(token: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from(ORDERS)
    .select(SELECT_WITH_ITEMS)
    .eq('trackingToken', token)
    .maybeSingle();

  if (error) throw new Error(`Suivi de commande introuvable : ${error.message}`);
  return (data as unknown as Order) ?? null;
}

// Compte les commandes « à traiter » (pour le badge de navigation) sans charger les données.
export async function countActiveOrders(): Promise<number> {
  const { count, error } = await supabase
    .from(ORDERS)
    .select('id', { count: 'exact', head: true })
    .in('status', ['payee', 'en_attente']);

  if (error) throw new Error(`Comptage des commandes impossible : ${error.message}`);
  return count ?? 0;
}

// --- Création : insère la commande puis ses articles (rollback best-effort si échec) ---
export async function createOrder(input: OrderInput): Promise<Order> {
  const parsed = orderInputSchema.parse(input);
  const { items, ...orderFields } = parsed;

  // Filtre les champs null/undefined pour éviter les erreurs Supabase
  const fieldsToInsert = Object.fromEntries(
    Object.entries(orderFields).filter(([, value]) => value !== null && value !== undefined)
  );

  const { data: orderRow, error: orderError } = await supabase
    .from(ORDERS)
    .insert(fieldsToInsert)
    .select()
    .single();
  if (orderError) throw new Error(`Création de la commande échouée : ${orderError.message}`);

  const itemsToInsert = items.map((it) => ({ ...it, orderId: orderRow.id }));
  const { error: itemsError } = await supabase.from(ITEMS).insert(itemsToInsert);
  if (itemsError) {
    // La commande a été créée sans ses articles : on la supprime pour ne pas laisser d'orphelin.
    await supabase.from(ORDERS).delete().eq('id', orderRow.id);
    throw new Error(`Enregistrement des articles échoué : ${itemsError.message}`);
  }

  const created = await getOrderById(orderRow.id);
  if (!created) throw new Error('Commande créée mais introuvable après insertion.');
  return created;
}

// --- Mise à jour des champs logistiques (statut, livreur, dates) ---
export async function updateOrder(order: Order): Promise<Order> {
  const patch: {
    status: OrderStatus;
    courierId: string | null;
    dispatchedAt: string | null;
    paidAt: string | null;
  } = {
    status: order.status,
    courierId: order.courierId ?? null,
    dispatchedAt: order.dispatchedAt ?? null,
    paidAt: order.paidAt ?? null,
  };

  const { error } = await supabase
    .from(ORDERS)
    .update(patch)
    .eq('id', order.id);

  if (error) throw new Error(`Mise à jour de la commande échouée : ${error.message}`);

  // Recharge la commande complète avec ses items
  const updated = await getOrderById(order.id);
  if (!updated) throw new Error('Commande mise à jour mais introuvable après');
  return updated;
}

// --- Dispatch automatique : attribue une commande au premier livreur disponible ---
export async function autoDispatchOrder(orderId: string, couriers: Courier[]): Promise<Order | null> {
  if (couriers.length === 0) return null;

  // Charge la commande existante
  const order = await getOrderById(orderId);
  if (!order) return null;

  // Sélectionne le premier livreur (dispatch équitable)
  const assignedCourier = couriers[0];

  const updatedOrder: Order = {
    ...order,
    courierId: assignedCourier.id,
    dispatchedAt: new Date().toISOString(),
    // Note: on ne change pas le statut ici, il reste 'payee' jusqu'à
    // ce que le livreur confirme qu'il a accepté la commande
  };

  try {
    return await updateOrder(updatedOrder);
  } catch (err) {
    console.error(`Auto-dispatch échoué pour la commande ${orderId}:`, err);
    return null;
  }
}
