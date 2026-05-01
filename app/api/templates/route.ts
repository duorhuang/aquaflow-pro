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
        const templates = await prisma.blockTemplate.findMany({
            orderBy: { category: 'asc' }
        });
        return NextResponse.json(templates || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const template = await prisma.blockTemplate.create({
            data: {
                templateId: String(data.templateId),
                name: String(data.name),
                category: String(data.category),
                type: String(data.type),
                rounds: Number(data.rounds) || 1,
                items: data.items || [],
                note: data.note
            }
        });
        return NextResponse.json(template, { headers: V12_FINGERPRINT });
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

        const template = await prisma.blockTemplate.update({
            where: { id },
            data: {
                name: data.name,
                category: data.category,
                type: data.type,
                rounds: data.rounds !== undefined ? Number(data.rounds) : undefined,
                items: data.items,
                note: data.note
            }
        });
        return NextResponse.json(template, { headers: V12_FINGERPRINT });
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

        await prisma.blockTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
