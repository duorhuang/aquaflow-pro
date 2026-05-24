import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

function parseSessionJson(s: any) {
    if (s.contentBlocks && typeof s.contentBlocks === 'string') {
        try { s.contentBlocks = JSON.parse(s.contentBlocks); } catch { s.contentBlocks = []; }
    }
    if (s.trainingBlocks && typeof s.trainingBlocks === 'string') {
        try { s.trainingBlocks = JSON.parse(s.trainingBlocks); } catch { s.trainingBlocks = []; }
    }
}

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
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
            // Normalize weeklyPlan: row_to_json in LEFT JOIN may return {"":null}
            sessions.forEach((s: any) => {
                if (s.weeklyPlan && Object.keys(s.weeklyPlan).length <= 1) s.weeklyPlan = null;
            });
            return NextResponse.json(sessions || [], { headers: V12_FINGERPRINT });
        }

        if (!weeklyPlanId) return NextResponse.json({ error: 'weeklyPlanId required' }, { status: 400, headers: V12_FINGERPRINT });

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

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const session = await sql`
            INSERT INTO "DailySession" ("id", "weeklyPlanId", "label", "date", "imageData", "imageType", "notes", "sortOrder", "contentBlocks", "trainingBlocks", "totalDistance", "contentHtml", "editorMode", "trainingType", "primaryStroke", "createdAt")
            VALUES (
                ${crypto.randomUUID()},
                ${String(data.weeklyPlanId)},
                ${String(data.label)},
                ${String(data.date)},
                ${data.imageData},
                ${data.imageType},
                ${data.notes},
                ${Number(data.sortOrder) || 0},
                ${data.contentBlocks ? JSON.stringify(data.contentBlocks) : null},
                ${data.trainingBlocks ? JSON.stringify(data.trainingBlocks) : null},
                ${data.totalDistance !== undefined ? Number(data.totalDistance) : null},
                ${data.contentHtml ?? null},
                ${data.editorMode ?? "legacy"},
                ${data.trainingType ?? null},
                ${data.primaryStroke ?? null},
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(session[0], { headers: V12_FINGERPRINT });
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
        const existing = await sql`SELECT * FROM "DailySession" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const current = existing[0];

        const contentBlocksJson = data.contentBlocks !== undefined ? JSON.stringify(data.contentBlocks) : current.contentBlocks;
        const trainingBlocksJson = data.trainingBlocks !== undefined ? JSON.stringify(data.trainingBlocks) : current.trainingBlocks;

        const session = await sql`
            UPDATE "DailySession" SET
                "label" = ${data.label ?? current.label},
                "date" = ${data.date ?? current.date},
                "imageData" = ${data.imageData !== undefined ? data.imageData : current.imageData},
                "imageType" = ${data.imageType !== undefined ? data.imageType : current.imageType},
                "notes" = ${data.notes !== undefined ? data.notes : current.notes},
                "sortOrder" = ${data.sortOrder !== undefined ? Number(data.sortOrder) : current.sortOrder},
                "contentBlocks" = ${contentBlocksJson},
                "trainingBlocks" = ${trainingBlocksJson},
                "totalDistance" = ${data.totalDistance !== undefined ? Number(data.totalDistance) : current.totalDistance},
                "contentHtml" = ${data.contentHtml !== undefined ? data.contentHtml : current.contentHtml},
                "editorMode" = ${data.editorMode !== undefined ? data.editorMode : current.editorMode},
                "trainingType" = ${data.trainingType !== undefined ? data.trainingType : current.trainingType},
                "primaryStroke" = ${data.primaryStroke !== undefined ? data.primaryStroke : current.primaryStroke}
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(session[0], { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "DailySession" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
