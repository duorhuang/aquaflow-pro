import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
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
        const prisma = getPrisma();
        const body = flattenPayload(await req.json());
        
        // 1. Handle response submission (targetedFeedback)
        if (body.reminderId && body.swimmerId && body.content) {
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

        // 2. Handle reminder creation (coach)
        if (!body.message) {
            return NextResponse.json({ error: "Missing 'message'" }, { status: 400, headers: V12_FINGERPRINT });
        }

        const reminder = await prisma.feedbackReminder.create({
            data: {
                message: String(body.message),
                targetSwimmerIds: Array.isArray(body.targetSwimmerIds) ? body.targetSwimmerIds : null,
                periodStart: body.periodStart || new Date().toISOString().split('T')[0],
                periodEnd: body.periodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        });
        return NextResponse.json(reminder, { status: 201, headers: V12_FINGERPRINT });
    });
}
