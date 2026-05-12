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
        const attendance = await sql`
            SELECT "AttendanceRecord".*,
                   row_to_json("Swimmer") as swimmer
            FROM "AttendanceRecord"
            LEFT JOIN "Swimmer" ON "AttendanceRecord"."swimmerId" = "Swimmer"."id"
            ORDER BY "AttendanceRecord"."date" DESC
        `;

        // Normalize the nested swimmer object
        const normalized = (attendance || []).map((a: any) => ({
            ...a,
            swimmer: a.swimmer === null ? null : a.swimmer,
        }));

        return NextResponse.json(normalized, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const id = data.id || '';

        let record: any;
        if (id) {
            const existing = await sql`SELECT * FROM "AttendanceRecord" WHERE "id" = ${id}`;
            if (existing.length > 0) {
                record = await sql`
                    UPDATE "AttendanceRecord" SET
                        "status" = ${String(data.status || 'Present')},
                        "timestamp" = ${data.timestamp || new Date().toISOString()}
                    WHERE "id" = ${id}
                    RETURNING *
                `;
            } else {
                record = await sql`
                    INSERT INTO "AttendanceRecord" ("id", "date", "swimmerId", "status", "timestamp", "createdAt")
                    VALUES (${id}, ${String(data.date)}, ${String(data.swimmerId)}, ${String(data.status || 'Present')}, ${data.timestamp || new Date().toISOString()}, NOW())
                    RETURNING *
                `;
            }
        } else {
            record = await sql`
                INSERT INTO "AttendanceRecord" ("date", "swimmerId", "status", "timestamp", "createdAt")
                VALUES (${String(data.date)}, ${String(data.swimmerId)}, ${String(data.status || 'Present')}, ${data.timestamp || new Date().toISOString()}, NOW())
                RETURNING *
            `;
        }

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
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`DELETE FROM "AttendanceRecord" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
