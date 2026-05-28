/**
 * Shared JWT utilities — single source of truth for signing, verification, and cookie management.
 * Uses only Web Crypto API (crypto.subtle), available in both Edge Runtime and Edge Middleware.
 */

export interface JWTPayload {
  userId: string;
  role: 'coach' | 'athlete';
  exp: number;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  return secret;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(data)
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function hmacVerify(data: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  return crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    new TextEncoder().encode(data)
  );
}

export async function generateJWT(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const secret = getSecret();
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const jwtPayload: JWTPayload = { ...payload, exp };
  const data = btoa(JSON.stringify(jwtPayload));
  const signature = await hmacSign(data, secret);
  return `${data}.${signature}`;
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const secret = getSecret();
    const valid = await hmacVerify(data, signature, secret);
    if (!valid) return null;
    const payload: JWTPayload = JSON.parse(atob(data));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getCookieFromRequest(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim()).filter(Boolean).map(c => {
      const idx = c.indexOf('=');
      return idx === -1 ? [c, ''] : [c.slice(0, idx), decodeURIComponent(c.slice(idx + 1))];
    })
  );
  return cookies[name];
}

export function setSessionCookie(token: string, maxAge = 7 * 24 * 60 * 60): string {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [`aquaflow_session=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Strict', `Max-Age=${maxAge}`];
  if (isProd) parts.push('Domain=.sportsflow.best', 'Secure');
  return parts.join('; ');
}

export function clearSessionCookie(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = ['aquaflow_session=', 'Path=/', 'HttpOnly', 'SameSite=Strict', 'Max-Age=0', 'Expires=Thu, 01 Jan 1970 00:00:00 GMT'];
  if (isProd) parts.push('Domain=.sportsflow.best', 'Secure');
  return parts.join('; ');
}
