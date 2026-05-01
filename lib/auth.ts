/**
 * Edge-compatible authentication utilities.
 * Uses Web Crypto API (crypto.subtle) for HMAC-SHA256 — no native deps required.
 */

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

/**
 * Hash a password using PBKDF2-SHA256 with a random salt.
 * Returns format: salt:iterations:hash (all hex)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const iterations = 100_000;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${iterations}:${hashHex}`;
}

/**
 * Verify a password against a stored hash.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, iterationsStr, expectedHash] = stored.split(':');
  if (!saltHex || !iterationsStr || !expectedHash) return false;
  const iterations = parseInt(iterationsStr, 10);

  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(h => parseInt(h, 16)));

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    key,
    256
  );

  const hashHex = Array.from(new Uint8Array(derivedBits)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === expectedHash;
}

export interface JWTPayload {
  userId: string;
  role: 'coach' | 'athlete';
  exp: number;
}

/**
 * Create a signed JWT string.
 */
export async function generateJWT(payload: Omit<JWTPayload, 'exp'>): Promise<string> {
  const secret = getSecret();
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
  const jwtPayload: JWTPayload = { ...payload, exp };
  const data = btoa(JSON.stringify(jwtPayload));
  const signature = await hmacSign(data, secret);
  return `${data}.${signature}`;
}

/**
 * Verify and decode a JWT. Returns null if invalid or expired.
 */
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

/**
 * Extract JWT from request cookie header.
 */
export function getCookieFromRequest(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;)\\s*${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Create a Set-Cookie header value for the session cookie.
 */
export function setSessionCookie(token: string, maxAge = 7 * 24 * 60 * 60): string {
  return `aquaflow_session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; Secure`;
}

/**
 * Create a Set-Cookie header value to clear the session cookie.
 */
export function clearSessionCookie(): string {
  return 'aquaflow_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure';
}
