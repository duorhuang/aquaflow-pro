import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const swimmerId = searchParams.get('swimmerId');
        const withResponses = searchParams.get('withResponses') === 'true';

        let reminders;
        if (swimmerId) {
            // Find reminders that target this swimmer or everyone
            reminders = await (db.feedbackReminders as any).findMany({
                where: {
                    OR: [
                        { targetSwimmerIds: { equals: null } },
                        { targetSwimmerIds: { array_contains: swimmerId } }
                    ]
                },
                include: {
                    responses: {
                        where: { swimmerId }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            
            // Map to include isResponded status
            reminders = reminders.map((r: any) => ({
                ...r,
                isResponded: r.responses && r.responses.length > 0
            }));
        } else {
            reminders = await (db.feedbackReminders as any).findMany({
                include: withResponses ? { responses: { include: { swimmer: true } } } : false,
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json(reminders);
    } catch (error: any) {
        console.error("GET reminders error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        
        // Handle response submission
        if (data.reminderId && data.swimmerId && data.content) {
            const response = await (db.targetedFeedbacks as any).create({
                reminderId: data.reminderId,
                swimmerId: data.swimmerId,
                content: data.content,
                rpe: data.rpe,
                soreness: data.soreness
            });
            return NextResponse.json(response);
        }

        // Handle reminder creation (coach)
        const reminder = await db.feedbackReminders.create({
            message: data.message,
            targetSwimmerIds: data.targetSwimmerIds,
            periodStart: data.periodStart || new Date().toISOString().split('T')[0],
            periodEnd: data.periodEnd || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        return NextResponse.json(reminder);
    } catch (error: any) {
        console.error("POST reminder/response error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
