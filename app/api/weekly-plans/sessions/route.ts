import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V11_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
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
             return NextResponse.json(sessions || [], { headers: V11_FINGERPRINT });
        }

        if (!weeklyPlanId) return NextResponse.json([], { headers: V11_FINGERPRINT });

        const sessions = await prisma.dailySession.findMany({
            where: { weeklyPlanId },
            orderBy: { sortOrder: 'asc' }
        });
        return NextResponse.json(sessions || [], { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to fetch sessions:', error);
        return NextResponse.json([], { headers: V11_FINGERPRINT });
    }
}

export async function POST(request: Request) {
    try {
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
        return NextResponse.json(session, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to create session:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function DELETE(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.dailySession.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to delete session:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}
