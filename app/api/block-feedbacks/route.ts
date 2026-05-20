import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireAthlete } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('planId');
        const blockId = searchParams.get('blockId');
        const swimmerId = searchParams.get('swimmerId');

        // Athletes can only query their own feedback unless a specific block/plan is requested by a coach
        const isCoach = (auth as any).role === 'coach';
        const athleteId = !isCoach ? (auth as any).userId : null;

        // If athlete queries without swimmerId matching themselves, force it
        const effectiveSwimmerId = !isCoach && swimmerId && swimmerId !== athleteId ? athleteId : swimmerId;

        let feedbacks: any[];
        if (planId && blockId && effectiveSwimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "planId" = ${planId} AND "blockId" = ${blockId} AND "swimmerId" = ${effectiveSwimmerId}
                ORDER BY "createdAt" DESC
            `;
        } else if (planId && blockId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "planId" = ${planId} AND "blockId" = ${blockId}
                ORDER BY "createdAt" DESC
            `;
        } else if (planId && effectiveSwimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "planId" = ${planId} AND "swimmerId" = ${effectiveSwimmerId}
                ORDER BY "createdAt" DESC
            `;
        } else if (blockId && effectiveSwimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "blockId" = ${blockId} AND "swimmerId" = ${effectiveSwimmerId}
                ORDER BY "createdAt" DESC
            `;
        } else if (planId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "planId" = ${planId}
                ORDER BY "createdAt" DESC
            `;
        } else if (blockId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "blockId" = ${blockId}
                ORDER BY "createdAt" DESC
            `;
        } else if (effectiveSwimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "swimmerId" = ${effectiveSwimmerId}
                ORDER BY "createdAt" DESC
            `;
        } else {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                ORDER BY "createdAt" DESC
            `;
        }

        // Include swimmer info
        const results = await Promise.all(feedbacks.map(async (f: any) => {
            const swimmer = await sql`
                SELECT "id", "name", "group" FROM "Swimmer" WHERE "id" = ${f.swimmerId}
            `;
            return { ...f, swimmer: swimmer[0] || null };
        }));

        return NextResponse.json(results || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAthlete(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        // Upsert: unique constraint on [planId, blockId, swimmerId]
        const existing = await sql`
            SELECT * FROM "BlockFeedback"
            WHERE "planId" = ${String(data.planId)} AND "blockId" = ${String(data.blockId)} AND "swimmerId" = ${String(data.swimmerId)}
        `;

        let feedback: any;
        if (existing.length > 0) {
            feedback = await sql`
                UPDATE "BlockFeedback" SET
                    "reaction" = ${data.reaction || null},
                    "comment" = ${data.comment || null},
                    "tags" = ${Array.isArray(data.tags) ? JSON.stringify(data.tags) : null}
                WHERE "planId" = ${String(data.planId)} AND "blockId" = ${String(data.blockId)} AND "swimmerId" = ${String(data.swimmerId)}
                RETURNING *
            `;
        } else {
            feedback = await sql`
                INSERT INTO "BlockFeedback" ("id", "planId", "blockId", "swimmerId", "reaction", "comment", "tags", "createdAt")
                VALUES (
                    ${crypto.randomUUID()},
                    ${String(data.planId)},
                    ${String(data.blockId)},
                    ${String(data.swimmerId)},
                    ${data.reaction || null},
                    ${data.comment || null},
                    ${Array.isArray(data.tags) ? JSON.stringify(data.tags) : null},
                    NOW()
                )
                RETURNING *
            `;
        }
        return NextResponse.json(feedback[0], { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAthlete(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Ownership check: athlete can only delete their own feedback
        const existing = await sql`SELECT "swimmerId" FROM "BlockFeedback" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        if (existing[0].swimmerId !== (auth as any).userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await sql`DELETE FROM "BlockFeedback" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
