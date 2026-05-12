import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const templates = await sql`
            SELECT * FROM "BlockTemplate"
            ORDER BY "category" ASC
        `;
        return NextResponse.json(templates || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const template = await sql`
            INSERT INTO "BlockTemplate" ("templateId", "name", "category", "type", "rounds", "items", "note", "createdAt", "updatedAt")
            VALUES (
                ${String(data.templateId)},
                ${String(data.name)},
                ${String(data.category)},
                ${String(data.type)},
                ${Number(data.rounds) || 1},
                ${data.items || []},
                ${data.note},
                NOW(),
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(template, { headers: V12_FINGERPRINT });
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

        const template = await sql`
            UPDATE "BlockTemplate" SET
                "name" = ${data.name},
                "category" = ${data.category},
                "type" = ${data.type},
                "rounds" = ${data.rounds !== undefined ? Number(data.rounds) : null},
                "items" = ${data.items},
                "note" = ${data.note},
                "updatedAt" = NOW()
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(template, { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "BlockTemplate" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
