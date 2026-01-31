
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const plans = await prisma.trainingPlan.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(plans);
    } catch (error) {
        console.error('Failed to fetch plans:', error);
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Parse JSON fields if they come as strings, though usually request.json() handles it
        const plan = await prisma.trainingPlan.create({
            data
        });
        return NextResponse.json(plan);
    } catch (error) {
        console.error('Failed to create plan:', error);
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const data = await request.json();

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const plan = await prisma.trainingPlan.update({
            where: { id },
            data
        });
        return NextResponse.json(plan);
    } catch (error) {
        console.error('Failed to update plan:', error);
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.trainingPlan.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete plan:', error);
        return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }
}
