import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const performances = await prisma.performanceRecord.findMany({
            include: { swimmer: true },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(performances || []);
    } catch (error: any) {
        console.error('Failed to fetch performances (returning empty):', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const record = await prisma.performanceRecord.create({
            data: {
                swimmerId: data.swimmerId,
                event: data.event,
                time: data.time,
                date: data.date,
                isPB: data.isPB || false,
                meetName: data.meetName,
                notes: data.notes
            }
        });
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
        const record = await prisma.performanceRecord.update({
            where: { id },
            data: {
                event: data.event,
                time: data.time,
                date: data.date,
                isPB: data.isPB,
                meetName: data.meetName,
                notes: data.notes
            }
        });
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
        if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

        await prisma.performanceRecord.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete performance:', error);
        return NextResponse.json({ error: error?.message || 'Failed to delete performance' }, { status: 500 });
    }
}
