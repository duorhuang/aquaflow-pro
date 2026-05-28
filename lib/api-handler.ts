import { NextResponse } from 'next/server';
import { V12_FINGERPRINT } from './utils';
import { requireCoach, requireAnyAuth, requireAthlete } from './auth-api';
import type { JWTPayload } from './jwt';

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

// --- Route handler wrappers: combine auth + error handling ---

type AuthHandlerFn = (req: Request, auth: JWTPayload) => Promise<NextResponse>;

function wrapAuth(handler: AuthHandlerFn, authFn: (req: Request) => Promise<JWTPayload | NextResponse>): () => Promise<NextResponse> {
  return async () => {
    // Extract the request from the closure scope
    const req = (handler as any).__req__;
    const result = await authFn(req);
    if (result instanceof NextResponse) return result;
    return handler(req, result);
  };
}

export function handleCoach(req: Request, handler: AuthHandlerFn): Promise<NextResponse> {
  return withApiHandler(async () => {
    (handler as any).__req__ = req;
    const result = await requireCoach(req);
    if (result instanceof NextResponse) return result;
    return handler(req, result);
  });
}

export function handleAnyAuth(req: Request, handler: AuthHandlerFn): Promise<NextResponse> {
  return withApiHandler(async () => {
    (handler as any).__req__ = req;
    const result = await requireAnyAuth(req);
    if (result instanceof NextResponse) return result;
    return handler(req, result);
  });
}

export function handleAthlete(req: Request, handler: AuthHandlerFn): Promise<NextResponse> {
  return withApiHandler(async () => {
    (handler as any).__req__ = req;
    const result = await requireAthlete(req);
    if (result instanceof NextResponse) return result;
    return handler(req, result);
  });
}
