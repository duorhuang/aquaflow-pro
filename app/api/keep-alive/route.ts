import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/utils';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

// Keep-alive endpoint — called by cron every 30s to prevent DB cold starts
// No rate limiting — the DB pooler handles connection limits
export async function GET() {
    try {
        const sql = getNeon();
        // Simple lightweight query — just pings the DB
        await sql`SELECT 1`;
        return NextResponse.json({
            status: 'alive',
            timestamp: new Date().toISOString()
        }, { headers: V12_FINGERPRINT });
    } catch (error: any) {
        // If DB is unreachable (sleeping, quota exceeded), return 200 with warning
        // This prevents the Worker from crashing and keeps the site partially available
        return NextResponse.json({
            status: 'degraded',
            message: 'Database temporarily unavailable',
            detail: error.message || 'Connection failed'
        }, { status: 200, headers: V12_FINGERPRINT });
    }
}
