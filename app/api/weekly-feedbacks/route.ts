import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { swimmerId, weekStart, summary, dailyFeedbacks } = body;

        // Smart auto-submission logic: Check if they actually have attendance this week
        // and if they actually wrote any feedback.
        let hasContent = false;
        if (summary && summary.trim().length > 0) hasContent = true;
        for (const df of dailyFeedbacks) {
            if (df.reflection && df.reflection.trim().length > 0) hasContent = true;
        }

        if (!hasContent) {
            return NextResponse.json({ success: true, skipped: true, message: "No feedback provided." });
        }

        const weeklyFeedback = await db.weeklyFeedback.upsert({
            where: {
                swimmerId_weekStart: {
                    swimmerId,
                    weekStart
                }
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
        for (const df of dailyFeedbacks) {
            if (!df.date) continue;
            const existing = await db.dailyFeedback.findFirst({
                where: {
                    weeklyFeedbackId: weeklyFeedback.id,
                    date: df.date
                }
            });

            if (existing) {
                await db.dailyFeedback.update({
                    where: { id: existing.id },
                    data: {
                        rpe: df.rpe,
                        soreness: df.soreness,
                        reflection: df.reflection
                    }
                });
            } else {
                await db.dailyFeedback.create({
                    data: {
                        weeklyFeedbackId: weeklyFeedback.id,
                        date: df.date,
                        rpe: df.rpe,
                        soreness: df.soreness,
                        reflection: df.reflection
                    }
                });
            }
        }

        return NextResponse.json(weeklyFeedback);
    } catch (error) {
        console.error("Weekly feedback error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
