import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { withApiHandler } from '@/lib/api-handler';
import { generateJWT, setSessionCookie, verifyPassword } from '@/lib/auth';
import { getNeon } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry) { loginAttempts.set(key, { count: 1, resetAt: now + 300000 }); return true; }
  if (now > entry.resetAt) { loginAttempts.set(key, { count: 1, resetAt: now + 300000 }); return true; }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!getRateLimit(ip)) return NextResponse.json({ error: 'Too many attempts. Try again in 5 minutes.' }, { status: 429, headers: V12_FINGERPRINT });

    const sql = getNeon();
    const data = flattenPayload(await request.json());
    if (!data.username || !data.password) return NextResponse.json({ error: 'username and password are required' }, { status: 400 });

    const coaches = await sql`SELECT * FROM "CoachUser" WHERE username = ${String(data.username)}`;
    for (const coach of coaches) {
      if (await verifyPassword(String(data.password), coach.password)) {
        const token = await generateJWT({ userId: coach.id, role: 'coach' });
        return NextResponse.json({
          success: true,
          user: { id: coach.id, name: coach.name, role: 'coach' },
        }, { headers: { ...V12_FINGERPRINT, 'Set-Cookie': setSessionCookie(token) } });
      }
    }

    const swimmers = await sql`SELECT * FROM "Swimmer" WHERE username = ${String(data.username)}`;
    for (const swimmer of swimmers) {
      if (await verifyPassword(String(data.password), swimmer.password)) {
        const token = await generateJWT({ userId: swimmer.id, role: 'athlete' });
        return NextResponse.json({
          success: true,
          user: { id: swimmer.id, name: swimmer.name, role: 'athlete' },
        }, { headers: { ...V12_FINGERPRINT, 'Set-Cookie': setSessionCookie(token) } });
      }
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: V12_FINGERPRINT });
  });
}
