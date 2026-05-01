import { hashPassword, verifyPassword, generateJWT, setSessionCookie } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, role } = body;

    if (!username || !password || !role) {
      return Response.json({ error: 'Missing fields' }, { status: 400 });
    }

    const prisma = getPrisma();

    if (role === 'coach') {
      const coach = await prisma.coachUser.findUnique({ where: { username } });
      if (!coach) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const valid = await verifyPassword(password, coach.password);
      if (!valid) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const token = await generateJWT({ userId: coach.id, role: 'coach' });
      return Response.json(
        { success: true, user: { id: coach.id, name: coach.name || coach.username, role: 'coach' } },
        { headers: { 'Set-Cookie': setSessionCookie(token) } }
      );
    }

    if (role === 'athlete') {
      const swimmer = await prisma.swimmer.findFirst({
        where: { username }
      });
      if (!swimmer) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const valid = await verifyPassword(password, swimmer.password);
      if (!valid) {
        return Response.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      const token = await generateJWT({ userId: swimmer.id, role: 'athlete' });
      return Response.json(
        { success: true, user: { id: swimmer.id, name: swimmer.name, role: 'athlete' } },
        { headers: { 'Set-Cookie': setSessionCookie(token) } }
      );
    }

    return Response.json({ error: 'Invalid role' }, { status: 400 });
  } catch (error: any) {
    console.error('[AUTH_LOGIN_ERROR]', error.message);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
