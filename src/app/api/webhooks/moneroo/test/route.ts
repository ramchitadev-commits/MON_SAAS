/**
 * Route de TEST pour simuler un webhook Moneroo
 * Utilise : POST https://localhost:3000/api/webhooks/moneroo/test
 * avec un JSON : {"reference": "test-ref-123", "status": "completed", "amount": 15000}
 *
 * ⚠️ À UTILISER UNIQUEMENT EN MODE SANDBOX/DEV - À SUPPRIMER EN PRODUCTION
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getMonerooAdapter } from '@/lib/payment/moneroo';
import { getAdminSupabaseClient } from '@/lib/supabase/admin';
import { updateOrder } from '@/lib/orders';

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ⚠️ Vérifie qu'on est en développement/sandbox
  if (process.env.NODE_ENV === 'production' && !process.env.MONEROO_API_KEY?.includes('sandbox')) {
    return NextResponse.json(
      { error: 'Test webhook disabled in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { reference, status, amount } = body;

    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    console.log('[TEST WEBHOOK] Simulating Moneroo webhook:', { reference, status, amount });

    const admin = getAdminSupabaseClient();

    // Enregistre l'événement (même logique que le vrai webhook)
    const { error: paymentInsertError } = await admin
      .from('payments')
      .insert({
        provider: 'moneroo',
        providerRef: reference,
        amount: amount || 0,
        status: status === 'completed' ? 'success' : status || 'pending',
        raw: { reference, status, amount, test: true },
      })
      .maybeSingle();

    if (paymentInsertError) {
      console.warn('[TEST WEBHOOK] Payment already recorded (idempotent)');
    }

    // Cherche la commande par providerRef
    const { data: orders, error: orderError } = await admin
      .from('orders')
      .select('id, shopId, status')
      .eq('paymentRef', reference)
      .maybeSingle();

    if (orderError || !orders) {
      console.warn('[TEST WEBHOOK] Order not found for reference:', reference);
      return NextResponse.json({ message: 'Order not found (expected for test)' }, { status: 200 });
    }

    // Met à jour le statut si paiement confirmé
    if (status === 'completed' || status === 'success') {
      await updateOrder(orders.id, { status: 'payee' });
      console.log('[TEST WEBHOOK] Order updated to payee:', orders.id);
    }

    return NextResponse.json({ success: true, message: 'Test webhook processed' }, { status: 200 });
  } catch (error) {
    console.error('[TEST WEBHOOK] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    );
  }
}
