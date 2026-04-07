import { NextResponse } from 'next/server';
import { getPrisma, V11_FINGERPRINT } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const prisma = getPrisma();
        // V11: Minimal interaction to verify DB connectivity
        await prisma.swimmer.count();
        return NextResponse.json({ 
            status: 'alive', 
            timestamp: new Date().toISOString() 
        }, { headers: V11_FINGERPRINT });
    } catch (error: any) {
        console.error('Keep-alive check failed:', error);
        return NextResponse.json({ 
            status: 'error', 
            message: error.message 
        }, { status: 500, headers: V11_FINGERPRINT });
    }
}
