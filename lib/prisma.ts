import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * V7-STABLE: The Definitive Production Engine.
 * - Stateless HTTP for Cloudflare Edge.
 * - Recursive Deep Flattening (Peel-and-Delete) to fix Prisma nesting bugs.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

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
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
}

/**
 * flattenPayload() - RECURSIVE PEEL-AND-DELETE.
 * Definitively solves the { data: { data: { ... } } } nesting bug by 
 * spreading any object inside 'data' and then DELETING the 'data' key.
 */
export function flattenPayload(obj: any): any {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    
    // If the object has a 'data' property that is also an object, peel it and DELETE it.
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
        const { data, ...rest } = obj;
        return flattenPayload({ ...rest, ...data });
    }
    
    return obj;
}

/**
 * Fingerprint constant for consistent usage across API routes.
 */
export const V7_FINGERPRINT = {
    'X-Build': 'V7-STABLE',
    'Cache-Control': 'no-store, max-age=0'
};

/**
 * @deprecated Use getPrisma() singleton
 */
export const prisma = {} as PrismaClient;
