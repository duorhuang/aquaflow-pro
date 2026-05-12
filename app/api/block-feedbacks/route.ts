import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireAthlete } from '@/lib/auth-api';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('planId');
        const blockId = searchParams.get('blockId');
        const swimmerId = searchParams.get('swimmerId');

        let feedbacks: any[];
        if (planId && blockId && swimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "planId" = ${planId} AND "blockId" = ${blockId} AND "swimmerId" = ${swimmerId}
                ORDER BY "createdAt" DESC
            `;
        } else if (planId && blockId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "planId" = ${planId} AND "blockId" = ${blockId}
                ORDER BY "createdAt" DESC
            `;
        } else if (planId && swimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "planId" = ${planId} AND "swimmerId" = ${swimmerId}
                ORDER BY "createdAt" DESC
            `;
        } else if (blockId && swimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "blockId" = ${blockId} AND "swimmerId" = ${swimmerId}
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
        } else if (swimmerId) {
            feedbacks = await sql`
                SELECT * FROM "BlockFeedback"
                WHERE "swimmerId" = ${swimmerId}
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

        const sql = neon(process.env.DATABASE_URL!);
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
                    "tags" = ${Array.isArray(data.tags) ? data.tags : []}
                WHERE "planId" = ${String(data.planId)} AND "blockId" = ${String(data.blockId)} AND "swimmerId" = ${String(data.swimmerId)}
                RETURNING *
            `;
        } else {
            feedback = await sql`
                INSERT INTO "BlockFeedback" ("planId", "blockId", "swimmerId", "reaction", "comment", "tags", "createdAt")
                VALUES (
                    ${String(data.planId)},
                    ${String(data.blockId)},
                    ${String(data.swimmerId)},
                    ${data.reaction || null},
                    ${data.comment || null},
                    ${Array.isArray(data.tags) ? data.tags : []},
                    NOW()
                )
                RETURNING *
            `;
        }
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAthlete(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`DELETE FROM "BlockFeedback" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
