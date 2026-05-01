import { hashPassword, generateJWT, setSessionCookie } from '@/lib/auth';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Create the first coach account. Only works when no CoachUser exists.
 */
export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const count = await prisma.coachUser.count();
    if (count > 0) {
      return Response.json({ error: 'Coach account already exists' }, { status: 409 });
    }

    const body = await request.json();
    const { username, password, name } = body;

    if (!username || !password) {
      return Response.json({ error: 'Username and password required' }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    const coach = await prisma.coachUser.create({
      data: {
        username,
        password: hashed,
        name: name || username,
      }
    });

    const token = await generateJWT({ userId: coach.id, role: 'coach' });
    return Response.json(
      { success: true, user: { id: coach.id, name: coach.name, role: 'coach' } },
      { headers: { 'Set-Cookie': setSessionCookie(token) } }
    );
  } catch (error: any) {
    console.error('[REGISTER_COACH_ERROR]', error.message);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
