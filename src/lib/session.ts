import { cookies } from 'next/headers';
import type { SessionPayload } from './types';

export const SESSION_COOKIE_NAME = 'wiredlc_session';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 дней

function getAuthSecretString(): string {
  return (
    process.env.AUTH_SECRET ||
    'wiredlc-dev-fallback-secret-change-in-production-2026'
  );
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(): Promise<CryptoKey> {
  const raw = new TextEncoder().encode(getAuthSecretString());
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function signSessionToken(
  payload: Omit<SessionPayload, 'iat' | 'exp'>,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    sub: payload.sub,
    username: payload.username,
    email: payload.email,
    role: payload.role,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(fullPayload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await importHmacKey();
  const sigBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signingInput));
  const sigB64 = base64UrlEncode(new Uint8Array(sigBuffer));

  return `${signingInput}.${sigB64}`;
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const key = await importHmacKey();
    const encoder = new TextEncoder();
    const sigBytes = base64UrlDecode(sigB64);

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes.buffer as ArrayBuffer,
      encoder.encode(`${headerB64}.${payloadB64}`),
    );
    if (!valid) return null;

    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadB64));
    const payload = JSON.parse(payloadJson) as Partial<SessionPayload>;

    if (
      typeof payload.sub !== 'string' ||
      typeof payload.username !== 'string' ||
      typeof payload.email !== 'string' ||
      (payload.role !== 'user' && payload.role !== 'admin')
    ) {
      return null;
    }

    if (typeof payload.exp === 'number' && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      sub: payload.sub,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export async function getServerSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function getSessionCookieOptions(isHttps: boolean) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: isHttps,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
