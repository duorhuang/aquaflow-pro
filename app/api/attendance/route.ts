
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const attendance = await db.attendance.findMany();
        return NextResponse.json(attendance);
    } catch (error: any) {
        console.error('Failed to fetch attendance:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch attendance' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const record = await db.attendance.create(data);
        return NextResponse.json(record);
    } catch (error: any) {
        console.error('Failed to record attendance:', error);
        return NextResponse.json({ error: error?.message || 'Failed to record attendance' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }
        await db.attendance.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete attendance:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete attendance' }, { status: 500 });
    }
}
