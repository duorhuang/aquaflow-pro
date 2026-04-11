import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
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
        return NextResponse.json(plans || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
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
        return NextResponse.json(plan, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
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
        return NextResponse.json(plan, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.weeklyPlan.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
