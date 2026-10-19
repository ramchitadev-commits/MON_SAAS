import { PaymentProviderAdapter, CreatePaymentParams, PaymentResult, WebhookPayload } from './types';
import { parseMonerooEvent, verifyMonerooSignature } from './signature';
import { privateEnv } from '../env';

const METHOD_CODES = {
  wave: 'wave_sn',
  orange_money: 'orange_sn',
} as const;

type MonerooInitResponse = {
  message?: string;
  data?: {
    id?: string;
    checkout_url?: string;
  };
  checkout_url?: string;
  id?: string;
};

function splitCustomerName(name: string): { first_name: string; last_name: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first_name: 'Client', last_name: 'Doolé' };
  if (parts.length === 1) return { first_name: parts[0], last_name: 'Client' };
  return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
}

function customerEmailFromPhone(phone: string, explicit?: string): string {
  if (explicit?.includes('@')) return explicit.trim();
  const digits = phone.replace(/\D/g, '');
  return `${digits || 'client'}@clients.doole.app`;
}

/**
 * Adapter Moneroo : Wave Sénégal + Orange Money Sénégal via api.moneroo.io
 */
export class MonerooAdapter implements PaymentProviderAdapter {
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.moneroo.io';

  constructor(apiKey?: string, webhookSecret?: string) {
    this.apiKey = apiKey || privateEnv.MONEROO_API_KEY;
    this.webhookSecret = webhookSecret || privateEnv.MONEROO_WEBHOOK_SECRET;

    if (!this.apiKey) {
      console.error('❌ MONEROO_API_KEY manquante. Configurez-la sur Vercel.');
    }
    if (!this.webhookSecret) {
      console.error('❌ MONEROO_WEBHOOK_SECRET manquante. Configurez-la sur Vercel.');
    }
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const { orderId, amount, customerPhone, customerName, customerEmail, method, returnUrl } = params;
    const phone = customerPhone.replace(/\s/g, '');
    const names = splitCustomerName(customerName);

    try {
      const payload = {
        amount,
        currency: 'XOF',
        description: `Commande Doolé #${orderId.slice(0, 8)}`,
        return_url: returnUrl,
        customer: {
          email: customerEmailFromPhone(phone, customerEmail),
          first_name: names.first_name,
          last_name: names.last_name,
          phone,
        },
        methods: [METHOD_CODES[method]],
        metadata: {
          order_id: orderId,
        },
      };

      const response = await fetch(`${this.baseUrl}/v1/payments/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let data: MonerooInitResponse = {};
      try {
        data = JSON.parse(rawText) as MonerooInitResponse;
      } catch {
        // corps non JSON
      }

      if (!response.ok) {
        throw new Error(`Moneroo API error (${response.status}): ${rawText}`);
      }

      const checkoutUrl = data.data?.checkout_url || data.checkout_url;
      const providerRef = data.data?.id || data.id;

      if (!checkoutUrl || !providerRef) {
        throw new Error(`Réponse Moneroo incomplète: ${rawText}`);
      }

      return { checkoutUrl, providerRef };
    } catch (error) {
      console.error('[MONEROO] Payment creation failed:', error);
      throw new Error(
        `Création de la session de paiement échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }

  verifySignature(rawBody: string, signatureHeader: string): boolean {
    return verifyMonerooSignature(this.webhookSecret, rawBody, signatureHeader);
  }

  parseWebhookEvent(rawBody: string): WebhookPayload {
    try {
      return parseMonerooEvent(rawBody);
    } catch (error) {
      console.error('[MONEROO] Webhook parsing failed:', error);
      throw new Error(
        `Impossible de parser le webhook Moneroo: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    }
  }
}

let monerooInstance: MonerooAdapter | null = null;

export function getMonerooAdapter(): MonerooAdapter {
  if (!monerooInstance) {
    monerooInstance = new MonerooAdapter();
  }
  return monerooInstance;
}
