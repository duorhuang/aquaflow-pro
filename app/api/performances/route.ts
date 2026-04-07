import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V11_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = getPrisma();
        const performances = await prisma.performanceRecord.findMany({
            include: { swimmer: true },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(performances || [], { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to fetch performances:', error);
        return NextResponse.json([], { headers: V11_FINGERPRINT });
    }
}

export async function POST(request: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const record = await prisma.performanceRecord.create({
            data: {
                swimmerId: String(data.swimmerId),
                event: String(data.event),
                time: String(data.time),
                date: String(data.date),
                isPB: Boolean(data.isPB),
                meetName: data.meetName,
                notes: data.notes
            }
        });
        return NextResponse.json(record, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to record performance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function PUT(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        
        const data = flattenPayload(await request.json());

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
        return NextResponse.json(record, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to update performance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function DELETE(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

        await prisma.performanceRecord.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to delete performance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}
