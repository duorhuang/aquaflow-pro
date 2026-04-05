import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const submitted = searchParams.get('submitted') === 'true';
        const swimmerId = searchParams.get('swimmerId');
        const weekStart = searchParams.get('weekStart');

        if (swimmerId && weekStart) {
            const feedback = await (db.weeklyFeedbacks as any).findUnique({
                where: {
                    swimmerId_weekStart: { swimmerId, weekStart }
                },
                include: { dailyFeedbacks: true, swimmer: true }
            });
            return NextResponse.json(feedback || null);
        }

        if (submitted) {
            const feedbacks = await (db.weeklyFeedbacks as any).findMany({
                where: { isSubmitted: true },
                include: { dailyFeedbacks: true, swimmer: true },
                orderBy: { submittedAt: 'desc' }
            });
            return NextResponse.json(feedbacks);
        }

        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    } catch (error: any) {
        console.error("GET weekly feedbacks error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { swimmerId, weekStart, summary, dailyFeedbacks } = body;

        if (!swimmerId || !weekStart) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Smart auto-submission logic
        let hasContent = false;
        if (summary && summary.trim().length > 0) hasContent = true;
        for (const df of (dailyFeedbacks || [])) {
            if (df.reflection && df.reflection.trim().length > 0) hasContent = true;
        }

        if (!hasContent) {
            return NextResponse.json({ success: true, skipped: true, message: "No feedback provided." });
        }

        const weeklyFeedback = await (db.weeklyFeedbacks as any).upsert({
            where: {
                swimmerId_weekStart: { swimmerId, weekStart }
            },
            update: {
                summary,
                isSubmitted: true,
                submittedAt: new Date().toISOString()
            },
            create: {
                swimmerId,
                weekStart,
                summary,
                isSubmitted: true,
                submittedAt: new Date().toISOString()
            }
        });

        // Upsert daily feedbacks
        for (const df of (dailyFeedbacks || [])) {
            if (!df.date) continue;
            
            // Using prisma directly for complex upserts if needed, or but here we use db abstraction
            await (db.dailyFeedbacks as any).upsert({
                where: {
                    weeklyFeedbackId_date: {
                        weeklyFeedbackId: weeklyFeedback.id,
                        date: df.date
                    }
                },
                update: {
                    rpe: df.rpe,
                    soreness: df.soreness,
                    reflection: df.reflection
                },
                create: {
                    weeklyFeedbackId: weeklyFeedback.id,
                    date: df.date,
                    rpe: df.rpe,
                    soreness: df.soreness,
                    reflection: df.reflection
                }
            });
        }

        return NextResponse.json(weeklyFeedback);
    } catch (error: any) {
        console.error("POST weekly feedback error:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, coachReply } = body;

        if (!id || !coachReply) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const updated = await (db.weeklyFeedbacks as any).update({
            where: { id },
            data: {
                coachReply,
                isReplied: true,
                repliedAt: new Date().toISOString()
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("PATCH weekly feedback error:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}
