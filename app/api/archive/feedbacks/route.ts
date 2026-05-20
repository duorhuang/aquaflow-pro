import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(req.url);
        const swimmerId = searchParams.get('swimmerId');
        const group = searchParams.get('group');
        const type = searchParams.get('type') || 'all';
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        const isCoach = (auth as any).role === 'coach';
        const athleteId = !isCoach ? (auth as any).userId : null;
        const effectiveSwimmerId = athleteId || swimmerId;

        let blockFeedbacks: any[] = [];
        let weeklyFeedbacks: any[] = [];
        let targetedFeedbacks: any[] = [];

        // --- Block Feedback ---
        if (type === 'all' || type === 'block') {
            blockFeedbacks = await fetchBlockFeedbacks(effectiveSwimmerId, isCoach ? group : null, dateFrom, dateTo, sql);
            for (const bf of blockFeedbacks) {
                if (bf.tags && typeof bf.tags === 'string') {
                    try { bf.tags = JSON.parse(bf.tags); } catch { bf.tags = []; }
                }
                const swimmer = bf.swimmer && Object.keys(bf.swimmer).length > 1 ? bf.swimmer : null;
                bf.swimmer = swimmer;
            }
        }

        // --- Weekly Feedback ---
        if (type === 'all' || type === 'weekly') {
            weeklyFeedbacks = await fetchWeeklyFeedbacks(effectiveSwimmerId, isCoach ? group : null, sql);
            weeklyFeedbacks = await Promise.all(weeklyFeedbacks.map(async (f: any) => {
                const dailyFeedbacks = await sql`
                    SELECT * FROM "DailyFeedback" WHERE "weeklyFeedbackId" = ${f.id} ORDER BY "date" ASC
                `;
                const swimmer = f.swimmer && Object.keys(f.swimmer).length > 1 ? f.swimmer : null;
                return { ...f, swimmer, dailyFeedbacks };
            }));
        }

        // --- Targeted Feedback ---
        if (type === 'all' || type === 'targeted') {
            targetedFeedbacks = await fetchTargetedFeedbacks(effectiveSwimmerId, isCoach ? group : null, sql);
            for (const tf of targetedFeedbacks) {
                const swimmer = tf.swimmer && Object.keys(tf.swimmer).length > 1 ? tf.swimmer : null;
                tf.swimmer = swimmer;
            }
        }

        return NextResponse.json({ blockFeedbacks, weeklyFeedbacks, targetedFeedbacks }, { headers: V12_FINGERPRINT });
    });
}

async function fetchBlockFeedbacks(swimmerId: string | null, group: string | null, dateFrom: string | null, dateTo: string | null, sql: any) {
    // Build conditions as arrays, then pick the right query
    if (swimmerId && dateFrom && dateTo) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "BlockFeedback"."swimmerId" = ${swimmerId}
              AND "BlockFeedback"."createdAt" >= ${dateFrom + 'T00:00:00Z'}
              AND "BlockFeedback"."createdAt" <= ${dateTo + 'T23:59:59Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (swimmerId && dateFrom) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "BlockFeedback"."swimmerId" = ${swimmerId}
              AND "BlockFeedback"."createdAt" >= ${dateFrom + 'T00:00:00Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (swimmerId && dateTo) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "BlockFeedback"."swimmerId" = ${swimmerId}
              AND "BlockFeedback"."createdAt" <= ${dateTo + 'T23:59:59Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (swimmerId) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "BlockFeedback"."swimmerId" = ${swimmerId}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (group && dateFrom && dateTo) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "Swimmer"."group" = ${group}
              AND "BlockFeedback"."createdAt" >= ${dateFrom + 'T00:00:00Z'}
              AND "BlockFeedback"."createdAt" <= ${dateTo + 'T23:59:59Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (group && dateFrom) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "Swimmer"."group" = ${group}
              AND "BlockFeedback"."createdAt" >= ${dateFrom + 'T00:00:00Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (group && dateTo) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "Swimmer"."group" = ${group}
              AND "BlockFeedback"."createdAt" <= ${dateTo + 'T23:59:59Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (group) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "Swimmer"."group" = ${group}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (dateFrom && dateTo) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "BlockFeedback"."createdAt" >= ${dateFrom + 'T00:00:00Z'}
              AND "BlockFeedback"."createdAt" <= ${dateTo + 'T23:59:59Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (dateFrom) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "BlockFeedback"."createdAt" >= ${dateFrom + 'T00:00:00Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    if (dateTo) {
        return sql`
            SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "BlockFeedback"
            LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "BlockFeedback"."createdAt" <= ${dateTo + 'T23:59:59Z'}
            ORDER BY "BlockFeedback"."createdAt" DESC
        `;
    }
    return sql`
        SELECT "BlockFeedback".*, row_to_json("Swimmer") as swimmer
        FROM "BlockFeedback"
        LEFT JOIN "Swimmer" ON "BlockFeedback"."swimmerId" = "Swimmer"."id"
        ORDER BY "BlockFeedback"."createdAt" DESC
    `;
}

async function fetchWeeklyFeedbacks(swimmerId: string | null, group: string | null, sql: any) {
    let rows: any[];
    if (swimmerId) {
        rows = await sql`
            SELECT "WeeklyFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "WeeklyFeedback"
            LEFT JOIN "Swimmer" ON "WeeklyFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "WeeklyFeedback"."swimmerId" = ${swimmerId}
              AND "WeeklyFeedback"."isSubmitted" = true
            ORDER BY "WeeklyFeedback"."submittedAt" DESC
        `;
    } else if (group) {
        rows = await sql`
            SELECT "WeeklyFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "WeeklyFeedback"
            LEFT JOIN "Swimmer" ON "WeeklyFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "Swimmer"."group" = ${group}
              AND "WeeklyFeedback"."isSubmitted" = true
            ORDER BY "WeeklyFeedback"."submittedAt" DESC
        `;
    } else {
        rows = await sql`
            SELECT "WeeklyFeedback".*, row_to_json("Swimmer") as swimmer
            FROM "WeeklyFeedback"
            LEFT JOIN "Swimmer" ON "WeeklyFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "WeeklyFeedback"."isSubmitted" = true
            ORDER BY "WeeklyFeedback"."submittedAt" DESC
        `;
    }
    return rows;
}

async function fetchTargetedFeedbacks(swimmerId: string | null, group: string | null, sql: any) {
    if (swimmerId) {
        return sql`
            SELECT "TargetedFeedback".*, "FeedbackReminder"."message" as reminderMessage,
                   "FeedbackReminder"."periodStart", "FeedbackReminder"."periodEnd",
                   row_to_json("Swimmer") as swimmer
            FROM "TargetedFeedback"
            LEFT JOIN "FeedbackReminder" ON "TargetedFeedback"."reminderId" = "FeedbackReminder"."id"
            LEFT JOIN "Swimmer" ON "TargetedFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "TargetedFeedback"."swimmerId" = ${swimmerId}
            ORDER BY "TargetedFeedback"."createdAt" DESC
        `;
    }
    if (group) {
        return sql`
            SELECT "TargetedFeedback".*, "FeedbackReminder"."message" as reminderMessage,
                   "FeedbackReminder"."periodStart", "FeedbackReminder"."periodEnd",
                   row_to_json("Swimmer") as swimmer
            FROM "TargetedFeedback"
            LEFT JOIN "FeedbackReminder" ON "TargetedFeedback"."reminderId" = "FeedbackReminder"."id"
            LEFT JOIN "Swimmer" ON "TargetedFeedback"."swimmerId" = "Swimmer"."id"
            WHERE "Swimmer"."group" = ${group}
            ORDER BY "TargetedFeedback"."createdAt" DESC
        `;
    }
    return sql`
        SELECT "TargetedFeedback".*, "FeedbackReminder"."message" as reminderMessage,
               "FeedbackReminder"."periodStart", "FeedbackReminder"."periodEnd",
               row_to_json("Swimmer") as swimmer
        FROM "TargetedFeedback"
        LEFT JOIN "FeedbackReminder" ON "TargetedFeedback"."reminderId" = "FeedbackReminder"."id"
        LEFT JOIN "Swimmer" ON "TargetedFeedback"."swimmerId" = "Swimmer"."id"
        ORDER BY "TargetedFeedback"."createdAt" DESC
    `;
}
