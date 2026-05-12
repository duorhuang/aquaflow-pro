import { NextResponse } from 'next/server';
import { verifyJWT, getCookieFromRequest } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-handler';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return withApiHandler(async () => {
    const token = getCookieFromRequest(request, 'aquaflow_session');
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);

    if (payload.role === 'coach') {
      const rows = await sql`SELECT id, name, username, "createdAt" FROM "CoachUser" WHERE id = ${payload.userId} LIMIT 1`;
      const coach = rows[0];
      if (!coach) return NextResponse.json({ error: 'User not found' }, { status: 401 });
      return NextResponse.json({ ...coach, role: 'coach' });
    }

    if (payload.role === 'athlete') {
      const rows = await sql`SELECT id, name, username, "group", status, xp, level, "currentStreak" FROM "Swimmer" WHERE id = ${payload.userId} LIMIT 1`;
      const swimmer = rows[0];
      if (!swimmer) return NextResponse.json({ error: 'User not found' }, { status: 401 });
      return NextResponse.json({ ...swimmer, role: 'athlete' });
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 401 });
  });
}
