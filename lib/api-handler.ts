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
        // Detect Neon quota exhaustion (HTTP 402)
        const isNeonQuota = error.message?.includes('data transfer quota') || error.message?.includes('HTTP status 402');

        console.error("[V12_API_RUNTIME_EXCEPTION]", error.message);

        if (isNeonQuota) {
            return NextResponse.json(
                {
                    error: "Database Quota Exceeded",
                    detail: "The database has exceeded its monthly transfer limit. Please check Neon dashboard or upgrade plan.",
                    v12: "QUOTA-EXHAUSTED"
                },
                {
                    status: 503,
                    headers: { ...V12_FINGERPRINT, 'X-DB-Quota': 'exceeded' }
                }
            );
        }

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
