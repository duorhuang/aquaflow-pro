import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { withApiHandler } from '@/lib/api-handler';
import { generateJWT, verifyPassword, hashPassword } from '@/lib/auth';
import { getNeon } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';

// In-memory rate limiter with automatic cleanup
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

// Periodically clean up expired entries to prevent memory leak
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of loginAttempts.entries()) {
        if (now > entry.resetAt) loginAttempts.delete(key);
    }
}, 60000); // Clean every minute

function getRateLimit(key: string): boolean {
    const now = Date.now();
    const entry = loginAttempts.get(key);
    if (!entry) { loginAttempts.set(key, { count: 1, resetAt: now + 300000 }); return true; }
    if (now > entry.resetAt) { loginAttempts.set(key, { count: 1, resetAt: now + 300000 }); return true; }
    if (entry.count >= 10) return false;
    entry.count++;
    return true;
}

/**
 * Warm up the Neon DB connection. Returns true if DB is responsive.
 * Called before any DB query to handle cold starts gracefully.
 */
async function warmDb(): Promise<boolean> {
    try {
        const sql = getNeon();
        await sql`SELECT 1`;
        return true;
    } catch {
        return false;
    }
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const host = request.headers.get('host') || '';
        const rawIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
        const ip = rawIp.includes(',') ? rawIp.split(',')[0].trim() : rawIp;
        if (!getRateLimit(ip)) return NextResponse.json({ error: 'Too many attempts. Try again in 5 minutes.' }, { status: 429, headers: V12_FINGERPRINT });

        // Warm up DB before processing — handles Neon cold starts
        const dbReady = await warmDb();
        if (!dbReady) {
            return NextResponse.json(
                { error: 'Database is waking up. Please try again in a moment.' },
                { status: 503, headers: { ...V12_FINGERPRINT, 'Retry-After': '5' } }
            );
        }

        const sql = getNeon();
        const data = flattenPayload(await request.json());
        if (!data.username || !data.password) return NextResponse.json({ error: 'username and password are required' }, { status: 400 });

        // SECURITY: Always verify against BOTH coaches and swimmers to prevent
        // timing attacks that reveal whether a username exists in one table.
        const coaches = await sql`SELECT * FROM "CoachUser" WHERE username = ${String(data.username)}`;
        let coachMatch = false;
        let coachRoleMismatch = false;
        for (const coach of coaches) {
            if (await verifyPassword(String(data.password), coach.password)) {
                coachMatch = true;
                if (data.role && data.role !== 'coach') {
                    coachRoleMismatch = true;
                    break;
                }
                // Auto-rehash if password was hashed with fewer than 100,000 iterations
                const [, iterationsStr] = coach.password.split(':');
                if (parseInt(iterationsStr, 10) < 100000) {
                    try {
                        const newHash = await hashPassword(String(data.password));
                        await sql`UPDATE "CoachUser" SET "password" = ${newHash} WHERE "id" = ${coach.id}`;
                    } catch (err) {
                        console.error('Failed to auto-rehash coach password:', err);
                    }
                }
                const token = await generateJWT({ userId: coach.id, role: 'coach' });
                const response = NextResponse.json({
                    success: true,
                    user: { id: coach.id, name: coach.name, role: 'coach' },
                }, { headers: V12_FINGERPRINT });
                const isProd = process.env.NODE_ENV === 'production';
                response.cookies.set('aquaflow_session', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                    secure: isProd,
                    domain: isProd && host.includes('sportsflow.best') ? '.sportsflow.best' : undefined,
                });
                return response;
            }
        }

        const swimmers = await sql`SELECT * FROM "Swimmer" WHERE username = ${String(data.username)}`;
        let swimmerMatch = false;
        let swimmerRoleMismatch = false;
        for (const swimmer of swimmers) {
            if (await verifyPassword(String(data.password), swimmer.password)) {
                swimmerMatch = true;
                if (data.role && data.role !== 'athlete') {
                    swimmerRoleMismatch = true;
                    break;
                }
                // Auto-rehash if password was hashed with fewer than 100,000 iterations
                const [, iterationsStr] = swimmer.password.split(':');
                if (parseInt(iterationsStr, 10) < 100000) {
                    try {
                        const newHash = await hashPassword(String(data.password));
                        await sql`UPDATE "Swimmer" SET "password" = ${newHash} WHERE "id" = ${swimmer.id}`;
                    } catch (err) {
                        console.error('Failed to auto-rehash swimmer password:', err);
                    }
                }
                const token = await generateJWT({ userId: swimmer.id, role: 'athlete' });
                const response = NextResponse.json({
                    success: true,
                    user: { id: swimmer.id, name: swimmer.name, role: 'athlete' },
                }, { headers: V12_FINGERPRINT });
                const isProd = process.env.NODE_ENV === 'production';
                response.cookies.set('aquaflow_session', token, {
                    httpOnly: true,
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 7 * 24 * 60 * 60,
                    secure: isProd,
                    domain: isProd && host.includes('sportsflow.best') ? '.sportsflow.best' : undefined,
                });
                return response;
            }
        }

        if (coachRoleMismatch) {
            return NextResponse.json({ error: '该账号是教练账号，请切换至教练端登录' }, { status: 403, headers: V12_FINGERPRINT });
        }
        if (swimmerRoleMismatch) {
            return NextResponse.json({ error: '该账号是队员账号，请切换至队员端登录' }, { status: 403, headers: V12_FINGERPRINT });
        }

        // SECURITY: Dummy verification to prevent timing-based username enumeration
        // (takes same time regardless of whether user exists)
        if (!coachMatch && !swimmerMatch) {
            await verifyPassword(String(data.password), 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa:100000:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: V12_FINGERPRINT });
    });
}
