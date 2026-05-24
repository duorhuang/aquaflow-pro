import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

function parseJsonFields(plan: any) {
    if (plan.targetGroup && typeof plan.targetGroup === 'string') {
        try { plan.targetGroup = JSON.parse(plan.targetGroup); } catch { plan.targetGroup = []; }
    }
    if (plan.targetSwimmerIds && typeof plan.targetSwimmerIds === 'string') {
        try { plan.targetSwimmerIds = JSON.parse(plan.targetSwimmerIds); } catch { plan.targetSwimmerIds = []; }
    }
    return plan;
}

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const group = searchParams.get('group');
        const isPublished = searchParams.get('isPublished') === 'true';

        if (id) {
            const plan = await sql`SELECT * FROM "WeeklyPlan" WHERE "id" = ${id}`;
            if (plan.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            const sessions = await sql`SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ${id} ORDER BY "sortOrder" ASC`;
            for (const s of sessions) {
                if (s.contentBlocks && typeof s.contentBlocks === 'string') {
                    try { s.contentBlocks = JSON.parse(s.contentBlocks); } catch {}
                }
                if (s.trainingBlocks && typeof s.trainingBlocks === 'string') {
                    try { s.trainingBlocks = JSON.parse(s.trainingBlocks); } catch {}
                }
            }
            const p = parseJsonFields(plan[0]);
            return NextResponse.json({ ...p, sessions }, { headers: V12_FINGERPRINT });
        }

        // Build plans query
        let plans: any[];
        if (group && searchParams.has('isPublished')) {
            plans = await sql`SELECT * FROM "WeeklyPlan" WHERE "group" = ${group} AND "isPublished" = ${isPublished} ORDER BY "weekStart" DESC`;
        } else if (group) {
            plans = await sql`SELECT * FROM "WeeklyPlan" WHERE "group" = ${group} ORDER BY "weekStart" DESC`;
        } else if (searchParams.has('isPublished')) {
            plans = await sql`SELECT * FROM "WeeklyPlan" WHERE "isPublished" = ${isPublished} ORDER BY "weekStart" DESC`;
        } else {
            plans = await sql`SELECT * FROM "WeeklyPlan" ORDER BY "weekStart" DESC`;
        }

        // Parse JSON fields in plans
        for (const p of plans) parseJsonFields(p);

        // Fetch sessions only for returned plans — skip if no plans
        const sessionsByPlanId: Record<string, any[]> = {};
        if (plans.length > 0) {
            const planIds = plans.map((p: any) => p.id);
            // Fetch ONLY id and weeklyPlanId to calculate sessions length for the sidebar list
            // This avoids loading massive contentBlocks, notes, contentHtml, and base64 imageData into database memory
            const sessions = await sql`SELECT "id", "weeklyPlanId" FROM "DailySession" WHERE "weeklyPlanId" = ANY(${planIds})`;
            for (const s of sessions) {
                (sessionsByPlanId[s.weeklyPlanId] ||= []).push(s);
            }
        }

        const results = plans.map((plan: any) => ({
            ...plan,
            sessions: sessionsByPlanId[plan.id] || [],
        }));

        return NextResponse.json(results || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const plan = await sql`
            INSERT INTO "WeeklyPlan" ("id", "weekStart", "weekEnd", "group", "title", "coachNotes", "isPublished", "targetGroup", "targetSwimmerIds", "overviewImageUrl", "overviewContentHtml", "createdAt", "updatedAt")
            VALUES (
                ${crypto.randomUUID()}, ${String(data.weekStart)}, ${String(data.weekEnd)},
                ${String(data.group || 'Advanced')}, ${data.title}, ${data.coachNotes},
                ${Boolean(data.isPublished)},
                ${data.targetGroup ? JSON.stringify(data.targetGroup) : null},
                ${data.targetSwimmerIds ? JSON.stringify(data.targetSwimmerIds) : null},
                ${data.overviewImageUrl ?? null}, ${data.overviewContentHtml ?? null},
                NOW(), NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(parseJsonFields(plan[0]), { headers: V12_FINGERPRINT });
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
        const existing = await sql`SELECT * FROM "WeeklyPlan" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const current = existing[0];

        const plan = await sql`
            UPDATE "WeeklyPlan" SET
                "weekStart" = ${data.weekStart ?? current.weekStart},
                "weekEnd" = ${data.weekEnd ?? current.weekEnd},
                "group" = ${data.group ?? current.group},
                "title" = ${data.title !== undefined ? data.title : current.title},
                "coachNotes" = ${data.coachNotes !== undefined ? data.coachNotes : current.coachNotes},
                "isPublished" = ${data.isPublished !== undefined ? Boolean(data.isPublished) : current.isPublished},
                "targetGroup" = ${data.targetGroup !== undefined ? (data.targetGroup ? JSON.stringify(data.targetGroup) : null) : current.targetGroup},
                "targetSwimmerIds" = ${data.targetSwimmerIds !== undefined ? (data.targetSwimmerIds ? JSON.stringify(data.targetSwimmerIds) : null) : current.targetSwimmerIds},
                "overviewImageUrl" = ${data.overviewImageUrl !== undefined ? (data.overviewImageUrl ?? null) : current.overviewImageUrl},
                "overviewContentHtml" = ${data.overviewContentHtml !== undefined ? (data.overviewContentHtml ?? null) : current.overviewContentHtml},
                "updatedAt" = NOW()
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(parseJsonFields(plan[0]), { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "WeeklyPlan" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
