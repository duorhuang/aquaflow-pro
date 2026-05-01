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
        const { searchParams } = new URL(req.url);
        const planId = searchParams.get('planId');

        if (planId) {
            const analysis = await prisma.planAnalysis.findUnique({
                where: { planId }
            });
            return NextResponse.json(analysis ?? null, { headers: V12_FINGERPRINT });
        }

        // Coach: list all analyses
        const analyses = await prisma.planAnalysis.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(analyses || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        if (!data.planId || !data.imageUrl) {
            return NextResponse.json({ error: 'planId and imageUrl required' }, { status: 400 });
        }

        const analysis = await prisma.planAnalysis.upsert({
            where: { planId: String(data.planId) },
            create: {
                planId: String(data.planId),
                imageUrl: String(data.imageUrl),
                rawText: data.rawText || null,
                structuredData: data.structuredData || null,
                coachInsights: data.coachInsights || null,
                aiSuggestions: data.aiSuggestions || null
            },
            update: {
                imageUrl: String(data.imageUrl),
                rawText: data.rawText,
                structuredData: data.structuredData,
                coachInsights: data.coachInsights,
                aiSuggestions: data.aiSuggestions
            }
        });
        return NextResponse.json(analysis, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const planId = searchParams.get('planId');
        if (!planId) return NextResponse.json({ error: 'planId required' }, { status: 400 });

        await prisma.planAnalysis.delete({ where: { planId } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
