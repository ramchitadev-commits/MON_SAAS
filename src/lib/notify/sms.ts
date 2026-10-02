/**
 * Service SMS centralisé via Brevo (utilisé par OTP et dispatch livreur)
 */

import { getPrivateEnv, privateEnv } from '../env';

export async function sendSmsViaBrevo(phone: string, message: string): Promise<void> {
  const apiKey = getPrivateEnv('BREVO_API_KEY');
  const sender = privateEnv.BREVO_SMS_SENDER;

  if (!apiKey) {
    throw new Error(
      '❌ BREVO_API_KEY manquante. Configurez-la sur Vercel (Production/Preview/Development).'
    );
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
