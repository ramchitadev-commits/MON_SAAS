'use server';

import { z } from 'zod';
import { supabase } from './supabase';
import { sendSmsViaBrevo } from './notify/sms';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;

const phoneSchema = z.string().regex(/^\+221\d{9}$/, 'Numéro de téléphone invalide.');

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString().slice(0, OTP_LENGTH);
}

// Envoie un code OTP par SMS via Brevo et le stocke en base pour vérification.
export async function sendOtp(phone: string): Promise<{ success: true }> {
  const parsedPhone = phoneSchema.parse(phone);

  // Anti-spam : refuse un nouvel envoi si un code encore valide a été créé récemment.
  const cooldownStart = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000).toISOString();
  const { data: recent } = await supabase
    .from('otp_codes')
    .select('id')
    .eq('phone', parsedPhone)
    .gte('createdAt', cooldownStart)
    .limit(1)
    .maybeSingle();

  if (recent) {
    throw new Error('Veuillez attendre avant de demander un nouveau code.');
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  const { error } = await supabase.from('otp_codes').insert({
    phone: parsedPhone,
    code,
    expiresAt,
  });
  if (error) throw new Error(`Impossible de générer le code : ${error.message}`);

  const message = `Votre code Doolé est : ${code}. Il expire dans ${OTP_TTL_MINUTES} minutes.`;
  await sendSmsViaBrevo(parsedPhone, message);

  return { success: true };
}

// Vérifie le code saisi contre le dernier code généré pour ce numéro.
export async function verifyOtp(phone: string, code: string): Promise<{ success: true }> {
  const parsedPhone = phoneSchema.parse(phone);
  const parsedCode = z.string().regex(/^\d{6}$/).parse(code);

  const { data, error } = await supabase
    .from('otp_codes')
    .select('id, code, expiresAt')
    .eq('phone', parsedPhone)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Vérification impossible : ${error.message}`);
  if (!data) throw new Error("Aucun code n'a été envoyé à ce numéro. Recommencez.");
  if (new Date(data.expiresAt) < new Date()) throw new Error('Ce code a expiré. Demandez-en un nouveau.');
  if (data.code !== parsedCode) throw new Error('Code incorrect. Vérifiez et réessayez.');

  // Empêche la réutilisation du même code.
  await supabase.from('otp_codes').delete().eq('id', data.id);

  return { success: true };
}
