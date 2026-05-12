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
        const withResponses = searchParams.get('withResponses') === 'true';

        let reminders = await sql`
            SELECT * FROM "FeedbackReminder"
            ORDER BY "createdAt" DESC
        `;

        // Include responses
        reminders = await Promise.all(reminders.map(async (r: any) => {
            let responses: any[];
            if (withResponses) {
                const respRows = await sql`
                    SELECT "TargetedFeedback".*,
                           row_to_json("Swimmer") as swimmer
                    FROM "TargetedFeedback"
                    LEFT JOIN "Swimmer" ON "TargetedFeedback"."swimmerId" = "Swimmer"."id"
                    WHERE "TargetedFeedback"."reminderId" = ${r.id}
                `;
                responses = respRows;
            } else {
                responses = await sql`
                    SELECT * FROM "TargetedFeedback"
                    WHERE "reminderId" = ${r.id}
                `;
            }
            return { ...r, responses };
        }));

        if (swimmerId) {
            reminders = (reminders || []).filter((r: any) => {
                if (!r.targetSwimmerIds) return true;
                const targets = Array.isArray(r.targetSwimmerIds) ? r.targetSwimmerIds : [];
                return targets.includes(swimmerId);
            }).map((r: any) => ({
                ...r,
                isResponded: r.responses && r.responses.some((resp: any) => resp.swimmerId === swimmerId)
            }));
        }

        return NextResponse.json(reminders || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const body = flattenPayload(await req.json());

        // Athlete response to a reminder
        if (body.reminderId && body.swimmerId && body.content && (auth as any).role === 'athlete') {
            const response = await sql`
                INSERT INTO "TargetedFeedback" ("reminderId", "swimmerId", "content", "rpe", "soreness", "createdAt")
                VALUES (${body.reminderId}, ${body.swimmerId}, ${body.content}, ${Number(body.rpe) || 0}, ${Number(body.soreness) || 0}, NOW())
                RETURNING *
            `;
            return NextResponse.json(response, { status: 201, headers: V12_FINGERPRINT });
        }

        // Coach creates a reminder
        if ((auth as any).role !== 'coach') {
            return NextResponse.json({ error: "Coach access required" }, { status: 403, headers: V12_FINGERPRINT });
        }

        if (!body.message) {
            return NextResponse.json({ error: "Missing 'message'" }, { status: 400, headers: V12_FINGERPRINT });
        }

        const reminder = await sql`
            INSERT INTO "FeedbackReminder" ("message", "targetSwimmerIds", "targetGroup", "periodStart", "periodEnd", "createdAt")
            VALUES (
                ${String(body.message)},
                ${Array.isArray(body.targetSwimmerIds) ? body.targetSwimmerIds : null},
                ${body.targetGroup || null},
                ${body.periodStart || new Date().toISOString().split('T')[0]},
                ${body.periodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]},
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(reminder, { status: 201, headers: V12_FINGERPRINT });
    });
}

export async function PATCH(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const body = flattenPayload(await req.json());

        if (!body.id || !body.coachReply) {
            return NextResponse.json({ error: "Missing 'id' or 'coachReply'" }, { status: 400, headers: V12_FINGERPRINT });
        }

        const response = await sql`
            UPDATE "TargetedFeedback" SET
                "coachReply" = ${body.coachReply},
                "repliedAt" = ${new Date().toISOString()}
            WHERE "id" = ${body.id}
            RETURNING *
        `;

        return NextResponse.json(response, { headers: V12_FINGERPRINT });
    });
}
