/**
 * Service SMS centralisé via Brevo (utilisé par OTP et dispatch livreur)
 */

export async function sendSmsViaBrevo(phone: string, message: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SMS_SENDER || 'Doole';

  if (!apiKey) {
    throw new Error('BREVO_API_KEY manquante. Vérifiez la configuration du serveur.');
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
