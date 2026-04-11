import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from './prisma';

/**
 * V12_STABILITY: Standard API Handler Wrapper.
 * Captures Edge Runtime exceptions and returns a clean JSON error response.
 */
export async function withApiHandler(handler: () => Promise<NextResponse>) {
    try {
        return await handler();
    } catch (error: any) {
        console.error("[V12_API_RUNTIME_EXCEPTION]", error.message);
        
        // Return a stable 500 error instead of letting the Worker crash
        return NextResponse.json(
            { 
                error: "Internal Server Error", 
                detail: error.message,
                v12: "STRATOSPHERE-RECOVERY-ACTIVE"
            }, 
            { 
                status: 500, 
                headers: V12_FINGERPRINT 
            }
        );
    }
}
