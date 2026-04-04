
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const plans = await db.plans.findMany();
        return NextResponse.json(plans);
    } catch (error: any) {
        console.error('Failed to fetch plans:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const plan = await db.plans.create(data);
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
        const data = await request.json();

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const plan = await db.plans.update(id, data);
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

        await db.plans.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete plan:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete plan' }, { status: 500 });
    }
}
