'use server';

import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { z } from 'zod';
import { adminDb } from './server/db';
import { setSellerSession } from './session';
import { sendSmsViaBrevo } from './notify/sms';

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 30;
const MAX_SENDS_PER_WINDOW = 5;
const SEND_WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;

const phoneSchema = z.string().regex(/^\+221\d{9}$/, 'Numéro de téléphone invalide.');

function hashCode(code: string): string {
  const pepper = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!pepper) throw new Error('Envoi du code impossible.');
  return createHash('sha256').update(`${pepper}:${code}`).digest('hex');
}

function codesMatch(expectedHex: string, actualHex: string): boolean {
  const expected = Buffer.from(expectedHex);
  const actual = Buffer.from(actualHex);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function sendOtp(phone: string): Promise<{ success: true; devCode?: string }> {
  const parsedPhone = phoneSchema.parse(phone);
  const db = adminDb();

  const windowStart = new Date(Date.now() - SEND_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { count, error: countError } = await db
    .from('otp_codes')
    .select('id', { count: 'exact', head: true })
    .eq('phone', parsedPhone)
    .gte('created_at', windowStart);

  if (countError) {
    console.error('[otp] quota', countError.code, countError.message, countError.hint);
    throw new Error('Impossible d’envoyer le code.');
  }
  if ((count ?? 0) >= MAX_SENDS_PER_WINDOW) {
    throw new Error('Trop de demandes. Réessayez dans quelques minutes.');
  }

  const cooldownStart = new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000).toISOString();
  const { data: recent, error: recentError } = await db
    .from('otp_codes')
    .select('id')
    .eq('phone', parsedPhone)
    .gte('created_at', cooldownStart)
    .limit(1)
    .maybeSingle();

  if (recentError) {
    console.error('[otp] cooldown', recentError.code, recentError.message, recentError.hint);
    throw new Error('Impossible d’envoyer le code.');
  }
  if (recent) throw new Error('Veuillez attendre avant de demander un nouveau code.');

  const code = randomInt(0, 1_000_000).toString().padStart(OTP_LENGTH, '0');
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

  const { data: inserted, error } = await db.from('otp_codes').insert({
    phone: parsedPhone,
    codeHash: hashCode(code),
    expires_at: expiresAt,
    attempts: 0,
  }).select('id').single();
  if (error) {
    console.error('[otp] insert', error.message);
    throw new Error('Impossible de générer le code.');
  }

  const message = `Votre code Doolé est : ${code}. Il expire dans ${OTP_TTL_MINUTES} minutes.`;
  try {
    await sendSmsViaBrevo(parsedPhone, message);
  } catch (err) {
    if (inserted?.id) await db.from('otp_codes').delete().eq('id', inserted.id);
    throw err;
  }

  const devCode = process.env.NODE_ENV !== 'production' ? code : undefined;
  return { success: true, devCode };
}

export async function verifyOtp(phone: string, code: string): Promise<{ success: true }> {
  const parsedPhone = phoneSchema.parse(phone);
  const parsedCode = z.string().regex(/^\d{6}$/).parse(code);
  const db = adminDb();

  const { data, error } = await db
    .from('otp_codes')
    .select('id, codeHash, expires_at, attempts')
    .eq('phone', parsedPhone)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[otp] lecture', error.message);
    throw new Error('Vérification impossible.');
  }
  if (!data || !data.codeHash) throw new Error("Aucun code n'a été envoyé à ce numéro. Recommencez.");
  if (new Date(data.expires_at) < new Date() || data.attempts >= MAX_ATTEMPTS) {
    await db.from('otp_codes').delete().eq('id', data.id);
    throw new Error('Ce code a expiré. Demandez-en un nouveau.');
  }
  if (!codesMatch(data.codeHash as string, hashCode(parsedCode))) {
    const attempts = (data.attempts as number) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await db.from('otp_codes').delete().eq('id', data.id);
      throw new Error('Trop de tentatives. Demandez un nouveau code.');
    }
    await db.from('otp_codes').update({ attempts }).eq('id', data.id);
    throw new Error('Code incorrect. Vérifiez et réessayez.');
  }

  await db.from('otp_codes').delete().eq('id', data.id);
  await setSellerSession(parsedPhone);
  return { success: true };
}
