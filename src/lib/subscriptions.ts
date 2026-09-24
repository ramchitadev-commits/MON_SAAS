import { supabase } from './supabase';
import { getAdminSupabaseClient } from './supabase/admin';

export type Plan = 'free' | 'starter' | 'pro';

export interface PlanLimits {
  maxProducts: number | null;
  maxOrdersPerMonth: number | null;
  maxCouriers: number | null;
  autoDispatch: boolean;
}

// Limites de chaque plan (miroir du PRD §6)
const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxProducts: 10,
    maxOrdersPerMonth: 30,
    maxCouriers: 0, // Pas de livreur autorisé en plan gratuit (ou plutôt, dispatch auto désactivé)
    autoDispatch: false,
  },
  starter: {
    maxProducts: 50,
    maxOrdersPerMonth: 200,
    maxCouriers: 1,
    autoDispatch: true,
  },
  pro: {
    maxProducts: null, // Illimité
    maxOrdersPerMonth: null,
    maxCouriers: null,
    autoDispatch: true,
  },
};

/**
 * Récupère le plan d'abonnement actuel d'une boutique
 */
export async function getShopPlan(shopId: string): Promise<Plan> {
  const { data, error } = await supabase
    .from('shop_settings')
    .select('plan')
    .eq('id', shopId)
    .maybeSingle();

  if (error) {
    throw new Error(`Impossible de récupérer le plan: ${error.message}`);
  }

  if (!data) {
    throw new Error(`Boutique ${shopId} introuvable`);
  }

  return (data.plan as Plan) || 'free';
}

/**
 * Récupère les limites du plan fourni
 */
export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/**
 * Vérifie si le plan autorise le dispatch automatique du livreur
 */
export function canAutoDispatch(plan: Plan): boolean {
  return PLAN_LIMITS[plan].autoDispatch;
}

/**
 * Incrémente le compteur de commandes du mois
 * (À appeler après confirmation de paiement)
 */
export async function incrementMonthlyOrderCount(shopId: string): Promise<void> {
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const admin = getAdminSupabaseClient();

  // Récupère l'état actuel
  const { data: shop, error: fetchError } = await admin
    .from('shop_settings')
    .select('currentMonthStart, currentMonthOrders')
    .eq('id', shopId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(`Erreur lors de la récupération du compteur: ${fetchError.message}`);
  }

  if (!shop) {
    throw new Error(`Boutique ${shopId} introuvable`);
  }

  // Vérifie si on doit reset le compteur (nouveau mois)
  const lastMonthStart = new Date(shop.currentMonthStart);
  const isSameMonth =
    lastMonthStart.getFullYear() === currentMonth.getFullYear() &&
    lastMonthStart.getMonth() === currentMonth.getMonth();

  const newCount = isSameMonth ? shop.currentMonthOrders + 1 : 1;
  const newStart = isSameMonth ? lastMonthStart : currentMonth;

  // Met à jour
  const { error: updateError } = await admin
    .from('shop_settings')
    .update({
      currentMonthOrders: newCount,
      currentMonthStart: newStart.toISOString(),
    })
    .eq('id', shopId);

  if (updateError) {
    throw new Error(`Erreur lors de la mise à jour du compteur: ${updateError.message}`);
  }
}

/**
 * Vérifie si la boutique a atteint sa limite de produits pour son plan
 * (À appeler avant de créer un produit)
 */
export async function checkProductLimit(shopId: string): Promise<void> {
  const plan = await getShopPlan(shopId);
  const limits = getPlanLimits(plan);

  if (limits.maxProducts === null) {
    return; // Illimité
  }

  const { count, error } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('shopId', shopId);

  if (error) {
    throw new Error(`Erreur lors du comptage des produits: ${error.message}`);
  }

  if (count !== null && count >= limits.maxProducts) {
    throw new Error(
      `Limite de ${limits.maxProducts} produits atteinte pour le plan ${plan}. ` +
      `Supprimez un produit ou passez à un plan supérieur.`
    );
  }
}

/**
 * Vérifie si la boutique a atteint sa limite de commandes ce mois-ci
 * (À appeler avant de créer une commande, optionnel)
 */
export async function checkOrderLimit(shopId: string): Promise<void> {
  const plan = await getShopPlan(shopId);
  const limits = getPlanLimits(plan);

  if (limits.maxOrdersPerMonth === null) {
    return; // Illimité
  }

  const { data: shop, error } = await supabase
    .from('shop_settings')
    .select('currentMonthStart, currentMonthOrders')
    .eq('id', shopId)
    .maybeSingle();

  if (error) {
    throw new Error(`Erreur lors de la vérification des limites: ${error.message}`);
  }

  if (!shop) {
    throw new Error(`Boutique ${shopId} introuvable`);
  }

  // Vérifie si on doit reset le compteur (nouveau mois)
  const now = new Date();
  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(shop.currentMonthStart);
  const isSameMonth =
    lastMonthStart.getFullYear() === currentMonth.getFullYear() &&
    lastMonthStart.getMonth() === currentMonth.getMonth();

  const currentCount = isSameMonth ? shop.currentMonthOrders : 0;

  if (currentCount >= limits.maxOrdersPerMonth) {
    throw new Error(
      `Limite de ${limits.maxOrdersPerMonth} commandes/mois atteinte pour le plan ${plan}. ` +
      `Passez à un plan supérieur ou attendez le mois prochain.`
    );
  }
}
