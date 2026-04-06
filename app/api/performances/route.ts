
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const performances = await db.performances.findMany();
        return NextResponse.json(performances);
    } catch (error: any) {
        console.error('Failed to fetch performances (returning empty):', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const record = await db.performances.create(data);
        return NextResponse.json(record);
    } catch (error: any) {
        console.error('Failed to record performance:', error);
        return NextResponse.json({ error: error?.message || 'Failed to record performance' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const data = await request.json();
        const record = await db.performances.update(id, data);
        return NextResponse.json(record);
    } catch (error: any) {
        console.error('Failed to update performance:', error);
        return NextResponse.json({ error: 'Failed to update performance' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }
        await db.performances.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete performance:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete performance' }, { status: 500 });
    }
}
