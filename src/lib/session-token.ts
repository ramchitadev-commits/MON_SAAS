// Jeton de session vérifiable dans le middleware (Edge) et sur le serveur Node.
// Signé avec la clé service-role, qui ne quitte jamais le serveur.

export const SESSION_COOKIE = 'doole_session';
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionPayload = {
  phone: string;
  exp: number;
};

function sessionSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!secret) throw new Error('Session indisponible : clé serveur manquante.');
  return secret;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4));
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signSession(phone: string, now = Date.now()): Promise<string> {
  const payload: SessionPayload = { phone, exp: now + TTL_MS };
  const body = bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const key = await hmacKey(sessionSecret());
  const signature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  );
  return `${body}.${bytesToBase64Url(signature)}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature || token.split('.').length !== 2) return null;

  try {
    const key = await hmacKey(sessionSecret());
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      asBuffer(base64UrlToBytes(signature)),
      new TextEncoder().encode(body)
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body))) as SessionPayload;
    if (!payload || typeof payload.phone !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp < Date.now()) return null;
    if (!/^\+221\d{9}$/.test(payload.phone)) return null;
    return payload;
  } catch {
    return null;
  }
}
