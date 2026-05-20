import { NextResponse } from 'next/server';
import { verifyJWT, getCookieFromRequest } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-handler';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const token = getCookieFromRequest(request, 'aquaflow_session');
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401, headers: V12_FINGERPRINT });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401, headers: V12_FINGERPRINT });
    }

    const sql = getNeon();

    if (payload.role === 'coach') {
      const rows = await sql`SELECT id, name, username, "createdAt" FROM "CoachUser" WHERE id = ${payload.userId} LIMIT 1`;
      const coach = rows[0];
      if (!coach) return NextResponse.json({ error: 'User not found' }, { status: 401, headers: V12_FINGERPRINT });
      return NextResponse.json({ ...coach, role: 'coach' }, { headers: V12_FINGERPRINT });
    }

    if (payload.role === 'athlete') {
      const rows = await sql`SELECT id, name, username, "group", status, xp, level, "currentStreak", "bestTimes", "injuries", "readiness", "injuryNote", "lastProfileUpdate", "mainStroke" FROM "Swimmer" WHERE id = ${payload.userId} LIMIT 1`;
      const swimmer = rows[0];
      if (!swimmer) return NextResponse.json({ error: 'User not found' }, { status: 401, headers: V12_FINGERPRINT });
      // Parse JSON fields
      if (swimmer.bestTimes && typeof swimmer.bestTimes === 'string') {
        try { swimmer.bestTimes = JSON.parse(swimmer.bestTimes); } catch {}
      }
      if (swimmer.injuries && typeof swimmer.injuries === 'string') {
        try { swimmer.injuries = JSON.parse(swimmer.injuries); } catch {}
      }
      return NextResponse.json({ ...swimmer, role: 'athlete' }, { headers: V12_FINGERPRINT });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 401, headers: V12_FINGERPRINT });
  });
}
