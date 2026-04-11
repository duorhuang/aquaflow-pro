import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const weeklyPlanId = searchParams.get('weeklyPlanId');
        const date = searchParams.get('date');

        if (date) {
             const sessions = await prisma.dailySession.findMany({
                 where: { date },
                 include: { weeklyPlan: true },
                 orderBy: { label: 'asc' }
             });
             return NextResponse.json(sessions || [], { headers: V12_FINGERPRINT });
        }

        if (!weeklyPlanId) return NextResponse.json([], { headers: V12_FINGERPRINT });

        const sessions = await prisma.dailySession.findMany({
            where: { weeklyPlanId },
            orderBy: { sortOrder: 'asc' }
        });
        return NextResponse.json(sessions || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const session = await prisma.dailySession.create({
            data: {
                weeklyPlanId: String(data.weeklyPlanId),
                label: String(data.label),
                date: String(data.date),
                imageData: data.imageData,
                imageType: data.imageType,
                notes: data.notes,
                sortOrder: Number(data.sortOrder) || 0
            }
        });
        return NextResponse.json(session, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.dailySession.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
