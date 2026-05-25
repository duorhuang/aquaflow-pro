import { NextResponse } from 'next/server';
import { flattenPayload } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import { withApiHandler } from '@/lib/api-handler';
import * as crypto from 'crypto';
export async function POST(request: Request) {
    return withApiHandler(async () => {
        const sql = getNeon();
        const data = flattenPayload(await request.json());
        const { username, password, name, inviteCode } = data;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
        }
        
        const validInviteCode = process.env.COACH_INVITE_CODE || 'duor2024';
        if (inviteCode !== validInviteCode) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 403 });
        }

        const hashedPassword = await hashPassword(String(password));
        
        const existing = await sql`SELECT id FROM "CoachUser" WHERE "username" = ${String(username)}`;
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Username taken' }, { status: 400 });
        }

        const user = await sql`
            INSERT INTO "CoachUser" ("id", "username", "password", "name", "createdAt")
            VALUES (${crypto.randomUUID()}, ${String(username)}, ${hashedPassword}, ${name ? String(name) : null}, NOW())
            RETURNING id, username, name
        `;

        return NextResponse.json(user[0]);
    });
}
