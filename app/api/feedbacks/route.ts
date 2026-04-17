import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const feedbacks = await prisma.feedback.findMany({
            include: { swimmer: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(feedbacks || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());
        
        const feedback = await prisma.feedback.create({
            data: {
                id: data.id,
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
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}
