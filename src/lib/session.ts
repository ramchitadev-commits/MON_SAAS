import 'server-only';

import { cookies } from 'next/headers';
import { SESSION_COOKIE, signSession, verifySession } from './session-token';

const MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export async function getSellerPhone(): Promise<string | null> {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  return session?.phone ?? null;
}

export async function requireSellerPhone(): Promise<string> {
  const phone = await getSellerPhone();
  if (!phone) throw new Error('Connexion requise.');
  return phone;
}

export async function setSellerSession(phone: string): Promise<void> {
  const token = await signSession(phone);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSellerSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
