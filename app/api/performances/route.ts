
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const performances = await db.performances.findMany();
        return NextResponse.json(performances);
    } catch (error: any) {
        console.error('Failed to fetch performances:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch performances' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const record = await db.performances.create(data);
        return NextResponse.json(record);
    } catch (error: any) {
        console.error('Failed to record performance:', error);
        return NextResponse.json({ error: error?.message || 'Failed to record performance' }, { status: 500 });
    }
}
