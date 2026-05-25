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
                // Handle both parsed JSON array and string-encoded JSON
                let targets: string[] = [];
                if (Array.isArray(r.targetSwimmerIds)) {
                    targets = r.targetSwimmerIds;
                } else if (typeof r.targetSwimmerIds === 'string') {
                    try { targets = JSON.parse(r.targetSwimmerIds); } catch {}
                }
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

        const sql = getNeon();
        const body = flattenPayload(await req.json());

        // Athlete response to a reminder — use auth-derived userId, not body.swimmerId
        if (body.reminderId && body.content && (auth as any).role === 'athlete') {
            const athleteId = (auth as any).userId;
            // Check if already responded to prevent duplicate unique constraint errors
            const existing = await sql`SELECT "id" FROM "TargetedFeedback" WHERE "reminderId" = ${body.reminderId} AND "swimmerId" = ${athleteId} LIMIT 1`;
            if (existing.length > 0) {
                return NextResponse.json({ error: 'Already responded to this reminder' }, { status: 409, headers: V12_FINGERPRINT });
            }
            const response = await sql`
                INSERT INTO "TargetedFeedback" ("id", "reminderId", "swimmerId", "content", "rpe", "soreness", "createdAt")
                VALUES (${crypto.randomUUID()}, ${body.reminderId}, ${athleteId}, ${body.content}, ${Number(body.rpe) || 0}, ${Number(body.soreness) || 0}, NOW())
                RETURNING *
            `;
            return NextResponse.json(response[0], { status: 201, headers: V12_FINGERPRINT });
        }

        // Coach creates a reminder
        if ((auth as any).role !== 'coach') {
            return NextResponse.json({ error: "Coach access required" }, { status: 403, headers: V12_FINGERPRINT });
        }

        if (!body.message) {
            return NextResponse.json({ error: "Missing 'message'" }, { status: 400, headers: V12_FINGERPRINT });
        }

        const reminder = await sql`
            INSERT INTO "FeedbackReminder" ("id", "message", "targetSwimmerIds", "targetGroup", "periodStart", "periodEnd", "createdAt")
            VALUES (
                ${crypto.randomUUID()},
                ${String(body.message)},
                ${Array.isArray(body.targetSwimmerIds) ? JSON.stringify(body.targetSwimmerIds) : null},
                ${body.targetGroup || null},
                ${body.periodStart || new Date().toISOString().split('T')[0]},
                ${body.periodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]},
                NOW()
            )
            RETURNING *
        `;
        return NextResponse.json(reminder[0], { status: 201, headers: V12_FINGERPRINT });
    });
}

export async function PATCH(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
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

        return NextResponse.json(response[0], { headers: V12_FINGERPRINT });
    });
}
