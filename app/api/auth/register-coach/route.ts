import { hashPassword, generateJWT, setSessionCookie } from '@/lib/auth';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

/**
 * Create the first coach account. Only works when no CoachUser exists.
 */
export async function POST(request: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const count = await sql`SELECT COUNT(*) FROM "CoachUser"`;
    if (parseInt(count[0].count, 10) > 0) {
      return Response.json({ error: 'Coach account already exists' }, { status: 409 });
    }

    const body = await request.json();
    const { username, password, name } = body;

    if (!username || !password) {
      return Response.json({ error: 'Username and password required' }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    const coach = await sql`
      INSERT INTO "CoachUser" ("username", "password", "name", "createdAt")
      VALUES (${username}, ${hashed}, ${name || username}, NOW())
      RETURNING *
    `;
    const inserted = coach[0];

    const token = await generateJWT({ userId: inserted.id, role: 'coach' });
    return Response.json(
      { success: true, user: { id: inserted.id, name: inserted.name, role: 'coach' } },
      { headers: { 'Set-Cookie': setSessionCookie(token) } }
    );
  } catch (error: any) {
    console.error('[REGISTER_COACH_ERROR]', error.message);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
