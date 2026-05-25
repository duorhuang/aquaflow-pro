import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireCoach, requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const performances = await sql`
            SELECT "PerformanceRecord".*,
                   row_to_json("Swimmer") as swimmer
            FROM "PerformanceRecord"
            LEFT JOIN "Swimmer" ON "PerformanceRecord"."swimmerId" = "Swimmer"."id"
            ORDER BY "PerformanceRecord"."date" DESC
        `;

        const normalized = (performances || []).map((p: any) => {
            const swimmer = p.swimmer && Object.keys(p.swimmer).length > 1 ? p.swimmer : null;
            return { ...p, swimmer };
        });

        return NextResponse.json(normalized, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const record = await sql`
            INSERT INTO "PerformanceRecord" ("id", "swimmerId", "event", "time", "date", "isPB", "improvement", "meetName", "notes", "createdAt")
            VALUES (
                ${crypto.randomUUID()},
                ${String(data.swimmerId)},
                ${String(data.event)},
                ${String(data.time)},
                ${String(data.date)},
                ${Boolean(data.isPB)},
                ${data.improvement !== undefined ? Number(data.improvement) : null},
                ${data.meetName},
                ${data.notes},
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(record[0], { headers: V12_FINGERPRINT });
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

        // Fetch existing record to preserve unspecified fields
        const existing = await sql`SELECT * FROM "PerformanceRecord" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const current = existing[0];

        const record = await sql`
            UPDATE "PerformanceRecord" SET
                "event" = ${data.event ?? current.event},
                "time" = ${data.time ?? current.time},
                "date" = ${data.date ?? current.date},
                "isPB" = ${data.isPB !== undefined ? Boolean(data.isPB) : current.isPB},
                "improvement" = ${data.improvement !== undefined ? Number(data.improvement) : current.improvement},
                "meetName" = ${data.meetName !== undefined ? data.meetName : current.meetName},
                "notes" = ${data.notes !== undefined ? data.notes : current.notes}
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(record[0], { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

        await sql`DELETE FROM "PerformanceRecord" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
