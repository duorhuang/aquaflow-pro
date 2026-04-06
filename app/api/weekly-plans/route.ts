import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

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
            return NextResponse.json(plan);
        }

        const where = group ? { group } : {};
        const plans = await prisma.weeklyPlan.findMany({
            where,
            include: { sessions: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { weekStart: 'desc' }
        });

        return NextResponse.json(plans || []);
    } catch (error: any) {
        console.error("GET weekly plans error:", error);
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const prisma = getPrisma();
        const body = await req.json();
        const data = body.data || body;
        
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
        return NextResponse.json(plan);
    } catch (error: any) {
        console.error("POST weekly plan error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const body = await req.json();
        const data = body.data || body;

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
        return NextResponse.json(plan);
    } catch (error: any) {
        console.error("PUT weekly plan error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.weeklyPlan.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE weekly plan error:", error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
