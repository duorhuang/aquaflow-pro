import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const swimmerId = searchParams.get('swimmerId');
        const withResponses = searchParams.get('withResponses') === 'true';

        let reminders = await prisma.feedbackReminder.findMany({
            include: withResponses ? { responses: { include: { swimmer: true } } } : { responses: true },
            orderBy: { createdAt: 'desc' }
        });

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

        const prisma = getPrisma();
        const body = flattenPayload(await req.json());

        // Athlete response to a reminder
        if (body.reminderId && body.swimmerId && body.content && auth.role === 'athlete') {
            const response = await prisma.targetedFeedback.create({
                data: {
                    reminderId: body.reminderId,
                    swimmerId: body.swimmerId,
                    content: body.content,
                    rpe: Number(body.rpe) || 0,
                    soreness: Number(body.soreness) || 0
                }
            });
            return NextResponse.json(response, { status: 201, headers: V12_FINGERPRINT });
        }

        // Coach creates a reminder
        if (auth.role !== 'coach') {
            return NextResponse.json({ error: "Coach access required" }, { status: 403, headers: V12_FINGERPRINT });
        }

        if (!body.message) {
            return NextResponse.json({ error: "Missing 'message'" }, { status: 400, headers: V12_FINGERPRINT });
        }

        const reminder = await prisma.feedbackReminder.create({
            data: {
                message: String(body.message),
                targetSwimmerIds: Array.isArray(body.targetSwimmerIds) ? body.targetSwimmerIds : null,
                targetGroup: body.targetGroup || null,
                periodStart: body.periodStart || new Date().toISOString().split('T')[0],
                periodEnd: body.periodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        });
        return NextResponse.json(reminder, { status: 201, headers: V12_FINGERPRINT });
    });
}

export async function PATCH(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(req);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const body = flattenPayload(await req.json());

        if (!body.id || !body.coachReply) {
            return NextResponse.json({ error: "Missing 'id' or 'coachReply'" }, { status: 400, headers: V12_FINGERPRINT });
        }

        const response = await prisma.targetedFeedback.update({
            where: { id: body.id },
            data: {
                coachReply: body.coachReply,
                repliedAt: new Date().toISOString()
            }
        });

        return NextResponse.json(response, { headers: V12_FINGERPRINT });
    });
}
