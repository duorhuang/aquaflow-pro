import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { withApiHandler } from '@/lib/api-handler';
import { hashPassword, generateJWT, setSessionCookie } from '@/lib/auth';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return withApiHandler(async () => {
    const sql = getNeon();
    const existing = await sql`SELECT id FROM "CoachUser" LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: 'A coach already exists. Use login.' }, { status: 409 });

    const data = flattenPayload(await request.json());
    if (!data.username || !data.password || !data.name) {
      return NextResponse.json({ error: 'username, password, and name are required' }, { status: 400 });
    }

    const hashed = await hashPassword(String(data.password));
    const rows = await sql`INSERT INTO "CoachUser" ("id", "username", "passwordHash", "name", "createdAt") VALUES (${crypto.randomUUID()}, ${String(data.username)}, ${hashed}, ${String(data.name)}, NOW()) RETURNING *`;
    const coach = rows[0];
    const token = await generateJWT({ userId: coach.id, role: 'coach' });
    const body = { success: true, coach: { id: coach.id, username: coach.username, name: coach.name, role: 'coach' } };

    return NextResponse.json(body, {
      headers: { ...V12_FINGERPRINT, 'Set-Cookie': setSessionCookie(token) },
    });
  });
}
