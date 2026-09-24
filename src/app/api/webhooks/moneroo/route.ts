import { NextRequest, NextResponse } from 'next/server';
import { getMonerooAdapter } from '@/lib/payment/moneroo';
import { getAdminSupabaseClient } from '@/lib/supabase/admin';
import { getOrderById, updateOrder } from '@/lib/orders';
import { getCouriers } from '@/lib/couriers';
import { canAutoDispatch, incrementMonthlyOrderCount, getShopPlan } from '@/lib/subscriptions';
import { notifyCourier } from '@/lib/notify/courier';
import { sendSmsViaBrevo } from '@/lib/notify/sms';

/**
 * Webhook Moneroo — point d'entrée pour les confirmations de paiement
 * Source de vérité : jamais le client ne doit marquer une commande comme payée,
 * seul le webhook Moneroo peut le faire.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 1. Récupère le raw body (nécessaire pour vérifier la signature)
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('x-moneroo-signature') || '';

    // 2. Initialise l'adapter Moneroo
    const moneroo = getMonerooAdapter();

    // 3. Vérifie la signature
    if (!moneroo.verifySignature(rawBody, signatureHeader)) {
      console.error('[WEBHOOK] Signature de Moneroo invalide');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 4. Parse l'événement
    const webhookEvent = moneroo.parseWebhookEvent(rawBody);
    const { providerRef, status, amount } = webhookEvent;

    console.log('[WEBHOOK] Événement Moneroo reçu:', { providerRef, status, amount });

    const admin = getAdminSupabaseClient();

    // 5. Enregistre l'événement dans la table payments (idempotence via UNIQUE constraint)
    // Si c'est un doublon (même provider + providerRef), l'insert échoue silencieusement
    const { error: paymentInsertError } = await admin
      .from('payments')
      .insert({
        provider: 'moneroo',
        providerRef,
        amount,
        status,
        raw: JSON.parse(rawBody),
      })
      .maybeSingle();

    if (paymentInsertError) {
      // Vérifie si c'est un doublon (erreur UNIQUE constraint) ou une vraie erreur
      if (paymentInsertError.code === '23505') {
        // Doublon — c'est un rejeu du webhook, répond 200 sans retraiter
        console.log('[WEBHOOK] Doublon détecté (même providerRef), ignore');
        return NextResponse.json({ status: 'ok', message: 'Doublon ignoré' }, { status: 200 });
      }
      throw paymentInsertError;
    }

    // 6. Récupère la commande associée via le paymentRef
    const { data: orderData, error: orderError } = await admin
      .from('orders')
      .select('*')
      .eq('paymentRef', providerRef)
      .maybeSingle();

    if (orderError) {
      throw new Error(`Erreur lors de la récupération de la commande: ${orderError.message}`);
    }

    if (!orderData) {
      console.warn('[WEBHOOK] Aucune commande trouvée pour', providerRef);
      // Commande déjà traitée ou références incohérentes — répond 200 pour Moneroo
      return NextResponse.json({ status: 'ok', message: 'Commande non trouvée' }, { status: 200 });
    }

    const orderId = orderData.id as string;
    const shopId = orderData.shopId as string;

    // 7. Traite selon le statut du paiement
    if (status === 'success') {
      // Met à jour la commande
      await admin
        .from('orders')
        .update({
          status: 'payee',
          paidAt: new Date().toISOString(),
        })
        .eq('id', orderId);

      // Incrémente le compteur de commandes du mois
      await incrementMonthlyOrderCount(shopId);

      // Envoie un SMS de confirmation à l'acheteur
      const confirmationMessage =
        `Doolé — Commande confirmée ✅\n` +
        `Numéro: #${orderId.slice(0, 8)}\n` +
        `Montant: ${new Intl.NumberFormat('fr-FR').format(orderData.total)} FCFA\n` +
        `Suivi: ${process.env.NEXT_PUBLIC_APP_URL}/suivi/${orderData.trackingToken}`;

      try {
        await sendSmsViaBrevo(orderData.customerPhone, confirmationMessage);
      } catch (smsError) {
        // Log l'erreur mais ne bloque pas le traitement
        console.error('[WEBHOOK] Erreur lors de l\'envoi du SMS acheteur:', smsError);
      }

      // 8. Applique la logique de dispatch conditionnée au plan
      try {
        const plan = await getShopPlan(shopId);

        if (canAutoDispatch(plan)) {
          // Récupère les livreurs de la boutique
          const couriers = await getCouriers();
          const defaultCourier = couriers.find((c) => c.isDefault);

          if (defaultCourier) {
            // Charge la commande avec ses relations
            const fullOrder = await getOrderById(orderId);
            if (fullOrder) {
              // Dispatch automatique
              fullOrder.courierId = defaultCourier.id;
              fullOrder.dispatchedAt = new Date().toISOString();
              fullOrder.status = 'en_route'; // Change le statut

              await updateOrder(fullOrder);

              // Envoie la notification au livreur
              try {
                await notifyCourier(defaultCourier, fullOrder);
              } catch (notifyError) {
                console.error('[WEBHOOK] Erreur lors de la notification au livreur:', notifyError);
              }
            }
          } else {
            console.warn('[WEBHOOK] Aucun livreur par défaut pour la boutique', shopId);
          }
        } else {
          console.log(`[WEBHOOK] Plan ${plan} n'autorise pas le dispatch auto`);
        }
      } catch (dispatchError) {
        // Log l'erreur mais ne bloque pas le traitement
        console.error('[WEBHOOK] Erreur lors du dispatch automatique:', dispatchError);
      }
    } else if (status === 'failed') {
      // Annule la commande
      await admin
        .from('orders')
        .update({
          status: 'annulee',
        })
        .eq('id', orderId);

      // Envoie un SMS d'annulation à l'acheteur
      const cancelMessage =
        `Doolé — Paiement échoué ❌\n` +
        `Commande #${orderId.slice(0, 8)}\n` +
        `Veuillez réessayer ou contacter le vendeur.`;

      try {
        await sendSmsViaBrevo(orderData.customerPhone, cancelMessage);
      } catch (smsError) {
        console.error('[WEBHOOK] Erreur lors de l\'envoi du SMS acheteur:', smsError);
      }
    }
    // Si pending, ne fait rien (attend la confirmation finale)

    // 9. Répond toujours 200 rapidement (même en cas d'erreur métier)
    // Moneroo interprète tout non-2xx comme une erreur de livraison et rejouera
    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK] Erreur lors du traitement:', error);
    // Répond toujours 200 pour ne pas bloquer Moneroo
    return NextResponse.json(
      { status: 'ok', error: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 200 }
    );
  }
}
