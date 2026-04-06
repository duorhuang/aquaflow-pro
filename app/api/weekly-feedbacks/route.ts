import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload } from '@/lib/prisma';

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
            return NextResponse.json({ data: feedback || null, _build: "V5-ULTRA" });
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
            return NextResponse.json({ data: feedbacks || [], _build: "V5-ULTRA" });
        }

        return NextResponse.json({ error: 'Invalid parameters', _build: "V5-ULTRA" }, { status: 400 });
    } catch (error: any) {
        console.error("❌ GET weekly feedbacks error:", error);
        return NextResponse.json({ data: [], _build: "V5-ULTRA" });
    }
}

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await req.json());
        
        const { swimmerId, weekStart, summary, dailyFeedbacks, isSubmitted = true } = data;

        if (!swimmerId || !weekStart) {
            return NextResponse.json({ error: "Missing required fields", _build: "V5-ULTRA" }, { status: 400 });
        }

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

            if (dailyFeedbacks && Array.isArray(dailyFeedbacks)) {
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

        return NextResponse.json({ ...result, _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error("❌ POST weekly feedback error:", error);
        return NextResponse.json({ error: error.message || "Internal Error", _build: "V5-ULTRA" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await req.json());
        const { id, coachReply, readAt } = data;

        if (!id) {
            return NextResponse.json({ error: "Missing required field: id" }, { status: 400 });
        }

        const updateData: any = {};
        if (coachReply !== undefined) {
            updateData.coachReply = coachReply;
            updateData.isReplied = true;
            updateData.repliedAt = new Date().toISOString();
        }
        if (readAt !== undefined) {
            updateData.readAt = readAt ? new Date().toISOString() : null;
        }

        const updated = await prisma.weeklyFeedback.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ ...updated, _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error("📋 PATCH weekly feedback error:", error);
        return NextResponse.json({ error: error.message, _build: "V5-ULTRA" }, { status: 500 });
    }
}
