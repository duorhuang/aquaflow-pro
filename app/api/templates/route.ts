import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const templates = await sql`
            SELECT * FROM "BlockTemplate"
            ORDER BY "category" ASC
        `;
        // Parse JSON fields
        templates.forEach((t: any) => {
            if (t.items && typeof t.items === 'string') {
                try { t.items = JSON.parse(t.items); } catch { t.items = []; }
            }
        });
        return NextResponse.json(templates || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const itemsJson = JSON.stringify(data.items || []);

        // Prevent duplicate templateId
        const existing = await sql`SELECT * FROM "BlockTemplate" WHERE "templateId" = ${String(data.templateId)} LIMIT 1`;
        if (existing.length > 0) {
            return NextResponse.json({ error: 'Template ID already exists' }, { status: 409, headers: V12_FINGERPRINT });
        }

        const template = await sql`
            INSERT INTO "BlockTemplate" ("id", "templateId", "name", "category", "type", "rounds", "items", "note", "createdAt", "updatedAt")
            VALUES (
                ${crypto.randomUUID()},
                ${String(data.templateId)},
                ${String(data.name)},
                ${String(data.category)},
                ${String(data.type)},
                ${Number(data.rounds) || 1},
                ${itemsJson},
                ${data.note},
                NOW(),
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(template[0], { headers: V12_FINGERPRINT });
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

        // Fetch existing to preserve unspecified fields
        const existing = await sql`SELECT * FROM "BlockTemplate" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const current = existing[0];

        const itemsJson = data.items !== undefined ? JSON.stringify(data.items) : current.items;

        const template = await sql`
            UPDATE "BlockTemplate" SET
                "name" = ${data.name ?? current.name},
                "category" = ${data.category ?? current.category},
                "type" = ${data.type ?? current.type},
                "rounds" = ${data.rounds !== undefined ? Number(data.rounds) : current.rounds},
                "items" = ${itemsJson},
                "note" = ${data.note !== undefined ? data.note : current.note},
                "updatedAt" = NOW()
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(template[0], { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "BlockTemplate" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
