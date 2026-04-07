import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V11_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const swimmerId = searchParams.get('swimmerId');
        const weekStart = searchParams.get('weekStart');

        if (swimmerId && weekStart) {
            const feedback = await prisma.weeklyFeedback.findUnique({
                where: { swimmerId_weekStart: { swimmerId, weekStart } },
                include: { dailyFeedbacks: true, swimmer: true }
            });
            return NextResponse.json(feedback, { headers: V11_FINGERPRINT });
        }

        const feedbacks = await prisma.weeklyFeedback.findMany({
            include: { dailyFeedbacks: true, swimmer: true },
            orderBy: { weekStart: 'desc' }
        });
        return NextResponse.json(feedbacks || [], { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to fetch weekly feedbacks:', error);
        return NextResponse.json([], { headers: V11_FINGERPRINT });
    }
}

export async function POST(request: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());
        
        const { swimmerId, weekStart, summary, isSubmitted, dailyFeedbacks, coachReply, isReplied } = data;

        const feedback = await prisma.weeklyFeedback.upsert({
            where: { swimmerId_weekStart: { swimmerId, weekStart } },
            update: {
                summary,
                isSubmitted: isSubmitted ?? false,
                submittedAt: isSubmitted ? new Date().toISOString() : undefined,
                coachReply,
                isReplied,
                repliedAt: coachReply ? new Date().toISOString() : undefined,
                dailyFeedbacks: dailyFeedbacks ? {
                    upsert: dailyFeedbacks.map((df: any) => ({
                        where: { weeklyFeedbackId_date: { weeklyFeedbackId: 'temp', date: df.date } },
                        update: { rpe: df.rpe, soreness: df.soreness, reflection: df.reflection },
                        create: { date: df.date, rpe: df.rpe, soreness: df.soreness, reflection: df.reflection }
                    }))
                } : undefined
            },
            create: {
                swimmerId,
                weekStart,
                summary,
                isSubmitted: isSubmitted ?? false,
                submittedAt: isSubmitted ? new Date().toISOString() : undefined,
                dailyFeedbacks: dailyFeedbacks ? {
                    create: dailyFeedbacks.map((df: any) => ({
                        date: df.date, rpe: df.rpe, soreness: df.soreness, reflection: df.reflection
                    }))
                } : undefined
            }
        });
        return NextResponse.json(feedback, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to save weekly feedback:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function PATCH(request: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());
        const { id, coachReply, isReplied } = data;
        
        const feedback = await prisma.weeklyFeedback.update({
            where: { id },
            data: {
                coachReply,
                isReplied: isReplied ?? true,
                repliedAt: new Date().toISOString()
            }
        });
        return NextResponse.json(feedback, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to reply weekly feedback:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}
