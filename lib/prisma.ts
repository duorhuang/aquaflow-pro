import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

console.log("[V12_MODULE_LOAD] lib/prisma.ts is loading...");

/**
 * V12-STRATOSPHERE-RECOVERY: The Definitive Stabilizer.
 * Addressing the 1101 Exception by delaying Prisma initialization 
 * until the first actual database query. This ensures the worker DOES NOT crash
 * during the environment cold-start if secrets are transiently unavailable.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * getPrisma() - Fault-Tolerant Lazy Singleton for Cloudflare Edge.
 * V12: Explicitly prevents top-level worker exceptions.
 */
export function getPrisma(): PrismaClient {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    // V12_ADVANCED: Detect if we are in a build phase.
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
    
    if (isBuildPhase) {
        console.log("[V12_BUILD_BYPASS] Returning Proxy client during build phase.");
        // Return a proxy that handles any property access without crashing
        return new Proxy({} as PrismaClient, {
            get: (target, prop) => {
                if (prop === 'then') return undefined; // Avoid promise-like behavior
                return new Proxy(() => {}, {
                    apply: () => Promise.resolve([]), // Mock method calls
                    get: (t, p) => p === 'then' ? undefined : t[p as any]
                });
            }
        });
    }

    console.time("[V12_INIT_TIMER]");
    try {
        let connectionString = process.env.DATABASE_URL || '';
        
        const match = connectionString.match(/postgresql?:\/\/[^\s"']+/);
        if (match) connectionString = match[0];

        if (!connectionString || connectionString.includes('dummy')) {
             console.warn("[V12_DIAGNOSTIC] DATABASE_URL is missing or invalid.");
        }

        const sql = neon(connectionString);
        const adapter = new PrismaNeonHTTP(sql);
        const client = new PrismaClient({ 
            adapter,
            log: ['error', 'warn']
        });

        globalForPrisma.prisma = client;
        console.timeEnd("[V12_INIT_TIMER]");
        return client;
    } catch (error: any) {
        console.timeEnd("[V12_INIT_TIMER]");
        console.error("[V12_INITIALIZATION_EXCEPTION]", error.message);
        throw error;
    }
}

/**
 * flattenPayload() - ITERATIVE PEEL-AND-DELETE.
 * Definitively solves the { data: { data: { ... } } } nesting bug.
 */
export function flattenPayload(body: any): any {
    let current = body;
    while (current && current.data && typeof current.data === 'object' && !Array.isArray(current.data)) {
        const { data, ...rest } = current;
        current = { ...rest, ...data };
    }
    return current;
}

/**
 * Standard headers for V12 verification.
 */
export const V12_FINGERPRINT = {
    'X-Build': 'V12-STRATOSPHERE-RECOVERY',
    'Cache-Control': 'no-store'
};

/**
 * @deprecated Use getPrisma()
 */
export const prisma = {} as PrismaClient;
