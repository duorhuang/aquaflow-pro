
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const feedbacks = await db.feedbacks.findMany();
        return NextResponse.json(feedbacks);
    } catch (error: any) {
        console.error('Failed to fetch feedbacks:', error);
        return NextResponse.json({ error: error?.message || 'Failed to fetch feedbacks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const feedback = await db.feedbacks.create(data);
        return NextResponse.json(feedback);
    } catch (error: any) {
        console.error('Failed to submit feedback:', error);
        return NextResponse.json({ error: error?.message || 'Failed to submit feedback' }, { status: 500 });
    }
}
