
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Force dynamic rendering - don't try to connect to DB at build time
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const swimmers = await db.swimmers.findMany();
        return NextResponse.json(swimmers);
    } catch (error: any) {
        console.error('Failed to fetch swimmers:', error);
        return NextResponse.json({
            error: 'Failed to fetch swimmers',
            details: error?.message || 'Unknown error',
            name: error?.name || 'Error'
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const swimmer = await db.swimmers.create({
            ...data,
            id: data.id || crypto.randomUUID(),
            readiness: data.readiness || 100,
            status: data.status || 'Active'
        });
        return NextResponse.json(swimmer);
    } catch (error: any) {
        console.error('Failed to create swimmer:', error);
        let errorMsg = error.message || 'Failed to create swimmer';
        
        // P2002 is Prisma's unique constraint violation code
        if (error.code === 'P2002') {
            errorMsg = '该用户名已被其他队员占用，请尝试更换另一个用户名。';
        }
        
        return NextResponse.json(
            { error: errorMsg },
            { status: 500 }
        );
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

        const swimmer = await db.swimmers.update(id, data);
        return NextResponse.json(swimmer);
    } catch (error: any) {
        console.error('Failed to update swimmer:', error);
        
        let errorMsg = error.message || 'Failed to update swimmer';
        if (error.code === 'P2002') {
            errorMsg = '该用户名已被其他队员占用，请尝试更换另一个用户名。';
        }
        
        return NextResponse.json(
            { error: errorMsg },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        await db.swimmers.delete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete swimmer:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete swimmer' },
            { status: 500 }
        );
    }
}
