import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const session = await prisma.dailySession.create({
            data: {
                weeklyPlanId: data.weeklyPlanId,
                label: data.label,
                date: data.date,
                imageData: data.imageData,
                imageType: data.imageType,
                notes: data.notes,
                sortOrder: data.sortOrder || 0
            }
        });
        return NextResponse.json(session);
    } catch (error: any) {
        console.error("POST session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await req.json();
        const session = await prisma.dailySession.update({
            where: { id },
            data: {
                label: data.label,
                date: data.date,
                imageData: data.imageData,
                imageType: data.imageType,
                notes: data.notes,
                sortOrder: data.sortOrder
            }
        });
        return NextResponse.json(session);
    } catch (error: any) {
        console.error("PUT session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.dailySession.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE session error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
