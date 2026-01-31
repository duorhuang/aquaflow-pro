
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const feedbacks = await prisma.feedback.findMany({
            orderBy: { timestamp: 'desc' }
        });
        return NextResponse.json(feedbacks);
    } catch (error) {
        console.error('Failed to fetch feedbacks:', error);
        return NextResponse.json({ error: 'Failed to fetch feedbacks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const feedback = await prisma.feedback.create({
            data
        });
        return NextResponse.json(feedback);
    } catch (error) {
        console.error('Failed to submit feedback:', error);
        return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
    }
}
