'use server';

import { createOrder as createOrderDb, autoDispatchOrder } from './orders';
import { getCouriers } from './couriers';
import { OrderInput } from './orders';
import { Order } from '@/types';

export async function createOrderWithAutoDispatch(input: OrderInput): Promise<Order> {
  // 1. Crée la commande en base de données
  const order = await createOrderDb(input);

  // 2. Charge les livreurs disponibles
  try {
    const couriers = await getCouriers();
    if (couriers.length > 0) {
      // 3. Tente un dispatch automatique (optionnel, ne bloque pas la création)
      await autoDispatchOrder(order.id, couriers);
    }
  } catch (err) {
    console.warn('Auto-dispatch non disponible:', err);
    // On ne bloque pas la création de commande si le dispatch auto échoue
  }

  return order;
}
