import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach, hashPassword } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
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

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const hashedPassword = data.password ? await hashPassword(String(data.password)) : '';

        const swimmer = await sql`
            INSERT INTO "Swimmer" ("id", "name", "group", "username", "password", "status", "readiness", "xp", "level", "createdAt", "updatedAt")
            VALUES (
                ${crypto.randomUUID()},
                ${String(data.name)},
                ${String(data.group)},
                ${String(data.username)},
                ${hashedPassword || ''},
                ${data.status || 'Active'},
                ${Number(data.readiness) || 100},
                ${Number(data.xp) || 0},
                ${Number(data.level) || 1},
                NOW(),
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(swimmer[0], { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        // Fetch existing to preserve unspecified fields — avoids overwriting with null
        const existing = await sql`SELECT * FROM "Swimmer" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const current = existing[0];

        const fields: string[] = [];
        const values: any[] = [];

        const addField = (col: string, val: any) => {
            fields.push(`"${col}" = $${values.length + 1}`);
            values.push(val);
        };

        if (data.name !== undefined) addField('name', String(data.name));
        else addField('name', current.name);
        if (data.group !== undefined) addField('group', String(data.group));
        else addField('group', current.group);
        if (data.username !== undefined) addField('username', String(data.username));
        else addField('username', current.username);
        if (data.status !== undefined) addField('status', String(data.status));
        else addField('status', current.status);
        if (data.readiness !== undefined) addField('readiness', Number(data.readiness));
        else addField('readiness', current.readiness);
        if (data.xp !== undefined) addField('xp', Number(data.xp));
        else addField('xp', current.xp);
        if (data.level !== undefined) addField('level', Number(data.level));
        else addField('level', current.level);
        if (data.injuryNote === null || data.injuryNote === '') addField('injuryNote', null);
        else if (data.injuryNote !== undefined) addField('injuryNote', String(data.injuryNote));
        else addField('injuryNote', current.injuryNote);
        if (data.lastProfileUpdate === null) addField('lastProfileUpdate', null);
        else if (data.lastProfileUpdate !== undefined) addField('lastProfileUpdate', String(data.lastProfileUpdate));
        else addField('lastProfileUpdate', current.lastProfileUpdate);
        if (data.mainStroke === null) addField('mainStroke', null);
        else if (data.mainStroke !== undefined) addField('mainStroke', String(data.mainStroke));
        else addField('mainStroke', current.mainStroke);
        if (data.password && !String(data.password).includes(':')) {
            addField('password', await hashPassword(String(data.password)));
        }

        fields.push('"updatedAt" = NOW()');

        const query = `UPDATE "Swimmer" SET ${fields.join(', ')} WHERE "id" = $${values.length + 1} RETURNING *`;
        values.push(id);
        const result = await (sql as any).unsafe(query, values);

        return NextResponse.json(result[0], { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`DELETE FROM "Swimmer" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
