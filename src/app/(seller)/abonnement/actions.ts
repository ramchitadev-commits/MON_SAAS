'use server';

import { getShopPlan, type Plan } from '@/lib/subscriptions';
import { getActiveShopId } from '@/lib/shop';

export async function fetchCurrentPlan(): Promise<Plan> {
  const id = await getActiveShopId();
  return getShopPlan(id);
}
