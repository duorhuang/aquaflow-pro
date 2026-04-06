import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const plans = await prisma.trainingPlan.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(plans || []);
    } catch (error: any) {
        console.error('Failed to fetch plans (returning empty):', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const plan = await prisma.trainingPlan.create({
            data: {
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                group: data.group,
                blocks: data.blocks || [],
                totalDistance: Number(data.totalDistance) || 0,
                focus: data.focus || '',
                status: data.status || 'Active',
                coachNotes: data.coachNotes,
                targetedNotes: data.targetedNotes || {},
                imageUrl: data.imageUrl,
                isStarred: data.isStarred || false
            }
        });
        return NextResponse.json(plan);
    } catch (error: any) {
        console.error('Failed to create plan:', error);
        return NextResponse.json({ error: error?.message || 'Failed to create plan' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await request.json();
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
        return NextResponse.json({ error: error?.message || 'Failed to update plan' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.trainingPlan.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete plan:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete plan' }, { status: 500 });
    }
}
