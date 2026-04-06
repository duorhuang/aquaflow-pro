import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const submittedOnly = searchParams.get('submitted') === 'true';
        const swimmerId = searchParams.get('swimmerId');
        const weekStart = searchParams.get('weekStart');

        if (swimmerId && weekStart) {
            const feedback = await prisma.weeklyFeedback.findUnique({
                where: {
                    swimmerId_weekStart: { swimmerId, weekStart }
                },
                include: { 
                    dailyFeedbacks: {
                        orderBy: { date: 'asc' }
                    }, 
                    swimmer: true 
                }
            });
            return NextResponse.json(feedback || null);
        }

        if (submittedOnly) {
            const feedbacks = await prisma.weeklyFeedback.findMany({
                where: { isSubmitted: true },
                include: { 
                    dailyFeedbacks: {
                        orderBy: { date: 'asc' }
                    }, 
                    swimmer: true 
                },
                orderBy: { submittedAt: 'desc' }
            });
            return NextResponse.json(feedbacks || []);
        }

        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    } catch (error: any) {
        console.error("❌ GET weekly feedbacks error:", error);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const body = await req.json();
        const { swimmerId, weekStart, summary, dailyFeedbacks, isSubmitted = true } = body;

        if (!swimmerId || !weekStart) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Perform everything in a single transaction
        const result = await prisma.$transaction(async (tx) => {
            const weeklyFeedback = await tx.weeklyFeedback.upsert({
                where: {
                    swimmerId_weekStart: { swimmerId, weekStart }
                },
                update: {
                    summary,
                    isSubmitted,
                    submittedAt: isSubmitted ? new Date().toISOString() : undefined,
                    updatedAt: new Date()
                },
                create: {
                    swimmerId,
                    weekStart,
                    summary,
                    isSubmitted,
                    submittedAt: isSubmitted ? new Date().toISOString() : undefined
                }
            });

            if (dailyFeedbacks && dailyFeedbacks.length > 0) {
                await Promise.all(
                    dailyFeedbacks.map((df: any) => {
                        if (!df.date) return Promise.resolve();
                        return tx.dailyFeedback.upsert({
                            where: {
                                weeklyFeedbackId_date: {
                                    weeklyFeedbackId: weeklyFeedback.id,
                                    date: df.date
                                }
                            },
                            update: {
                                rpe: Number(df.rpe) || 0,
                                soreness: Number(df.soreness) || 0,
                                reflection: df.reflection
                            },
                            create: {
                                weeklyFeedbackId: weeklyFeedback.id,
                                date: df.date,
                                rpe: Number(df.rpe) || 0,
                                soreness: Number(df.soreness) || 0,
                                reflection: df.reflection
                            }
                        });
                    })
                );
            }

            return weeklyFeedback;
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("❌ POST weekly feedback error:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const prisma = getPrisma();
        const body = await req.json();
        const { id, coachReply, readAt } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
        }

        const data: any = {};
        if (coachReply !== undefined) {
            data.coachReply = coachReply;
            data.isReplied = true;
            data.repliedAt = new Date().toISOString();
        }
        if (readAt !== undefined) {
            data.readAt = readAt ? new Date().toISOString() : null;
        }

        const updated = await prisma.weeklyFeedback.update({
            where: { id },
            data
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("📋 PATCH weekly feedback error:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
    }
}
