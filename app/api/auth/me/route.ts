import { NextResponse } from 'next/server';
import { verifyJWT, getCookieFromRequest } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-handler';
import { V12_FINGERPRINT } from '@/lib/utils';
import { getNeon } from '@/lib/db-pool';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const token = getCookieFromRequest(request, 'aquaflow_session');
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: V12_FINGERPRINT });

    const payload = await verifyJWT(token);
    if (!payload) return NextResponse.json({ error: 'Invalid session' }, { status: 401, headers: V12_FINGERPRINT });

    const sql = getNeon();
    // Robust warmup — handles Neon cold starts with retry loop.
    const MAX_WARMUP_RETRIES = 3;
    const WARMUP_TIMEOUT = 10000; // 10s per attempt
    const WARMUP_DELAY = 3000; // 3s between attempts
    let isWarmed = false;
    for (let attempt = 0; attempt < MAX_WARMUP_RETRIES; attempt++) {
      try {
        const warm = sql`SELECT 1`;
        await Promise.race([
          warm,
          new Promise((_, reject) => setTimeout(() => reject(new Error('DB warmup timeout')), WARMUP_TIMEOUT)),
        ]);
        isWarmed = true;
        break; // DB is awake
      } catch (e: any) {
        console.warn(`[me] warmDb attempt ${attempt + 1} failed:`, e.message);
        if (attempt === MAX_WARMUP_RETRIES - 1) {
          return NextResponse.json({ error: 'Database still waking up' }, { status: 503, headers: V12_FINGERPRINT });
        }
        await new Promise(r => setTimeout(r, WARMUP_DELAY));
      }
    }

    if (payload.role === 'coach') {
      const rows = await sql`SELECT id, name, username, "createdAt" FROM "CoachUser" WHERE id = ${payload.userId} LIMIT 1`;
      const coach = rows[0];
      if (!coach) return NextResponse.json({ error: 'User not found' }, { status: 401, headers: V12_FINGERPRINT });
      return NextResponse.json({ ...coach, role: 'coach' }, { headers: V12_FINGERPRINT });
    }

    if (payload.role === 'athlete') {
      const rows = await sql`SELECT id, name, username, "group", status, xp, "totalXp", balance, level, gender, "equippedItems", "currentStreak", "bestTimes", "injuries", "readiness", "injuryNote", "injuryBodyMap", "injuryImageUrl", "lastProfileUpdate", "mainStroke" FROM "Swimmer" WHERE id = ${payload.userId} LIMIT 1`;
      const swimmer = rows[0];
      if (!swimmer) return NextResponse.json({ error: 'User not found' }, { status: 401, headers: V12_FINGERPRINT });
      if (swimmer.bestTimes && typeof swimmer.bestTimes === 'string') {
        try { swimmer.bestTimes = JSON.parse(swimmer.bestTimes); } catch {}
      }
      if (swimmer.injuries && typeof swimmer.injuries === 'string') {
        try { swimmer.injuries = JSON.parse(swimmer.injuries); } catch {}
      }
      if (swimmer.equippedItems && typeof swimmer.equippedItems === 'string') {
        try { swimmer.equippedItems = JSON.parse(swimmer.equippedItems); } catch {}
      }
      if (swimmer.injuryBodyMap && typeof swimmer.injuryBodyMap === 'string') {
        try { swimmer.injuryBodyMap = JSON.parse(swimmer.injuryBodyMap); } catch {}
      }
      return NextResponse.json({ ...swimmer, role: 'athlete' }, { headers: V12_FINGERPRINT });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 401, headers: V12_FINGERPRINT });
  });
}
