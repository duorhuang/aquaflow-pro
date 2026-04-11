import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const plans = await prisma.trainingPlan.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(plans || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const plan = await prisma.trainingPlan.create({
            data: {
                date: String(data.date),
                startTime: data.startTime || '',
                endTime: data.endTime || '',
                group: String(data.group),
                blocks: data.blocks || [],
                totalDistance: Number(data.totalDistance) || 0,
                focus: data.focus || '',
                status: data.status || 'Active',
                coachNotes: data.coachNotes,
                targetedNotes: data.targetedNotes || {},
                imageUrl: data.imageUrl,
                isStarred: Boolean(data.isStarred)
            }
        });
        return NextResponse.json(plan, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        const plan = await prisma.trainingPlan.update({
            where: { id },
            data: {
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                group: data.group,
                blocks: data.blocks,
                totalDistance: data.totalDistance !== undefined ? Number(data.totalDistance) : undefined,
                focus: data.focus,
                status: data.status,
                coachNotes: data.coachNotes,
                targetedNotes: data.targetedNotes,
                imageUrl: data.imageUrl,
                isStarred: data.isStarred
            }
        });
        return NextResponse.json(plan, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.trainingPlan.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
