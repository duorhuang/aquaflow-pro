
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const swimmers = await prisma.swimmer.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(swimmers);
    } catch (error) {
        console.error('Failed to fetch swimmers:', error);
        return NextResponse.json({ error: 'Failed to fetch swimmers' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const swimmer = await prisma.swimmer.create({
            data: {
                ...data,
                readiness: data.readiness || 100,
                // Ensure JSON fields are handled correctly if needed, Prisma handles object -> Json automatically
            }
        });
        return NextResponse.json(swimmer);
    } catch (error) {
        console.error('Failed to create swimmer:', error);
        return NextResponse.json({ error: 'Failed to create swimmer' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const data = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        const swimmer = await prisma.swimmer.update({
            where: { id },
            data
        });
        return NextResponse.json(swimmer);
    } catch (error) {
        console.error('Failed to update swimmer:', error);
        return NextResponse.json({ error: 'Failed to update swimmer' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await prisma.swimmer.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete swimmer:', error);
        return NextResponse.json({ error: 'Failed to delete swimmer' }, { status: 500 });
    }
}
