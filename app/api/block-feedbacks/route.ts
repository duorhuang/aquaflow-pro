import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireAthlete } from '@/lib/auth-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('planId');
        const blockId = searchParams.get('blockId');
        const swimmerId = searchParams.get('swimmerId');

        const where: any = {};
        if (planId) where.planId = planId;
        if (blockId) where.blockId = blockId;
        if (swimmerId) where.swimmerId = swimmerId;

        const feedbacks = await prisma.blockFeedback.findMany({
            where,
            include: { swimmer: { select: { id: true, name: true, group: true } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(feedbacks || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAthlete(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        // Upsert: unique constraint on [planId, blockId, swimmerId]
        const feedback = await prisma.blockFeedback.upsert({
            where: {
                planId_blockId_swimmerId: {
                    planId: String(data.planId),
                    blockId: String(data.blockId),
                    swimmerId: String(data.swimmerId)
                }
            },
            create: {
                planId: String(data.planId),
                blockId: String(data.blockId),
                swimmerId: String(data.swimmerId),
                reaction: data.reaction || null,
                comment: data.comment || null,
                tags: Array.isArray(data.tags) ? data.tags : []
            },
            update: {
                reaction: data.reaction,
                comment: data.comment,
                tags: Array.isArray(data.tags) ? data.tags : []
            }
        });
        return NextResponse.json(feedback, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAthlete(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.blockFeedback.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
