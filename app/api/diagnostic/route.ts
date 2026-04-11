import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
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
                dbUrlPrefix: dbUrl.substring(0, 10) + '...',
            },
            runtime: 'Edge-V12'
        }, { headers: V12_FINGERPRINT });
    });
}
