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
        const swimmerId = searchParams.get('swimmerId');
        const weekStart = searchParams.get('weekStart');
        const submittedOnly = searchParams.get('submitted') === 'true';

        if (swimmerId && weekStart) {
            const feedback = await sql`
                SELECT * FROM "WeeklyFeedback"
                WHERE "swimmerId" = ${swimmerId} AND "weekStart" = ${weekStart}
            `;
            if (feedback.length === 0) return NextResponse.json(null, { headers: V12_FINGERPRINT });

            const dailyFeedbacks = await sql`
                SELECT * FROM "DailyFeedback" WHERE "weeklyFeedbackId" = ${feedback[0].id}
            `;
            const swimmer = await sql`
                SELECT * FROM "Swimmer" WHERE "id" = ${feedback[0].swimmerId}
            `;

            return NextResponse.json(
                { ...feedback[0], dailyFeedbacks, swimmer: swimmer[0] || null },
                { headers: V12_FINGERPRINT }
            );
        }

        let feedbacks: any[];
        if (submittedOnly) {
            feedbacks = await sql`
                SELECT * FROM "WeeklyFeedback"
                WHERE "isSubmitted" = true
                ORDER BY "weekStart" DESC
            `;
        } else {
            feedbacks = await sql`
                SELECT * FROM "WeeklyFeedback"
                ORDER BY "weekStart" DESC
            `;
        }

        // Include dailyFeedbacks and swimmer for each
        const results = await Promise.all(feedbacks.map(async (f: any) => {
            const [dailyFeedbacks, swimmer] = await Promise.all([
                sql`SELECT * FROM "DailyFeedback" WHERE "weeklyFeedbackId" = ${f.id}`,
                sql`SELECT * FROM "Swimmer" WHERE "id" = ${f.swimmerId}`,
            ]);
            return { ...f, dailyFeedbacks, swimmer: swimmer[0] || null };
        }));

        return NextResponse.json(results || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const { swimmerId, weekStart, summary, isSubmitted, dailyFeedbacks, coachReply, isReplied } = data;

        // Check if exists
        const existing = await sql`
            SELECT * FROM "WeeklyFeedback"
            WHERE "swimmerId" = ${swimmerId} AND "weekStart" = ${weekStart}
        `;

        let feedback: any;
        if (existing.length > 0) {
            // Update
            feedback = await sql`
                UPDATE "WeeklyFeedback" SET
                    "summary" = ${summary},
                    "isSubmitted" = ${isSubmitted ?? false},
                    "submittedAt" = ${isSubmitted ? new Date().toISOString() : null},
                    "coachReply" = ${coachReply},
                    "isReplied" = ${isReplied},
                    "repliedAt" = ${coachReply ? new Date().toISOString() : null},
                    "updatedAt" = NOW()
                WHERE "swimmerId" = ${swimmerId} AND "weekStart" = ${weekStart}
                RETURNING *
            `;

            // Upsert daily feedbacks
            if (dailyFeedbacks && dailyFeedbacks.length > 0) {
                for (const df of dailyFeedbacks) {
                    const existingDf = await sql`
                        SELECT * FROM "DailyFeedback"
                        WHERE "swimmerId" = ${swimmerId} AND "date" = ${df.date}
                        AND "weeklyFeedbackId" = ${feedback.id}
                    `;
                    if (existingDf.length > 0) {
                        await sql`
                            UPDATE "DailyFeedback" SET
                                "rpe" = ${df.rpe},
                                "soreness" = ${df.soreness},
                                "reflection" = ${df.reflection}
                            WHERE "id" = ${existingDf[0].id}
                        `;
                    } else {
                        await sql`
                            INSERT INTO "DailyFeedback" ("weeklyFeedbackId", "swimmerId", "date", "rpe", "soreness", "reflection", "createdAt")
                            VALUES (${feedback.id}, ${swimmerId}, ${df.date}, ${df.rpe}, ${df.soreness}, ${df.reflection}, NOW())
                        `;
                    }
                }
            }
        } else {
            // Create
            feedback = await sql`
                INSERT INTO "WeeklyFeedback" ("swimmerId", "weekStart", "summary", "isSubmitted", "submittedAt", "coachReply", "isReplied", "repliedAt", "createdAt", "updatedAt")
                VALUES (
                    ${swimmerId},
                    ${weekStart},
                    ${summary},
                    ${isSubmitted ?? false},
                    ${isSubmitted ? new Date().toISOString() : null},
                    ${coachReply},
                    ${isReplied},
                    ${coachReply ? new Date().toISOString() : null},
                    NOW(),
                    NOW()
                )
                RETURNING *
            `;

            // Create daily feedbacks
            if (dailyFeedbacks && dailyFeedbacks.length > 0) {
                for (const df of dailyFeedbacks) {
                    await sql`
                        INSERT INTO "DailyFeedback" ("weeklyFeedbackId", "swimmerId", "date", "rpe", "soreness", "reflection", "createdAt")
                        VALUES (${feedback.id}, ${swimmerId}, ${df.date}, ${df.rpe}, ${df.soreness}, ${df.reflection}, NOW())
                    `;
                }
            }
        }

        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}

export async function PATCH(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());
        const { id, coachReply, isReplied } = data;

        const feedback = await sql`
            UPDATE "WeeklyFeedback" SET
                "coachReply" = ${coachReply},
                "isReplied" = ${isReplied ?? true},
                "repliedAt" = ${new Date().toISOString()}
            WHERE "id" = ${id}
            RETURNING *
        `;
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}
