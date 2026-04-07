import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V11_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group');
        const isPublished = searchParams.get('isPublished') === 'true';

        let where: any = {};
        if (group) where.group = group;
        if (searchParams.has('isPublished')) where.isPublished = isPublished;

        const plans = await prisma.weeklyPlan.findMany({
            where,
            include: { sessions: true },
            orderBy: { weekStart: 'desc' }
        });
        return NextResponse.json(plans || [], { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to fetch weekly plans:', error);
        return NextResponse.json([], { headers: V11_FINGERPRINT });
    }
}

export async function POST(request: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const plan = await prisma.weeklyPlan.create({
            data: {
                weekStart: String(data.weekStart),
                weekEnd: String(data.weekEnd),
                group: String(data.group),
                title: data.title,
                coachNotes: data.coachNotes,
                isPublished: Boolean(data.isPublished)
            }
        });
        return NextResponse.json(plan, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to create weekly plan:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function PUT(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        const plan = await prisma.weeklyPlan.update({
            where: { id },
            data: {
                weekStart: data.weekStart,
                weekEnd: data.weekEnd,
                group: data.group,
                title: data.title,
                coachNotes: data.coachNotes,
                isPublished: data.isPublished
            }
        });
        return NextResponse.json(plan, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to update weekly plan:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function DELETE(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.weeklyPlan.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to delete weekly plan:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}
