import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const feedbacks = await sql`
            SELECT "Feedback".*,
                   row_to_json("Swimmer") as swimmer
            FROM "Feedback"
            LEFT JOIN "Swimmer" ON "Feedback"."swimmerId" = "Swimmer"."id"
            ORDER BY "Feedback"."createdAt" DESC
        `;

        const normalized = (feedbacks || []).map((f: any) => {
            const swimmer = f.swimmer && Object.keys(f.swimmer).length > 1 ? f.swimmer : null;
            return { ...f, swimmer };
        });

        return NextResponse.json(normalized, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        // Upsert: update if same swimmer+date exists, create otherwise
        const existing = await sql`
            SELECT * FROM "Feedback"
            WHERE "swimmerId" = ${String(data.swimmerId)} AND "date" = ${String(data.date)}
        `;

        let feedback: any;
        if (existing.length > 0) {
            feedback = await sql`
                UPDATE "Feedback" SET
                    "rpe" = ${Number(data.rpe) || 0},
                    "soreness" = ${Number(data.soreness) || 0},
                    "comments" = ${data.comments || ''},
                    "timestamp" = ${data.timestamp || new Date().toISOString()},
                    "goodPoints" = ${data.goodPoints},
                    "improvementAreas" = ${data.improvementAreas}
                WHERE "swimmerId" = ${String(data.swimmerId)} AND "date" = ${String(data.date)}
                RETURNING *
            `;
        } else {
            const feedbackId = data.id || crypto.randomUUID();
            feedback = await sql`
                INSERT INTO "Feedback" ("id", "swimmerId", "planId", "date", "rpe", "soreness", "comments", "timestamp", "goodPoints", "improvementAreas", "createdAt")
                VALUES (
                    ${feedbackId},
                    ${String(data.swimmerId)},
                    ${data.planId},
                    ${String(data.date)},
                    ${Number(data.rpe) || 0},
                    ${Number(data.soreness) || 0},
                    ${data.comments || ''},
                    ${data.timestamp || new Date().toISOString()},
                    ${data.goodPoints},
                    ${data.improvementAreas},
                    NOW()
                )
                RETURNING *
            `;
        }
        return NextResponse.json(feedback[0], { headers: V12_FINGERPRINT });
    });
}
