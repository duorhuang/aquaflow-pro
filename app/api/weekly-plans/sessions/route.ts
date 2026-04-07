import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V7_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await req.json());

        const session = await prisma.dailySession.create({
            data: {
                weeklyPlanId: String(data.weeklyPlanId),
                label: String(data.label),
                date: String(data.date),
                imageData: data.imageData,
                imageType: data.imageType,
                notes: data.notes,
                sortOrder: Number(data.sortOrder) || 0
            }
        });
        return NextResponse.json(session, { status: 201, headers: V7_FINGERPRINT });
    } catch (error: any) {
        console.error("POST session error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V7_FINGERPRINT });
    }
}

export async function PUT(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await req.json());

        const session = await prisma.dailySession.update({
            where: { id },
            data: {
                label: data.label,
                date: data.date,
                imageData: data.imageData,
                imageType: data.imageType,
                notes: data.notes,
                sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined
            }
        });
        return NextResponse.json(session, { headers: V7_FINGERPRINT });
    } catch (error: any) {
        console.error("PUT session error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V7_FINGERPRINT });
    }
}

export async function DELETE(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.dailySession.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V7_FINGERPRINT });
    } catch (error: any) {
        console.error("DELETE session error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V7_FINGERPRINT });
    }
}
