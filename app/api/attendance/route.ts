import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V8_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = getPrisma();
        const attendance = await prisma.attendanceRecord.findMany({
            include: { swimmer: true },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(attendance || [], { headers: V8_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to fetch attendance:', error);
        return NextResponse.json([], { headers: V8_FINGERPRINT });
    }
}

export async function POST(request: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());
        
        const record = await prisma.attendanceRecord.create({
            data: {
                date: String(data.date),
                swimmerId: String(data.swimmerId),
                status: String(data.status || 'Present'),
                timestamp: data.timestamp || new Date().toISOString()
            }
        });
        return NextResponse.json(record, { headers: V8_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to record attendance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V8_FINGERPRINT });
    }
}

export async function DELETE(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.attendanceRecord.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V8_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to delete attendance:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V8_FINGERPRINT });
    }
}
