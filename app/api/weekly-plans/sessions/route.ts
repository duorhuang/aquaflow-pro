import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(req.url);
        const weeklyPlanId = searchParams.get('weeklyPlanId');
        const date = searchParams.get('date');

        if (date) {
             const sessions = await prisma.dailySession.findMany({
                 where: { date },
                 include: { weeklyPlan: true },
                 orderBy: { label: 'asc' }
             });
             return NextResponse.json(sessions || [], { headers: V12_FINGERPRINT });
        }

        if (!weeklyPlanId) return NextResponse.json([], { headers: V12_FINGERPRINT });

        const sessions = await prisma.dailySession.findMany({
            where: { weeklyPlanId },
            orderBy: { sortOrder: 'asc' }
        });
        return NextResponse.json(sessions || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const session = await prisma.dailySession.create({
            data: {
                weeklyPlanId: String(data.weeklyPlanId),
                label: String(data.label),
                date: String(data.date),
                imageData: data.imageData,
                imageType: data.imageType,
                notes: data.notes,
                sortOrder: Number(data.sortOrder) || 0,
                contentBlocks: data.contentBlocks ?? null,
                contentHtml: data.contentHtml ?? null,
                editorMode: data.editorMode ?? "legacy",
            }
        });
        return NextResponse.json(session, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        const session = await prisma.dailySession.update({
            where: { id },
            data: {
                label: data.label,
                date: data.date,
                imageData: data.imageData,
                imageType: data.imageType,
                notes: data.notes,
                sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
                ...(data.contentBlocks !== undefined && { contentBlocks: data.contentBlocks }),
                ...(data.contentHtml !== undefined && { contentHtml: data.contentHtml }),
                ...(data.editorMode !== undefined && { editorMode: data.editorMode }),
            }
        });
        return NextResponse.json(session, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.dailySession.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
