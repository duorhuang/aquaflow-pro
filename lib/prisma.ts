import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * V8-ULTRA-PURE: The Definitive Stability Engine.
 * This client is stateless and uses HTTPS (neon-http).
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * getPrisma() - Lazy singleton implementation optimized for Cloudflare Edge.
 */
export function getPrisma(): PrismaClient {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    let connectionString = process.env.DATABASE_URL || '';
    const match = connectionString.match(/(postgresql?:\/\/[^\s"']+)/);
    if (match) connectionString = match[1];

    if (!connectionString || connectionString.includes('dummy')) {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
             return new PrismaClient(); 
        }
    }

    const sql = neon(connectionString);
    const adapter = new PrismaNeonHTTP(sql);
    const client = new PrismaClient({ 
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query'] : ['error']
    });

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
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
 * Standard headers for stability.
 */
export const V8_FINGERPRINT = {
    'X-Build': 'V8-ULTRA-PURE',
    'Cache-Control': 'no-store'
};

/**
 * @deprecated Use getPrisma()
 */
export const prisma = {} as PrismaClient;
