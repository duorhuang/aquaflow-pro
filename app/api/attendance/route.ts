import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const attendance = await prisma.attendanceRecord.findMany({
            include: { swimmer: true },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(attendance || []);
    } catch (error: any) {
        console.error('Failed to fetch attendance (returning empty):', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const record = await prisma.attendanceRecord.create({
            data: {
                date: data.date,
                swimmerId: data.swimmerId,
                status: data.status,
                timestamp: data.timestamp || new Date().toISOString()
            }
        });
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
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.attendanceRecord.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete attendance:', error);
        return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }
}
