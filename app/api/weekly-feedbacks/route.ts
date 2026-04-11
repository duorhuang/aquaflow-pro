import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const swimmerId = searchParams.get('swimmerId');
        const weekStart = searchParams.get('weekStart');

        if (swimmerId && weekStart) {
            const feedback = await prisma.weeklyFeedback.findUnique({
                where: { swimmerId_weekStart: { swimmerId, weekStart } },
                include: { dailyFeedbacks: true, swimmer: true }
            });
            return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
        }

        const feedbacks = await prisma.weeklyFeedback.findMany({
            include: { dailyFeedbacks: true, swimmer: true },
            orderBy: { weekStart: 'desc' }
        });
        return NextResponse.json(feedbacks || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
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
                        where: { swimmerId_date: { swimmerId, date: df.date } }, // Uses the unique constraint on DailyFeedback
                        update: { rpe: df.rpe, soreness: df.soreness, reflection: df.reflection },
                        create: { date: df.date, rpe: df.rpe, soreness: df.soreness, reflection: df.reflection, swimmerId }
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
                        date: df.date, rpe: df.rpe, soreness: df.soreness, reflection: df.reflection, swimmerId
                    }))
                } : undefined
            }
        });
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}

export async function PATCH(request: Request) {
    return withApiHandler(async () => {
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
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}
