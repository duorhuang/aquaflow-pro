
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const attendance = await prisma.attendanceRecord.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Failed to fetch attendance:', error);
        return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const record = await prisma.attendanceRecord.create({
            data
        });
        return NextResponse.json(record);
    } catch (error) {
        console.error('Failed to record attendance:', error);
        return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
    }
}
