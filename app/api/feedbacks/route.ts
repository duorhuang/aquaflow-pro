import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = getPrisma();
        const feedbacks = await prisma.feedback.findMany({
            include: { swimmer: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ data: feedbacks || [], _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error('Failed to fetch feedbacks:', error);
        return NextResponse.json({ data: [], _build: "V5-ULTRA" });
    }
}

export async function POST(request: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());
        
        const feedback = await prisma.feedback.create({
            data: {
                swimmerId: String(data.swimmerId),
                planId: data.planId,
                date: String(data.date),
                rpe: Number(data.rpe) || 0,
                soreness: Number(data.soreness) || 0,
                comments: data.comments || '',
                timestamp: data.timestamp || new Date().toISOString(),
                goodPoints: data.goodPoints,
                improvementAreas: data.improvementAreas
            }
        });
        return NextResponse.json({ ...feedback, _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error('Failed to submit feedback:', error);
        return NextResponse.json({ error: 'Failed', _build: "V5-ULTRA" }, { status: 500 });
    }
}
