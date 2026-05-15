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
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const group = searchParams.get('group');
        const isPublished = searchParams.get('isPublished') === 'true';

        if (id) {
            const plan = await sql`SELECT * FROM "WeeklyPlan" WHERE "id" = ${id}`;
            if (plan.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            const sessions = await sql`
                SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ${id}
            `;
            const p = plan[0];
            if (p.targetGroup && typeof p.targetGroup === 'string') p.targetGroup = JSON.parse(p.targetGroup);
            if (p.targetSwimmerIds && typeof p.targetSwimmerIds === 'string') p.targetSwimmerIds = JSON.parse(p.targetSwimmerIds);
            return NextResponse.json({ ...p, sessions }, { headers: V12_FINGERPRINT });
        }

        let plans: any[];
        if (group && searchParams.has('isPublished')) {
            plans = await sql`
                SELECT * FROM "WeeklyPlan"
                WHERE "group" = ${group} AND "isPublished" = ${isPublished}
                ORDER BY "weekStart" DESC
            `;
        } else if (group) {
            plans = await sql`
                SELECT * FROM "WeeklyPlan"
                WHERE "group" = ${group}
                ORDER BY "weekStart" DESC
            `;
        } else if (searchParams.has('isPublished')) {
            plans = await sql`
                SELECT * FROM "WeeklyPlan"
                WHERE "isPublished" = ${isPublished}
                ORDER BY "weekStart" DESC
            `;
        } else {
            plans = await sql`
                SELECT * FROM "WeeklyPlan"
                ORDER BY "weekStart" DESC
            `;
        }

        // Include sessions for each plan
        const results = await Promise.all(plans.map(async (plan: any) => {
            const sessions = await sql`
                SELECT * FROM "DailySession" WHERE "weeklyPlanId" = ${plan.id}
            `;
            if (plan.targetGroup && typeof plan.targetGroup === 'string') plan.targetGroup = JSON.parse(plan.targetGroup);
            if (plan.targetSwimmerIds && typeof plan.targetSwimmerIds === 'string') plan.targetSwimmerIds = JSON.parse(plan.targetSwimmerIds);
            return { ...plan, sessions };
        }));

        return NextResponse.json(results || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const plan = await sql`
            INSERT INTO "WeeklyPlan" ("weekStart", "weekEnd", "group", "title", "coachNotes", "isPublished", "targetGroup", "targetSwimmerIds", "overviewImageUrl", "overviewContentHtml", "createdAt", "updatedAt")
            VALUES (
                ${String(data.weekStart)},
                ${String(data.weekEnd)},
                ${String(data.group || "Advanced")},
                ${data.title},
                ${data.coachNotes},
                ${Boolean(data.isPublished)},
                ${data.targetGroup ? JSON.stringify(data.targetGroup) : null},
                ${data.targetSwimmerIds ? JSON.stringify(data.targetSwimmerIds) : null},
                ${data.overviewImageUrl ?? null},
                ${data.overviewContentHtml ?? null},
                NOW(),
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(plan, { headers: V12_FINGERPRINT });
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

        const plan = await sql`
            UPDATE "WeeklyPlan" SET
                "weekStart" = ${data.weekStart},
                "weekEnd" = ${data.weekEnd},
                "group" = ${data.group},
                "title" = ${data.title},
                "coachNotes" = ${data.coachNotes},
                "isPublished" = ${data.isPublished},
                "targetGroup" = ${data.targetGroup !== undefined ? (data.targetGroup ? JSON.stringify(data.targetGroup) : null) : null},
                "targetSwimmerIds" = ${data.targetSwimmerIds !== undefined ? (data.targetSwimmerIds ? JSON.stringify(data.targetSwimmerIds) : null) : null},
                "overviewImageUrl" = ${data.overviewImageUrl !== undefined ? (data.overviewImageUrl ?? null) : null},
                "overviewContentHtml" = ${data.overviewContentHtml !== undefined ? (data.overviewContentHtml ?? null) : null},
                "updatedAt" = NOW()
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(plan, { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "WeeklyPlan" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
