export type PaymentMethod = 'wave' | 'orange_money';

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  customerPhone: string;
  method: PaymentMethod;
  returnUrl: string;
}

export interface PaymentResult {
  checkoutUrl: string;
  providerRef: string;
}

export interface WebhookPayload {
  providerRef: string;
  status: 'success' | 'failed' | 'pending';
  amount: number;
}

export interface PaymentProviderAdapter {
  /**
   * Crée une session de paiement auprès du fournisseur
   * Retourne l'URL de redirection et la référence du fournisseur
   */
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;

  /**
   * Vérifie que le webhook est signé correctement par le fournisseur
   */
  verifySignature(rawBody: string, signatureHeader: string): boolean;

  /**
   * Parse l'événement webhook du fournisseur et extrait les infos clés
   */
  parseWebhookEvent(rawBody: string): WebhookPayload;
}
