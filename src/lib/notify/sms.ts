import 'server-only';

/**
 * Service SMS centralisé via Brevo (utilisé par OTP et dispatch livreur)
 */

import { privateEnv } from '../env';

/** Vrai tant que le compte Brevo n'a pas l'option SMS. Jamais actif en production. */
export function smsIsMocked(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export async function sendSmsViaBrevo(phone: string, message: string): Promise<void> {
  if (smsIsMocked()) {
    console.info(`[sms:mock] ${phone}\n${message}`);
    return;
  }

  const apiKey = privateEnv.BREVO_API_KEY;
  const sender = privateEnv.BREVO_SMS_SENDER;

  if (!apiKey) {
    console.error('❌ BREVO_API_KEY manquante. Configurez-la sur Vercel.');
    throw new Error('BREVO_API_KEY non configurée - impossible d\'envoyer SMS');
  }

  const response = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender,
      recipient: phone.replace(/\s/g, ''),
      content: message,
      type: 'transactional',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Envoi du SMS échoué (${response.status}) : ${body}`);
  }
}
