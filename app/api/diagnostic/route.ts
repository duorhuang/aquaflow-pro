import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic endpoint — restricted to localhost/development only.
 * Never exposes secrets or environment variable values in production.
 */
export async function GET(request: Request) {
    const host = request.headers.get('host') || '';
    const isLocalhost = host.startsWith('localhost') || host.startsWith('127.0.0.1');
    if (!isLocalhost && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not available in production' }, { status: 403, headers: V12_FINGERPRINT });
    }

    return withApiHandler(async () => {
        const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
        const isProd = process.env.NODE_ENV === 'production';
        const phase = process.env.NEXT_PHASE || 'UNKNOWN';

        return NextResponse.json({
            status: 'Diagnostic-OK',
            environment: {
                isProd,
                phase,
                dbUrlSet: dbUrl !== 'NOT_SET',
            },
            runtime: 'Edge-V12'
        }, { headers: V12_FINGERPRINT });
    });
}
