import { NextResponse } from 'next/server';
import { getPrisma, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';

export const dynamic = 'force-dynamic';

export async function GET() {
    return withApiHandler(async () => {
        const prisma = getPrisma();
        // V12: Minimal interaction to verify DB connectivity
        await prisma.swimmer.count();
        return NextResponse.json({ 
            status: 'alive', 
            timestamp: new Date().toISOString() 
        }, { headers: V12_FINGERPRINT });
    });
}
