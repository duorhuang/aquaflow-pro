import { NextResponse } from 'next/server';
import { getPrisma, V7_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * KEEP-ALIVE: This endpoint is called periodically to keep 
 * the Neon database warm and avoid cold start delays.
 * 
 * V7-STABLE Absolute Version.
 */
export async function GET() {
    try {
        const prisma = getPrisma();
        const count = await prisma.swimmer.findMany({ take: 1 });
        return NextResponse.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            swimmerCount: count.length
        }, { headers: V7_FINGERPRINT });
    } catch (error: any) {
        console.error("Keep-alive error:", error.message);
        return NextResponse.json({ 
            status: 'error', 
            error: error.message
        }, { status: 500, headers: V7_FINGERPRINT });
    }
}
