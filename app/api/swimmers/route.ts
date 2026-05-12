import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach, hashPassword } from '@/lib/auth-api';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const swimmers = await sql`SELECT * FROM "Swimmer" ORDER BY "name" ASC`;

        const isCoach = (auth as any).role === 'coach';
        const safe = (swimmers || []).map((s: any) => {
            if (isCoach) return s;
            const { password, ...rest } = s;
            return rest;
        });
        return NextResponse.json(safe, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const hashedPassword = data.password ? await hashPassword(String(data.password)) : '';

        const swimmer = await sql`
            INSERT INTO "Swimmer" ("name", "group", "username", "password", "status", "readiness", "xp", "level", "createdAt", "updatedAt")
            VALUES (${String(data.name)}, ${String(data.group)}, ${String(data.username)}, ${hashedPassword || ''}, ${data.status || 'Active'}, ${Number(data.readiness) || 100}, ${Number(data.xp) || 0}, ${Number(data.level) || 1}, NOW(), NOW())
            RETURNING *
        `;
        return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        let hashedPassword: string | undefined;
        if (data.password && !String(data.password).includes(':')) {
            hashedPassword = await hashPassword(String(data.password));
        }

        const swimmer = await sql`
            UPDATE "Swimmer" SET
                "name" = ${data.name},
                "group" = ${data.group},
                "username" = ${data.username},
                "status" = ${data.status},
                "readiness" = ${data.readiness !== undefined ? Number(data.readiness) : null},
                "xp" = ${data.xp !== undefined ? Number(data.xp) : null},
                "level" = ${data.level !== undefined ? Number(data.level) : null},
                ${hashedPassword !== undefined ? sql`"password" = ${hashedPassword}` : sql`"password" = "password"`},
                "updatedAt" = NOW()
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`DELETE FROM "Swimmer" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
