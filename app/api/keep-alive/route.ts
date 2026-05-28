import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/utils';
import { withApiHandler } from '@/lib/api-handler';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter — max 10 requests per 60s window
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 1000;
const timestamps: number[] = [];

function isRateLimited(): boolean {
    const now = Date.now();
    // Evict old entries
    while (timestamps.length > 0 && timestamps[0] < now - WINDOW_MS) {
        timestamps.shift();
    }
    if (timestamps.length >= MAX_REQUESTS) return true;
    timestamps.push(now);
    return false;
}

export async function GET() {
    return withApiHandler(async () => {
        if (isRateLimited()) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: V12_FINGERPRINT }
            );
        }

        const sql = getNeon();
        await sql`SELECT COUNT(*) FROM "Swimmer"`;
        return NextResponse.json({
            status: 'alive',
            timestamp: new Date().toISOString()
        }, { headers: V12_FINGERPRINT });
    });
}
