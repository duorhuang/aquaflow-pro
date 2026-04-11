import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const performances = await prisma.performanceRecord.findMany({
            include: { swimmer: true },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(performances || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
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
        return NextResponse.json(record, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
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
        return NextResponse.json(record, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });

        await prisma.performanceRecord.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
