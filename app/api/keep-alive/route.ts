import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// This endpoint is called periodically (via cron or external ping)
// to keep the Neon database warm and avoid cold start delays.
export async function GET() {
    try {
        // Simple query to keep the connection alive
        const count = await db.swimmers.findMany({ take: 1 });
        return NextResponse.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            swimmerCount: count.length
        });
    } catch (error: any) {
        return NextResponse.json({ 
            status: 'error', 
            error: error.message 
        }, { status: 500 });
    }
}
