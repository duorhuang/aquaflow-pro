import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
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
        // Parse JSON fields
        plans.forEach((p: any) => {
            if (p.blocks && typeof p.blocks === 'string') {
                try { p.blocks = JSON.parse(p.blocks); } catch { p.blocks = []; }
            }
            if (p.targetedNotes && typeof p.targetedNotes === 'string') {
                try { p.targetedNotes = JSON.parse(p.targetedNotes); } catch { p.targetedNotes = {}; }
            }
        });
        return NextResponse.json(plans || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        // Server-side ID generation as safety net
        const planId = data.id || crypto.randomUUID();

        const blocksJson = JSON.stringify(data.blocks || []);
        const targetedNotesJson = JSON.stringify(data.targetedNotes || {});

        const plan = await sql`
            INSERT INTO "TrainingPlan" ("id", "date", "startTime", "endTime", "group", "blocks", "totalDistance", "focus", "status", "coachNotes", "targetedNotes", "imageUrl", "isStarred", "createdAt", "updatedAt")
            VALUES (
                ${planId},
                ${String(data.date)},
                ${data.startTime ?? ''},
                ${data.endTime ?? ''},
                ${String(data.group)},
                ${blocksJson},
                ${Number(data.totalDistance) || 0},
                ${data.focus ?? ''},
                ${data.status ?? 'Draft'},
                ${data.coachNotes ?? ''},
                ${targetedNotesJson},
                ${data.imageUrl ?? null},
                ${Boolean(data.isStarred)},
                NOW(),
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(plan[0], { headers: V12_FINGERPRINT });
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

        // Fetch existing plan and merge to avoid overwriting with undefined
        const existing = await sql`SELECT * FROM "TrainingPlan" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const current = existing[0];

        const blocksJson = data.blocks !== undefined ? JSON.stringify(data.blocks) : current.blocks;
        const targetedNotesJson = data.targetedNotes !== undefined ? JSON.stringify(data.targetedNotes) : current.targetedNotes;

        const plan = await sql`
            UPDATE "TrainingPlan" SET
                "date" = ${data.date ?? current.date},
                "startTime" = ${data.startTime ?? current.startTime},
                "endTime" = ${data.endTime ?? current.endTime},
                "group" = ${data.group ?? current.group},
                "blocks" = ${blocksJson},
                "totalDistance" = ${data.totalDistance !== undefined ? Number(data.totalDistance) : current.totalDistance},
                "focus" = ${data.focus ?? current.focus},
                "status" = ${data.status ?? current.status},
                "coachNotes" = ${data.coachNotes ?? current.coachNotes},
                "targetedNotes" = ${targetedNotesJson},
                "imageUrl" = ${data.imageUrl !== undefined ? (data.imageUrl ?? null) : current.imageUrl},
                "isStarred" = ${data.isStarred !== undefined ? Boolean(data.isStarred) : current.isStarred},
                "updatedAt" = NOW()
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(plan[0], { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "TrainingPlan" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
