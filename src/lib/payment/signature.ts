import crypto from 'crypto';

export type MonerooEvent = {
  providerRef: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
};

export function verifyMonerooSignature(secret: string, rawBody: string, signatureHeader: string): boolean {
  if (!secret || !signatureHeader) return false;
  try {
    const provided = signatureHeader.trim().replace(/^sha256=/i, '');
    const hash = crypto.createHmac('sha256', secret).update(rawBody, 'utf-8').digest('hex');
    const expected = Buffer.from(hash);
    const actual = Buffer.from(provided);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function mapStatus(eventName: string | undefined, rawStatus: string | undefined): MonerooEvent['status'] {
  const event = (eventName || '').toLowerCase();
  const status = (rawStatus || '').toLowerCase();

  if (event === 'payment.success' || status === 'success' || status === 'completed') return 'success';
  if (
    event === 'payment.failed' ||
    event === 'payment.cancelled' ||
    status === 'failed' ||
    status === 'cancelled' ||
    status === 'canceled'
  ) {
    return 'failed';
  }
  return 'pending';
}

export function parseMonerooEvent(rawBody: string): MonerooEvent {
  const payload = JSON.parse(rawBody) as {
    event?: string;
    data?: {
      id?: string;
      amount?: number | string;
      status?: string;
    };
    // Ancien format plat éventuellement encore reçu en tests
    reference?: string;
    id?: string;
    status?: string;
    amount?: number | string;
  };

  if (payload.data && (payload.data.id || payload.event)) {
    const providerRef = String(payload.data.id || '').trim();
    if (!providerRef) throw new Error('Webhook Moneroo sans id de paiement.');
    return {
      providerRef,
      status: mapStatus(payload.event, payload.data.status),
      amount: Number(payload.data.amount),
    };
  }

  const providerRef = String(payload.reference || payload.id || '').trim();
  if (!providerRef) throw new Error('Webhook Moneroo sans référence de paiement.');

  return {
    providerRef,
    status: mapStatus(undefined, payload.status),
    amount: Number(payload.amount),
  };
}
