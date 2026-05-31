/**
 * Password hashing utilities — PBKDF2-SHA256 via Web Crypto API.
 * JWT utilities are in lib/jwt.ts — re-exported below for backward compatibility.
 */

export { generateJWT, verifyJWT, getCookieFromRequest, setSessionCookie, clearSessionCookie } from './jwt';
export type { JWTPayload } from './jwt';

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
  // SECURITY: Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(hashHex, expectedHash);
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}
