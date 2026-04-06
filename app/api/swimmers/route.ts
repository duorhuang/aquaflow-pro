import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - don't try to connect to DB at build time
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const swimmers = await prisma.swimmer.findMany();
        return NextResponse.json(swimmers || []);
    } catch (error: any) {
        console.error('Failed to fetch swimmers (returning empty):', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const swimmer = await prisma.swimmer.create({
            data: {
                name: data.name,
                group: data.group,
                username: data.username,
                password: data.password,
                status: data.status || 'Active',
                readiness: Number(data.readiness) || 100,
                xp: Number(data.xp) || 0,
                level: Number(data.level) || 1
            }
        });
        return NextResponse.json(swimmer);
    } catch (error: any) {
        console.error('Failed to create swimmer:', error);
        let errorMsg = error.message || 'Failed to create swimmer';
        
        // P2002 is Prisma's unique constraint violation code
        if (error.code === 'P2002') {
            errorMsg = '该用户名已被其他队员占用，请尝试更换另一个用户名。';
        }
        
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = await request.json();
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
        return NextResponse.json(swimmer);
    } catch (error: any) {
        console.error('Failed to update swimmer:', error);
        let errorMsg = error.message || 'Failed to update swimmer';
        if (error.code === 'P2002') {
            errorMsg = '该用户名已被其他队员占用，请尝试更换另一个用户名。';
        }
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.swimmer.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete swimmer:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete swimmer' }, { status: 500 });
    }
}
