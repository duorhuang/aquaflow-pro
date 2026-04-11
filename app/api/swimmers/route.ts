import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const swimmers = await prisma.swimmer.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(swimmers || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const data = flattenPayload(await request.json());

        const swimmer = await prisma.swimmer.create({
            data: {
                name: String(data.name),
                group: String(data.group),
                username: String(data.username),
                password: String(data.password),
                status: data.status || 'Active',
                readiness: Number(data.readiness) || 100,
                xp: Number(data.xp) || 0,
                level: Number(data.level) || 1
            }
        });
        return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        const swimmer = await prisma.swimmer.update({
            where: { id },
            data: {
                name: data.name,
                group: data.group,
                username: data.username,
                password: data.password,
                status: data.status,
                readiness: data.readiness !== undefined ? Number(data.readiness) : undefined,
                xp: data.xp !== undefined ? Number(data.xp) : undefined,
                level: data.level !== undefined ? Number(data.level) : undefined
            }
        });
        return NextResponse.json(swimmer, { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.swimmer.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
