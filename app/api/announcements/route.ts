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
        const group = searchParams.get('group');

        let where: any = {};
        if (group) where.targetGroup = group;

        const announcements = await prisma.coachAnnouncement.findMany({
            where,
            include: { blocks: { orderBy: { sortOrder: 'asc' } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(announcements || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const { blocks } = data;

        const announcement = await prisma.coachAnnouncement.create({
            data: {
                targetSwimmerIds: data.targetSwimmerIds,
                targetGroup: data.targetGroup,
                blocks: {
                    create: (blocks || []).map((b: any, i: number) => ({
                        type: String(b.type),
                        content: String(b.content),
                        sortOrder: i,
                        thumbnailUrl: b.thumbnailUrl || null,
                    }))
                }
            },
            include: { blocks: { orderBy: { sortOrder: 'asc' } } }
        });
        return NextResponse.json(announcement, { headers: V12_FINGERPRINT });
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

        await prisma.coachAnnouncement.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
