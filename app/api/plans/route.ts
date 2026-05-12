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
        const group = searchParams.get('group');

        let plans: any[];
        if (group) {
            plans = await sql`
                SELECT * FROM "TrainingPlan"
                WHERE "group" = ${group}
                ORDER BY "date" DESC
            `;
        } else {
            plans = await sql`
                SELECT * FROM "TrainingPlan"
                ORDER BY "date" DESC
            `;
        }
        return NextResponse.json(plans || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const plan = await sql`
            INSERT INTO "TrainingPlan" ("id", "date", "startTime", "endTime", "group", "blocks", "totalDistance", "focus", "status", "coachNotes", "targetedNotes", "imageUrl", "isStarred", "createdAt", "updatedAt")
            VALUES (
                ${data.id},
                ${String(data.date)},
                ${data.startTime || ''},
                ${data.endTime || ''},
                ${String(data.group)},
                ${data.blocks || []},
                ${Number(data.totalDistance) || 0},
                ${data.focus || ''},
                ${data.status || 'Active'},
                ${data.coachNotes},
                ${data.targetedNotes || {}},
                ${data.imageUrl},
                ${Boolean(data.isStarred)},
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
            UPDATE "TrainingPlan" SET
                "date" = ${data.date},
                "startTime" = ${data.startTime},
                "endTime" = ${data.endTime},
                "group" = ${data.group},
                "blocks" = ${data.blocks},
                "totalDistance" = ${data.totalDistance !== undefined ? Number(data.totalDistance) : null},
                "focus" = ${data.focus},
                "status" = ${data.status},
                "coachNotes" = ${data.coachNotes},
                "targetedNotes" = ${data.targetedNotes},
                "imageUrl" = ${data.imageUrl},
                "isStarred" = ${data.isStarred},
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

        await sql`DELETE FROM "TrainingPlan" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
