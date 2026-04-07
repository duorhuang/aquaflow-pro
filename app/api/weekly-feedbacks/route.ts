import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V7_FINGERPRINT } from '@/lib/prisma';

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
            return NextResponse.json(feedback || null, { headers: V7_FINGERPRINT });
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
            return NextResponse.json(feedbacks || [], { headers: V7_FINGERPRINT });
        }

        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400, headers: V7_FINGERPRINT });
    } catch (error: any) {
        console.error("❌ GET weekly feedbacks error:", error);
        return NextResponse.json([], { headers: V7_FINGERPRINT });
    }
}

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());
        
        const { swimmerId, weekStart, summary, dailyFeedbacks, isSubmitted = true } = data;

        if (!swimmerId || !weekStart) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: V7_FINGERPRINT });
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

        return NextResponse.json(result, { headers: V7_FINGERPRINT });
    } catch (error: any) {
        console.error("❌ POST weekly feedback error:", error);
        return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500, headers: V7_FINGERPRINT });
    }
}

export async function PATCH(req: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await req.json());
        const { id, coachReply, readAt } = data;

        if (!id) {
            return NextResponse.json({ error: "Missing required field: id" }, { status: 400, headers: V7_FINGERPRINT });
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

        return NextResponse.json(updated, { headers: V7_FINGERPRINT });
    } catch (error: any) {
        console.error("📋 PATCH weekly feedback error:", error);
        return NextResponse.json({ error: error.message }, { status: 500, headers: V7_FINGERPRINT });
    }
}
