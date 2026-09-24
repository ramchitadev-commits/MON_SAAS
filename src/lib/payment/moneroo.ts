import crypto from 'crypto';
import { PaymentProviderAdapter, CreatePaymentParams, PaymentResult, WebhookPayload } from './types';

/**
 * Adapter Moneroo : implémentation pour Wave + Orange Money via le meta-agrégateur Moneroo
 * Fournit checkout, vérification de signature, et parsing de webhook
 */
export class MonerooAdapter implements PaymentProviderAdapter {
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.moneroo.io';

  constructor(apiKey?: string, webhookSecret?: string) {
    this.apiKey = apiKey || process.env.MONEROO_API_KEY || '';
    this.webhookSecret = webhookSecret || process.env.MONEROO_WEBHOOK_SECRET || '';

    if (!this.apiKey) {
      throw new Error(
        'MONEROO_API_KEY manquante. Vérifiez votre configuration .env.local ou Vercel.'
      );
    }
    if (!this.webhookSecret) {
      throw new Error(
        'MONEROO_WEBHOOK_SECRET manquée. Vérifiez votre configuration .env.local ou Vercel.'
      );
    }
  }

  /**
   * Crée une session de paiement auprès de Moneroo
   * Retourne l'URL de redirection Wave/Orange Money et une référence de transaction
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const { orderId, amount, customerPhone, method, returnUrl } = params;

    try {
      const payload = {
        amount,
        currency: 'XOF',
        phone_number: customerPhone.replace(/\s/g, ''),
        payment_method: method === 'wave' ? 'wave' : 'orange_money',
        external_id: orderId,
        return_url: returnUrl,
        // Description du paiement pour la facturation
        description: `Commande Doolé #${orderId.slice(0, 8)}`,
      };

      const response = await fetch(`${this.baseUrl}/v1/checkout/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Moneroo API error (${response.status}): ${errorText}`);
      }

      const data = await response.json() as { checkout_url: string; reference: string };

      return {
        checkoutUrl: data.checkout_url,
        providerRef: data.reference,
      };
    } catch (error) {
      console.error('[MONEROO] Payment creation failed:', error);
      throw new Error(`Création de la session de paiement échouée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  /**
   * Vérifie que le webhook est signé correctement par Moneroo
   * Moneroo envoie un header X-Moneroo-Signature = HMAC-SHA256(payload, secret)
   */
  verifySignature(rawBody: string, signatureHeader: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(rawBody, 'utf-8')
        .digest('hex');

      return hash === signatureHeader;
    } catch (error) {
      console.error('[MONEROO] Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Parse l'événement webhook Moneroo et extrait les infos pertinentes
   */
  parseWebhookEvent(rawBody: string): WebhookPayload {
    try {
      const payload = JSON.parse(rawBody) as {
        reference: string;
        status: string;
        amount: number;
      };

      return {
        providerRef: payload.reference,
        status: payload.status === 'completed' ? 'success' : payload.status === 'failed' ? 'failed' : 'pending',
        amount: payload.amount,
      };
    } catch (error) {
      console.error('[MONEROO] Webhook parsing failed:', error);
      throw new Error(`Impossible de parser le webhook Moneroo: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}

// Export un singleton pour utilisation dans le webhook
let monerooInstance: MonerooAdapter | null = null;

export function getMonerooAdapter(): MonerooAdapter {
  if (!monerooInstance) {
    monerooInstance = new MonerooAdapter();
  }
  return monerooInstance;
}
