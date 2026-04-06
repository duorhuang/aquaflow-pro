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
            // Filter in JS for maximum compatibility with Json fields in Edge
            reminders = (reminders || []).filter((r: any) => {
                if (!r.targetSwimmerIds) return true; // Targets everyone
                const targets = Array.isArray(r.targetSwimmerIds) ? r.targetSwimmerIds : [];
                return targets.includes(swimmerId);
            }).map((r: any) => ({
                ...r,
                isResponded: r.responses && r.responses.some((resp: any) => resp.swimmerId === swimmerId)
            }));
        }

        return NextResponse.json(reminders || []);
    } catch (error: any) {
        console.error("GET reminders error (returning empty):", error);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const data = await req.json();
        
        // Handle response submission (targetedFeedback)
        if (data.reminderId && data.swimmerId && data.content) {
            const response = await prisma.targetedFeedback.create({
                data: {
                    reminderId: data.reminderId,
                    swimmerId: data.swimmerId,
                    content: data.content,
                    rpe: Number(data.rpe) || 0,
                    soreness: Number(data.soreness) || 0
                }
            });
            return NextResponse.json(response);
        }

        // Handle reminder creation (coach)
        const reminder = await prisma.feedbackReminder.create({
            data: {
                message: data.message,
                targetSwimmerIds: Array.isArray(data.targetSwimmerIds) ? data.targetSwimmerIds : null,
                periodStart: data.periodStart || new Date().toISOString().split('T')[0],
                periodEnd: data.periodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
        });
        return NextResponse.json(reminder);
    } catch (error: any) {
        console.error("POST reminder/response error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
