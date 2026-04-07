import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * V10-ULTRA: Absolute Stability Architecture.
 * This client is stateless and uses HTTPS (neon-http).
 * DIAGNOSTIC: Captures initialization errors to the log before the Worker crashes.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * getPrisma() - Lazy Singleton with Diagnostic Guard.
 */
export function getPrisma(): PrismaClient {
    try {
        if (globalForPrisma.prisma) return globalForPrisma.prisma;

        let connectionString = process.env.DATABASE_URL || '';
        const match = connectionString.match(/(postgresql?:\/\/[^\s"']+)/);
        if (match) connectionString = match[1];

        if (!connectionString) {
             throw new Error("Missing DATABASE_URL");
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
        console.error("[PRISMA_INIT_ERROR]", error);
        // We still throw, but we've logged it now.
        throw error;
    }
}

/**
 * flattenPayload() - ITERATIVE PEEL-AND-DELETE.
 * Definitively solves the { data: { data: { ... } } } nesting bug.
 */
export function flattenPayload(body: any): any {
    let current = body;
    // Iterate as long as we have a 'data' property that is a non-array object.
    while (current && current.data && typeof current.data === 'object' && !Array.isArray(current.data)) {
        const { data, ...rest } = current;
        current = { ...rest, ...data };
    }
    return current;
}

/**
 * Standard headers for V10-ULTRA stability.
 */
export const V10_FINGERPRINT = {
    'X-Build': 'V10-ULTRA',
    'Cache-Control': 'no-store'
};

/**
 * @deprecated Use getPrisma()
 */
export const prisma = {} as PrismaClient;
