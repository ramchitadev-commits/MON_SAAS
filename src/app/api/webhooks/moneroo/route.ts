import { NextRequest, NextResponse } from 'next/server';
import { getMonerooAdapter } from '@/lib/payment/moneroo';
import { adminDb } from '@/lib/server/db';
import { releaseStock } from '@/lib/server/inventory';
import { canAutoDispatch, getShopPlan, incrementMonthlyOrderCount } from '@/lib/subscriptions';
import { notifyCourier } from '@/lib/notify/courier';
import { sendSmsViaBrevo } from '@/lib/notify/sms';
import { publicEnv } from '@/lib/env';
import { Courier, Order } from '@/types';

const PAID_STATUSES = new Set(['payee', 'a_envoyer', 'en_route', 'livre']);

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get('x-moneroo-signature') || '';
  const moneroo = getMonerooAdapter();

  if (!moneroo.verifySignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let providerRef = '';
  let status: 'success' | 'failed' | 'pending' = 'pending';
  let amount = 0;
  try {
    const event = moneroo.parseWebhookEvent(rawBody);
    providerRef = event.providerRef;
    status = event.status;
    amount = Number(event.amount);
  } catch (error) {
    console.error('[WEBHOOK] payload illisible', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const db = adminDb();
    const { data: orderData, error: orderError } = await db
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('paymentRef', providerRef)
      .maybeSingle();

    if (orderError) {
      console.error('[WEBHOOK] commande', orderError.message);
      return NextResponse.json({ error: 'Order lookup failed' }, { status: 500 });
    }
    if (!orderData) return NextResponse.json({ status: 'ignored' }, { status: 200 });

    const order = orderData as Order;
    if (!Number.isFinite(amount) || amount !== order.total) {
      console.error('[WEBHOOK] montant inattendu', { providerRef, amount, total: order.total });
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    if (status === 'success' && PAID_STATUSES.has(order.status)) {
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }
    if (status === 'failed' && order.status === 'annulee') {
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }
    if (status === 'pending') return NextResponse.json({ status: 'ok' }, { status: 200 });

    if (status === 'success') {
      const { data: updated, error: updateError } = await db
        .from('orders')
        .update({ status: 'payee', paidAt: new Date().toISOString() })
        .eq('id', order.id)
        .eq('status', 'en_attente')
        .select('id')
        .maybeSingle();

      if (updateError) {
        console.error('[WEBHOOK] confirmation', updateError.message);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }
      if (!updated) return NextResponse.json({ status: 'ok' }, { status: 200 });

      if (order.shopId) {
        await incrementMonthlyOrderCount(order.shopId);
        await dispatchIfAllowed(order);
      }

      try {
        await sendSmsViaBrevo(
          order.customerPhone,
          `Doolé — Commande confirmée\nNuméro: #${order.id.slice(0, 8)}\nMontant: ${new Intl.NumberFormat('fr-FR').format(order.total)} FCFA\nSuivi: ${publicEnv.APP_URL}/suivi/${order.trackingToken}`
        );
      } catch (smsError) {
        console.error('[WEBHOOK] SMS acheteur', smsError);
      }
    }

    if (status === 'failed') {
      const { data: cancelled, error: cancelError } = await db
        .from('orders')
        .update({ status: 'annulee' })
        .eq('id', order.id)
        .eq('status', 'en_attente')
        .select('id')
        .maybeSingle();

      if (cancelError) {
        console.error('[WEBHOOK] annulation', cancelError.message);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
      }
      if (cancelled) {
        await releaseStock(
          (order.items ?? [])
            .filter((item) => item.productId)
            .map((item) => ({ productId: item.productId as string, quantity: item.quantity }))
        );
        try {
          await sendSmsViaBrevo(
            order.customerPhone,
            `Doolé — Paiement échoué\nCommande #${order.id.slice(0, 8)}\nVeuillez réessayer ou contacter le vendeur.`
          );
        } catch (smsError) {
          console.error('[WEBHOOK] SMS annulation', smsError);
        }
      }
    }

    const { error: paymentError } = await db.from('payments').insert({
      orderId: order.id,
      provider: 'moneroo',
      providerRef,
      amount,
      status,
      raw: JSON.parse(rawBody),
    });
    if (paymentError && paymentError.code !== '23505') {
      console.error('[WEBHOOK] journal paiement', paymentError.message);
      return NextResponse.json({ error: 'Payment log failed' }, { status: 500 });
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });
  } catch (error) {
    console.error('[WEBHOOK] traitement', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

async function dispatchIfAllowed(order: Order): Promise<void> {
  if (!order.shopId) return;
  const plan = await getShopPlan(order.shopId);
  if (!canAutoDispatch(plan)) return;

  const { data: courier, error } = await adminDb()
    .from('couriers')
    .select('*')
    .eq('shopId', order.shopId)
    .eq('isDefault', true)
    .maybeSingle();

  if (error || !courier) {
    console.warn('[WEBHOOK] aucun livreur par défaut', order.shopId);
    return;
  }

  const dispatchedAt = new Date().toISOString();
  const { error: updateError } = await adminDb()
    .from('orders')
    .update({ courierId: courier.id, dispatchedAt, status: 'en_route' })
    .eq('id', order.id)
    .eq('shopId', order.shopId);

  if (updateError) {
    console.error('[WEBHOOK] dispatch', updateError.message);
    return;
  }

  try {
    await notifyCourier(courier as Courier, {
      ...order,
      courierId: courier.id as string,
      dispatchedAt,
      status: 'en_route',
    });
  } catch (notifyError) {
    console.error('[WEBHOOK] notification livreur', notifyError);
  }
}
