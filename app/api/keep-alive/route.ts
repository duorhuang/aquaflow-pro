import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET() {
    return withApiHandler(async () => {
        const sql = neon(process.env.DATABASE_URL!);
        await sql`SELECT COUNT(*) FROM "Swimmer"`;
        return NextResponse.json({
            status: 'alive',
            timestamp: new Date().toISOString()
        }, { headers: V12_FINGERPRINT });
    });
}
