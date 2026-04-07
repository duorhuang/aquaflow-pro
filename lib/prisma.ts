import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * V11-ULTRA-FINAL-RESTORE: The Absolute Stabilizer.
 * Addressing the 1101 Exception by delaying Prisma initialization 
 * until the first actual database query. This ensures the worker DOES NOT crash
 * during the environment cold-start if secrets are transiently unavailable.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * getPrisma() - Fault-Tolerant Lazy Singleton for Cloudflare Edge.
 * V11: Explicitly prevents top-level worker exceptions.
 */
export function getPrisma(): PrismaClient {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    try {
        let connectionString = process.env.DATABASE_URL || '';
        const match = connectionString.match(/(postgresql?:\/\/[^\s"']+)/);
        if (match) connectionString = match[1];

        // If the connection string is missing, we log it but don't crash yet.
        if (!connectionString || connectionString.includes('dummy')) {
             console.error("[V11_DIAGNOSTIC] Missing or invalid DATABASE_URL at runtime.");
        }

        const sql = neon(connectionString);
        const adapter = new PrismaNeonHTTP(sql);
        const client = new PrismaClient({ 
            adapter,
            log: ['error']
        });

        if (process.env.NODE_ENV !== 'production') {
            globalForPrisma.prisma = client;
        }
        
        return client;
    } catch (error: any) {
        console.error("[V11_INITIALIZATION_EXCEPTION]", error.message);
        // Fallback: throw a clean error that the route handler can catch, 
        // rather than letting the entire worker 1101 crash.
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
 * Standard headers for V11 verification.
 */
export const V11_FINGERPRINT = {
    'X-Build': 'V11-ULTRA-FINAL-RESTORE',
    'Cache-Control': 'no-store'
};

/**
 * @deprecated Use getPrisma()
 */
export const prisma = {} as PrismaClient;
