import { NextResponse } from 'next/server';
import { getPrisma, flattenPayload, V11_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = getPrisma();
        const swimmers = await prisma.swimmer.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(swimmers || [], { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to fetch swimmers:', error);
        return NextResponse.json([], { headers: V11_FINGERPRINT });
    }
}

export async function POST(request: Request) {
    try {
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
        return NextResponse.json(swimmer, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to create swimmer:', error);
        let errorMsg = 'Failed to create swimmer';
        if (error.code === 'P2002') errorMsg = '该用户名已被其他队员占用。';
        return NextResponse.json({ error: errorMsg }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function PUT(request: Request) {
    try {
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
        return NextResponse.json(swimmer, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to update swimmer:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}

export async function DELETE(request: Request) {
    try {
        const prisma = getPrisma();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.swimmer.delete({ where: { id } });
        return NextResponse.json({ success: true }, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Failed to delete swimmer:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500, headers: V11_FINGERPRINT });
    }
}
