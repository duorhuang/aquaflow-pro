import { NextResponse } from 'next/server';
import { generateJWT, setSessionCookie, verifyPassword } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-handler';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

// Per-IP rate limiter for login — max 15 failed attempts per IP per 5 minutes
// NOTE: On Cloudflare Edge this is per-worker, not globally distributed.
// The higher limit (15 vs 10) provides margin for users routed across workers.
const ATTEMPTS: Map<string, number[]> = new Map();
const MAX_ATTEMPTS = 15;
const WINDOW_MS = 5 * 60 * 1000;

function getClientIP(request: Request): string {
  return request.headers.get('cf-connecting-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  let history = ATTEMPTS.get(ip) || [];
  // Evict expired entries
  history = history.filter(t => t > now - WINDOW_MS);
  if (history.length >= MAX_ATTEMPTS) {
    ATTEMPTS.set(ip, history);
    return true;
  }
  ATTEMPTS.set(ip, history);
  return false;
}

function recordAttempt(ip: string) {
  const now = Date.now();
  let history = ATTEMPTS.get(ip) || [];
  history = history.filter(t => t > now - WINDOW_MS);
  history.push(now);
  ATTEMPTS.set(ip, history);
}

async function getCoachUser(username: string) {
  const sql = getNeon();
  const rows = await sql`SELECT id, username, name, password FROM "CoachUser" WHERE username = ${username} LIMIT 1`;
  return rows[0] || null;
}

async function getSwimmer(username: string) {
  const sql = getNeon();
  const rows = await sql`SELECT id, username, name, password FROM "Swimmer" WHERE username = ${username} LIMIT 1`;
  return rows[0] || null;
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const clientIP = getClientIP(request);
    if (isRateLimited(clientIP)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in a few minutes.' },
        { status: 429, headers: V12_FINGERPRINT }
      );
    }

    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: V12_FINGERPRINT });
    }

    // Only record attempt after we know it's a real login attempt (not a validation error)
    // We don't record here — recordAfterAuth below records on failed auth only
    // to avoid penalizing users who mistype username but not password

    if (role === 'coach') {
      const coach = await getCoachUser(username);
      if (!coach) {
        recordAttempt(clientIP);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: V12_FINGERPRINT });
      }
      const valid = await verifyPassword(password, coach.password);
      if (!valid) {
        recordAttempt(clientIP);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: V12_FINGERPRINT });
      }
      const token = await generateJWT({ userId: coach.id, role: 'coach' });
      const response = NextResponse.json(
        { success: true, user: { id: coach.id, name: coach.name || coach.username, role: 'coach' } },
        { headers: V12_FINGERPRINT }
      );
      response.headers.set('Set-Cookie', setSessionCookie(token));
      return response;
    }

    if (role === 'athlete') {
      const swimmer = await getSwimmer(username);
      if (!swimmer) {
        recordAttempt(clientIP);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: V12_FINGERPRINT });
      }
      const valid = await verifyPassword(password, swimmer.password);
      if (!valid) {
        recordAttempt(clientIP);
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: V12_FINGERPRINT });
      }
      const token = await generateJWT({ userId: swimmer.id, role: 'athlete' });
      const response = NextResponse.json(
        { success: true, user: { id: swimmer.id, name: swimmer.name, role: 'athlete' } },
        { headers: V12_FINGERPRINT }
      );
      response.headers.set('Set-Cookie', setSessionCookie(token));
      return response;
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400, headers: V12_FINGERPRINT });
  });
}
