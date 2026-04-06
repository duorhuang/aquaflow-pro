import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = getPrisma();
        const plans = await prisma.trainingPlan.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(plans || []);
    } catch (error: any) {
        console.error('Failed to fetch plans:', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const prisma = getPrisma();
        const body = await request.json();
        const data = body.data || body;

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
        return NextResponse.json(plan);
    } catch (error: any) {
        console.error('Failed to create plan:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const body = await request.json();
        const data = body.data || body;

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
        return NextResponse.json(plan);
    } catch (error: any) {
        console.error('Failed to update plan:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.trainingPlan.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete plan:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
