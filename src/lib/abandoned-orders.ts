export const ABANDONED_ORDER_MS = 45 * 60 * 1000;

export function isAbandonedOrder(createdAt: string, now = Date.now()): boolean {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return false;
  return now - created >= ABANDONED_ORDER_MS;
}
