import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireCoach, requireAnyAuth } from '@/lib/auth-api';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const performances = await sql`
            SELECT "PerformanceRecord".*,
                   row_to_json("Swimmer") as swimmer
            FROM "PerformanceRecord"
            LEFT JOIN "Swimmer" ON "PerformanceRecord"."swimmerId" = "Swimmer"."id"
            ORDER BY "PerformanceRecord"."date" DESC
        `;

        const normalized = (performances || []).map((p: any) => ({
            ...p,
            swimmer: p.swimmer === null ? null : p.swimmer,
        }));

        return NextResponse.json(normalized, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const record = await sql`
            INSERT INTO "PerformanceRecord" ("swimmerId", "event", "time", "date", "isPB", "meetName", "notes", "createdAt")
            VALUES (
                ${String(data.swimmerId)},
                ${String(data.event)},
                ${String(data.time)},
                ${String(data.date)},
                ${Boolean(data.isPB)},
                ${data.meetName},
                ${data.notes},
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(record, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

        const data = flattenPayload(await request.json());

        const record = await sql`
            UPDATE "PerformanceRecord" SET
                "event" = ${data.event},
                "time" = ${data.time},
                "date" = ${data.date},
                "isPB" = ${data.isPB},
                "meetName" = ${data.meetName},
                "notes" = ${data.notes}
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(record, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

        await sql`DELETE FROM "PerformanceRecord" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
