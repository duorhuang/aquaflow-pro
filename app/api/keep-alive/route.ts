import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * KEEP-ALIVE: This endpoint is called periodically to keep 
 * the Neon database warm and avoid cold start delays.
 * 
 * V6-STABLE Fixed Version.
 */
export async function GET() {
    try {
        const prisma = getPrisma();
        // Simple query to keep the connection alive
        const count = await prisma.swimmer.findMany({ take: 1 });
        return NextResponse.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            swimmerCount: count.length,
            _build: "V6-STABLE"
        });
    } catch (error: any) {
        console.error("Keep-alive error:", error.message);
        return NextResponse.json({ 
            status: 'error', 
            error: error.message,
            _build: "V6-STABLE"
        }, { status: 500 });
    }
}
