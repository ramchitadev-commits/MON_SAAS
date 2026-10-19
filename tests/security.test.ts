import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import { ABANDONED_ORDER_MS, isAbandonedOrder } from '../src/lib/abandoned-orders.ts';
import { feeForZone } from '../src/lib/delivery-zones.ts';
import { parseMonerooEvent, verifyMonerooSignature } from '../src/lib/payment/signature.ts';

test('les frais de zone viennent de la liste connue', () => {
  assert.equal(feeForZone('Plateau'), 1500);
  assert.equal(feeForZone('Rufisque'), 3500);
  assert.equal(feeForZone('Paris'), null);
  assert.equal(feeForZone('plateau'), null);
});

test('une commande en attente devient abandonnée après 45 minutes', () => {
  const now = Date.parse('2026-10-14T12:00:00.000Z');
  const fresh = new Date(now - ABANDONED_ORDER_MS + 1000).toISOString();
  const stale = new Date(now - ABANDONED_ORDER_MS).toISOString();
  assert.equal(isAbandonedOrder(fresh, now), false);
  assert.equal(isAbandonedOrder(stale, now), true);
  assert.equal(isAbandonedOrder('pas-une-date', now), false);
});

test('la signature Moneroo refuse un secret vide, un corps modifié et une longueur différente', () => {
  const secret = 'webhook-secret';
  const body = JSON.stringify({
    event: 'payment.success',
    data: { id: 'py_ref1', status: 'success', amount: 15000 },
  });
  const signature = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');

  assert.equal(verifyMonerooSignature(secret, body, signature), true);
  assert.equal(verifyMonerooSignature(secret, body, `sha256=${signature}`), true);
  assert.equal(verifyMonerooSignature(secret, `${body} `, signature), false);
  assert.equal(verifyMonerooSignature(secret, body, 'abc'), false);
  assert.equal(verifyMonerooSignature('', body, signature), false);
  assert.deepEqual(parseMonerooEvent(body), { providerRef: 'py_ref1', status: 'success', amount: 15000 });
  assert.deepEqual(
    parseMonerooEvent(JSON.stringify({ event: 'payment.failed', data: { id: 'py_2', status: 'failed', amount: 100 } })),
    { providerRef: 'py_2', status: 'failed', amount: 100 }
  );
  assert.deepEqual(
    parseMonerooEvent(JSON.stringify({ reference: 'legacy-1', status: 'completed', amount: 500 })),
    { providerRef: 'legacy-1', status: 'success', amount: 500 }
  );
});

test('le jeton de session est signé et expire', async () => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-session-secret';
  const { signSession, verifySession } = await import('../src/lib/session-token.ts');
  const phone = '+221771234567';
  const token = await signSession(phone);
  assert.equal((await verifySession(token))?.phone, phone);
  assert.equal(await verifySession(`${token}x`), null);
  assert.equal(await verifySession(token.slice(0, -2) + (token.endsWith('aa') ? 'bb' : 'aa')), null);

  const expired = await signSession(phone, Date.now() - 31 * 24 * 60 * 60 * 1000);
  assert.equal(await verifySession(expired), null);
});
