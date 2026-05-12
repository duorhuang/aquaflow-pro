import { NextResponse } from 'next/server';
import { generateJWT, setSessionCookie, verifyPassword } from '@/lib/auth';
import { withApiHandler } from '@/lib/api-handler';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

async function getCoachUser(username: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id, username, name, password FROM "CoachUser" WHERE username = ${username} LIMIT 1`;
  return rows[0] || null;
}

async function getSwimmer(username: string) {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT id, username, name, password FROM "Swimmer" WHERE username = ${username} LIMIT 1`;
  return rows[0] || null;
}

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (role === 'coach') {
      const coach = await getCoachUser(username);
      if (!coach) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const valid = await verifyPassword(password, coach.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const token = await generateJWT({ userId: coach.id, role: 'coach' });
      const response = NextResponse.json(
        { success: true, user: { id: coach.id, name: coach.name || coach.username, role: 'coach' } }
      );
      response.headers.set('Set-Cookie', setSessionCookie(token));
      return response;
    }

    if (role === 'athlete') {
      const swimmer = await getSwimmer(username);
      if (!swimmer) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const valid = await verifyPassword(password, swimmer.password);
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const token = await generateJWT({ userId: swimmer.id, role: 'athlete' });
      const response = NextResponse.json(
        { success: true, user: { id: swimmer.id, name: swimmer.name, role: 'athlete' } }
      );
      response.headers.set('Set-Cookie', setSessionCookie(token));
      return response;
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  });
}
