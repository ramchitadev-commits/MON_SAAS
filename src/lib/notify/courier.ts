import { Courier, Order } from '@/types';
import { sendSmsViaBrevo } from './sms';

/**
 * Envoie une notification au livreur quand une nouvelle commande est à dispatcher
 * Support SMS uniquement en MVP (WhatsApp hors scope)
 */
export async function notifyCourier(courier: Courier, order: Order): Promise<void> {
  const message = buildCourierMessage(courier, order);

  if (courier.channel === 'sms') {
    await sendSmsViaBrevo(courier.phone, message);
  } else if (courier.channel === 'whatsapp') {
    // WhatsApp pas implémenté aujourd'hui — fallback SMS + warning
    console.warn(
      `[NOTIFY] WhatsApp not implemented; falling back to SMS for courier ${courier.id}`
    );
    await sendSmsViaBrevo(courier.phone, message);
  }
}

function buildCourierMessage(courier: Courier, order: Order): string {
  // Formule le message de livraison avec les infos clés
  const total = `${new Intl.NumberFormat('fr-FR').format(order.total)} FCFA`;
  const address = `${order.deliveryZone} - ${order.deliveryAddress}`;

  return (
    `Nouvelle livraison 📦\n` +
    `Client: ${order.customerName} (${order.customerPhone})\n` +
    `Adresse: ${address}\n` +
    `Montant: ${total}\n` +
    (order.deliveryNote ? `Note: ${order.deliveryNote}\n` : '') +
    `Commande #${order.id.slice(0, 8)}`
  );
}
