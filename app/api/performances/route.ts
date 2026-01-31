
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const performances = await prisma.performanceRecord.findMany({
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(performances);
    } catch (error) {
        console.error('Failed to fetch performances:', error);
        return NextResponse.json({ error: 'Failed to fetch performances' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const record = await prisma.performanceRecord.create({
            data
        });
        return NextResponse.json(record);
    } catch (error) {
        console.error('Failed to record performance:', error);
        return NextResponse.json({ error: 'Failed to record performance' }, { status: 500 });
    }
}
