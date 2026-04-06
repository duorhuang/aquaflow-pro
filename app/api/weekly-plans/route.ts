import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group');
        const id = searchParams.get('id');

        if (id) {
            const plan = await prisma.weeklyPlan.findUnique({
                where: { id },
                include: { sessions: { orderBy: { sortOrder: 'asc' } } }
            });
            return NextResponse.json({ data: plan, _build: "V5-ULTRA" });
        }

        const where = group ? { group } : {};
        const plans = await prisma.weeklyPlan.findMany({
            where,
            include: { sessions: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { weekStart: 'desc' }
        });

        return NextResponse.json({ data: plans || [], _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error("GET weekly plans error:", error);
        return NextResponse.json({ data: [], _build: "V5-ULTRA" });
    }
}

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const data = flattenPayload(await req.json());
        
        const plan = await prisma.weeklyPlan.create({
            data: {
                weekStart: String(data.weekStart),
                weekEnd: String(data.weekEnd),
                group: String(data.group),
                title: String(data.title),
                coachNotes: data.coachNotes,
                isPublished: Boolean(data.isPublished)
            }
        });
        return NextResponse.json({ ...plan, _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error("POST weekly plan error:", error);
        return NextResponse.json({ error: 'Failed', _build: "V5-ULTRA" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await req.json());

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
        return NextResponse.json({ ...plan, _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error("PUT weekly plan error:", error);
        return NextResponse.json({ error: 'Failed', _build: "V5-ULTRA" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.weeklyPlan.delete({ where: { id } });
        return NextResponse.json({ success: true, _build: "V5-ULTRA" });
    } catch (error: any) {
        console.error("DELETE weekly plan error:", error);
        return NextResponse.json({ error: 'Failed', _build: "V5-ULTRA" }, { status: 500 });
    }
}
