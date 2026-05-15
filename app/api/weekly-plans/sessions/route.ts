import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

function parseSessionJson(s: any) {
    if (s.contentBlocks && typeof s.contentBlocks === 'string') {
        s.contentBlocks = JSON.parse(s.contentBlocks);
    }
}

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(req.url);
        const weeklyPlanId = searchParams.get('weeklyPlanId');
        const date = searchParams.get('date');

        if (date) {
            const sessions = await sql`
                SELECT "DailySession".*,
                       row_to_json("WeeklyPlan") as weeklyPlan
                FROM "DailySession"
                LEFT JOIN "WeeklyPlan" ON "DailySession"."weeklyPlanId" = "WeeklyPlan"."id"
                WHERE "DailySession"."date" = ${date}
                ORDER BY "DailySession"."label" ASC
            `;
            sessions.forEach(parseSessionJson);
            return NextResponse.json(sessions || [], { headers: V12_FINGERPRINT });
        }

        if (!weeklyPlanId) return NextResponse.json([], { headers: V12_FINGERPRINT });

        const sessions = await sql`
            SELECT * FROM "DailySession"
            WHERE "weeklyPlanId" = ${weeklyPlanId}
            ORDER BY "sortOrder" ASC
        `;
        sessions.forEach(parseSessionJson);
        return NextResponse.json(sessions || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const session = await sql`
            INSERT INTO "DailySession" ("weeklyPlanId", "label", "date", "imageData", "imageType", "notes", "sortOrder", "contentBlocks", "contentHtml", "editorMode", "createdAt")
            VALUES (
                ${String(data.weeklyPlanId)},
                ${String(data.label)},
                ${String(data.date)},
                ${data.imageData},
                ${data.imageType},
                ${data.notes},
                ${Number(data.sortOrder) || 0},
                ${data.contentBlocks ? JSON.stringify(data.contentBlocks) : null},
                ${data.contentHtml ?? null},
                ${data.editorMode ?? "legacy"},
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(session, { headers: V12_FINGERPRINT });
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

        const session = await sql`
            UPDATE "DailySession" SET
                "label" = ${data.label},
                "date" = ${data.date},
                "imageData" = ${data.imageData},
                "imageType" = ${data.imageType},
                "notes" = ${data.notes},
                "sortOrder" = ${data.sortOrder !== undefined ? Number(data.sortOrder) : null},
                "contentBlocks" = ${data.contentBlocks !== undefined ? JSON.stringify(data.contentBlocks) : null},
                "contentHtml" = ${data.contentHtml !== undefined ? data.contentHtml : null},
                "editorMode" = ${data.editorMode !== undefined ? data.editorMode : "legacy"},
                "updatedAt" = NOW()
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(session, { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "DailySession" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
