import { verifyJWT, getCookieFromRequest } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const token = getCookieFromRequest(request, 'aquaflow_session');
    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return Response.json({ error: 'Invalid session' }, { status: 401 });
    }

    const prisma = getPrisma();

    if (payload.role === 'coach') {
      const coach = await prisma.coachUser.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, username: true, createdAt: true }
      });
      if (!coach) return Response.json({ error: 'User not found' }, { status: 401 });
      return Response.json({ ...coach, role: 'coach' });
    }

    if (payload.role === 'athlete') {
      const swimmer = await prisma.swimmer.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, username: true, group: true, status: true, xp: true, level: true, currentStreak: true }
      });
      if (!swimmer) return Response.json({ error: 'User not found' }, { status: 401 });
      return Response.json({ ...swimmer, role: 'athlete' });
    }

    return Response.json({ error: 'Invalid role' }, { status: 401 });
  } catch (error: any) {
    console.error('[AUTH_ME_ERROR]', error.message);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
