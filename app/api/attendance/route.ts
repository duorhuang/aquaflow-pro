import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const attendance = await prisma.attendanceRecord.findMany({
            include: { swimmer: true },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(attendance || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());
        
        const id = data.id || '';
        
        let record;
        if (id) {
            // Check if it exists. If the client sent an ID, it might already exist.
            const existing = await prisma.attendanceRecord.findUnique({ where: { id } });
            if (existing) {
                record = await prisma.attendanceRecord.update({
                    where: { id },
                    data: {
                        status: String(data.status || 'Present'),
                        timestamp: data.timestamp || new Date().toISOString()
                    }
                });
            } else {
                record = await prisma.attendanceRecord.create({
                    data: {
                        id,
                        date: String(data.date),
                        swimmerId: String(data.swimmerId),
                        status: String(data.status || 'Present'),
                        timestamp: data.timestamp || new Date().toISOString()
                    }
                });
            }
        } else {
            record = await prisma.attendanceRecord.create({
                data: {
                    date: String(data.date),
                    swimmerId: String(data.swimmerId),
                    status: String(data.status || 'Present'),
                    timestamp: data.timestamp || new Date().toISOString()
                }
            });
        }
        
        return NextResponse.json(record, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.attendanceRecord.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
