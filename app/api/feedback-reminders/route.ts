import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
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

        return NextResponse.json(reminders || []);
    } catch (error: any) {
        console.error("GET reminders error:", error);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const body = await req.json();
        
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
            return NextResponse.json(response);
        }

        // 2. Handle reminder creation (coach)
        // FORCE FLATTENING: Explicitly pull message and IDs regardless of nesting level
        const message = body.message || (body.data && body.data.message);
        const targetSwimmerIds = body.targetSwimmerIds || (body.data && body.data.targetSwimmerIds);

        if (!message) {
            return NextResponse.json({ error: "Missing 'message' in request body." }, { status: 400 });
        }

        const reminder = await prisma.feedbackReminder.create({
            data: {
                message: String(message),
                targetSwimmerIds: Array.isArray(targetSwimmerIds) ? targetSwimmerIds : null,
                periodStart: body.periodStart || new Date().toISOString().split('T')[0],
                periodEnd: body.periodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        });
        return NextResponse.json(reminder);
    } catch (error: any) {
        console.error("POST feedback-reminders error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
