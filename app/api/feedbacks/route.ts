import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

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
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        // Upsert: update if same swimmer+date exists, create otherwise
        const feedback = await prisma.feedback.upsert({
            where: {
                swimmerId_date: { swimmerId: String(data.swimmerId), date: String(data.date) }
            },
            update: {
                rpe: Number(data.rpe) || 0,
                soreness: Number(data.soreness) || 0,
                comments: data.comments || '',
                timestamp: data.timestamp || new Date().toISOString(),
                goodPoints: data.goodPoints,
                improvementAreas: data.improvementAreas,
            },
            create: {
                id: data.id,
                swimmerId: String(data.swimmerId),
                planId: data.planId,
                date: String(data.date),
                rpe: Number(data.rpe) || 0,
                soreness: Number(data.soreness) || 0,
                comments: data.comments || '',
                timestamp: data.timestamp || new Date().toISOString(),
                goodPoints: data.goodPoints,
                improvementAreas: data.improvementAreas,
            }
        });
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const feedback = await prisma.feedback.update({
            where: { id: String(data.id) },
            data: {
                rpe: Number(data.rpe) || 0,
                soreness: Number(data.soreness) || 0,
                comments: data.comments || '',
                timestamp: new Date().toISOString(),
                goodPoints: data.goodPoints,
                improvementAreas: data.improvementAreas,
            }
        });
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}
