import 'server-only';

import { adminDb } from './server/db';

export type Plan = 'free' | 'starter' | 'pro';

interface PlanLimits {
  maxProducts: number | null;
  maxOrdersPerMonth: number | null;
  maxCouriers: number | null;
  autoDispatch: boolean;
}

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { maxProducts: 10, maxOrdersPerMonth: 30, maxCouriers: 0, autoDispatch: false },
  starter: { maxProducts: 50, maxOrdersPerMonth: 200, maxCouriers: 1, autoDispatch: true },
  pro: { maxProducts: null, maxOrdersPerMonth: null, maxCouriers: null, autoDispatch: true },
};

export async function getShopPlan(shopId: string): Promise<Plan> {
  const { data, error } = await adminDb()
    .from('shop_settings')
    .select('plan')
    .eq('id', shopId)
    .maybeSingle();

  if (error || !data) {
    console.error('[plan] lecture', error?.message);
    throw new Error('Impossible de récupérer le plan.');
  }
  return (data.plan as Plan) || 'free';
}

export function canAutoDispatch(plan: Plan): boolean {
  return PLAN_LIMITS[plan].autoDispatch;
}

export async function incrementMonthlyOrderCount(shopId: string): Promise<void> {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const db = adminDb();

  const { data: shop, error: fetchError } = await db
    .from('shop_settings')
    .select('currentMonthStart, currentMonthOrders')
    .eq('id', shopId)
    .maybeSingle();

  if (fetchError || !shop) {
    console.error('[plan] compteur', fetchError?.message);
    throw new Error('Erreur lors de la récupération du compteur.');
  }

  const lastMonthStart = new Date(shop.currentMonthStart);
  const isSameMonth =
    lastMonthStart.getFullYear() === currentMonth.getFullYear() &&
    lastMonthStart.getMonth() === currentMonth.getMonth();

  const { error: updateError } = await db
    .from('shop_settings')
    .update({
      currentMonthOrders: isSameMonth ? shop.currentMonthOrders + 1 : 1,
      currentMonthStart: (isSameMonth ? lastMonthStart : currentMonth).toISOString(),
    })
    .eq('id', shopId);

  if (updateError) {
    console.error('[plan] incrément', updateError.message);
    throw new Error('Erreur lors de la mise à jour du compteur.');
  }
}

export async function checkProductLimit(shopId: string): Promise<void> {
  const plan = await getShopPlan(shopId);
  const max = PLAN_LIMITS[plan].maxProducts;
  if (max === null) return;

  const { count, error } = await adminDb()
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('shopId', shopId);

  if (error) {
    console.error('[plan] produits', error.message);
    throw new Error('Erreur lors du comptage des produits.');
  }
  if (count !== null && count >= max) {
    throw new Error(
      `Limite de ${max} produits atteinte pour le plan ${plan}. Passez à un plan supérieur.`
    );
  }
}

export async function checkCourierLimit(shopId: string): Promise<void> {
  const plan = await getShopPlan(shopId);
  const max = PLAN_LIMITS[plan].maxCouriers;
  if (max === null) return;

  const { count, error } = await adminDb()
    .from('couriers')
    .select('id', { count: 'exact', head: true })
    .eq('shopId', shopId);

  if (error) {
    console.error('[plan] livreurs', error.message);
    throw new Error('Erreur lors du comptage des livreurs.');
  }
  if (count !== null && count >= max) {
    throw new Error(
      max === 0
        ? 'Le plan gratuit ne permet pas d’ajouter un livreur.'
        : `Limite de ${max} livreur atteinte pour le plan ${plan}.`
    );
  }
}

export async function checkOrderLimit(shopId: string): Promise<void> {
  const plan = await getShopPlan(shopId);
  const max = PLAN_LIMITS[plan].maxOrdersPerMonth;
  if (max === null) return;

  const { data: shop, error } = await adminDb()
    .from('shop_settings')
    .select('currentMonthStart, currentMonthOrders')
    .eq('id', shopId)
    .maybeSingle();

  if (error || !shop) {
    console.error('[plan] commandes', error?.message);
    throw new Error('Erreur lors de la vérification des limites.');
  }

  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(shop.currentMonthStart);
  const isSameMonth =
    lastMonthStart.getFullYear() === currentMonth.getFullYear() &&
    lastMonthStart.getMonth() === currentMonth.getMonth();
  const currentCount = isSameMonth ? shop.currentMonthOrders : 0;

  if (currentCount >= max) {
    throw new Error(
      `Limite de ${max} commandes/mois atteinte pour le plan ${plan}. Passez à un plan supérieur.`
    );
  }
}
