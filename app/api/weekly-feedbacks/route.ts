import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const submittedOnly = searchParams.get('submitted') === 'true';
        const swimmerId = searchParams.get('swimmerId');
        const weekStart = searchParams.get('weekStart');

        console.log(`🔍 GET WeeklyFeedbacks: swimmer=${swimmerId}, week=${weekStart}, submitted=${submittedOnly}`);

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
            console.log(`✅ Found ${feedbacks.length} submitted feedbacks`);
            return NextResponse.json(feedbacks);
        }

        return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    } catch (error: any) {
        console.error("❌ GET weekly feedbacks error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { swimmerId, weekStart, summary, dailyFeedbacks, isSubmitted = true } = body;

        if (!swimmerId || !weekStart) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        console.log(`📝 POST WeeklyFeedback: swimmer=${swimmerId}, week=${weekStart}, isSubmitted=${isSubmitted}`);

        // 1. Validate content
        let hasContent = false;
        if (summary && summary.trim().length > 0) hasContent = true;
        for (const df of (dailyFeedbacks || [])) {
            if (df.reflection && df.reflection.trim().length > 0) hasContent = true;
        }

        if (!hasContent && isSubmitted) {
            return NextResponse.json({ error: "Cannot submit empty feedback." }, { status: 400 });
        }

        // 2. Perform everything in a single transaction for atomicity and speed
        const result = await prisma.$transaction(async (tx) => {
            // Upsert the main weekly feedback record
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

            // Upsert all daily feedbacks in parallel within the transaction
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
                    })
                );
            }

            return weeklyFeedback;
        });

        console.log(`✅ Successfully saved feedback for ${swimmerId}`);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error("❌ POST weekly feedback error:", error);
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
