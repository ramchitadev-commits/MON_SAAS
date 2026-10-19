'use server';

import { z } from 'zod';
import { Courier } from '@/types';
import { adminDb } from './server/db';
import { requireShopId } from './server/access';
import { checkCourierLimit } from './subscriptions';

const TABLE = 'couriers';

const courierInputSchema = z.object({
  name: z.string().trim().min(1, 'Le nom du livreur est obligatoire.'),
  phone: z.string().trim().min(1, 'Le téléphone du livreur est obligatoire.'),
  channel: z.enum(['sms', 'whatsapp']),
  isDefault: z.boolean().default(false),
});

export type CourierInput = z.infer<typeof courierInputSchema>;

async function clearDefault(shopId: string, exceptId?: string): Promise<void> {
  let query = adminDb().from(TABLE).update({ isDefault: false }).eq('shopId', shopId).eq('isDefault', true);
  if (exceptId) query = query.neq('id', exceptId);
  const { error } = await query;
  if (error) {
    console.error('[couriers] défaut', error.message);
    throw new Error('Mise à jour du livreur par défaut échouée.');
  }
}

export async function getCouriers(): Promise<Courier[]> {
  const shopId = await requireShopId();
  const { data, error } = await adminDb()
    .from(TABLE)
    .select('*')
    .eq('shopId', shopId)
    .order('createdAt', { ascending: true });

  if (error) {
    console.error('[couriers] lecture', error.message);
    throw new Error('Chargement des livreurs impossible.');
  }
  return (data ?? []) as Courier[];
}

export async function createCourier(input: CourierInput): Promise<Courier> {
  const parsed = courierInputSchema.parse(input);
  const shopId = await requireShopId();
  await checkCourierLimit(shopId);

  let makeDefault = parsed.isDefault;
  if (!makeDefault) {
    const { count } = await adminDb()
      .from(TABLE)
      .select('id', { count: 'exact', head: true })
      .eq('shopId', shopId);
    makeDefault = (count ?? 0) === 0;
  }
  if (makeDefault) await clearDefault(shopId);

  const { data, error } = await adminDb()
    .from(TABLE)
    .insert({ ...parsed, isDefault: makeDefault, shopId })
    .select()
    .single();

  if (error) {
    console.error('[couriers] création', error.message);
    throw new Error('Création du livreur échouée.');
  }
  return data as Courier;
}

export async function saveCourier(courier: Courier): Promise<Courier> {
  const parsed = courierInputSchema.parse(courier);
  const shopId = await requireShopId();
  if (parsed.isDefault) await clearDefault(shopId, courier.id);

  const { data, error } = await adminDb()
    .from(TABLE)
    .update(parsed)
    .eq('id', courier.id)
    .eq('shopId', shopId)
    .select()
    .single();

  if (error) {
    console.error('[couriers] mise à jour', error.message);
    throw new Error('Mise à jour du livreur échouée.');
  }
  return data as Courier;
}

export async function setDefaultCourier(id: string): Promise<void> {
  const shopId = await requireShopId();
  await clearDefault(shopId, id);
  const { error } = await adminDb()
    .from(TABLE)
    .update({ isDefault: true })
    .eq('id', id)
    .eq('shopId', shopId);
  if (error) {
    console.error('[couriers] défaut', error.message);
    throw new Error('Définition du livreur par défaut échouée.');
  }
}

export async function deleteCourier(id: string): Promise<void> {
  const shopId = await requireShopId();
  const { error } = await adminDb().from(TABLE).delete().eq('id', id).eq('shopId', shopId);
  if (error) {
    console.error('[couriers] suppression', error.message);
    throw new Error('Suppression du livreur échouée.');
  }
}
