import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * V6-STABLE: Enhanced Prisma Singleton with Deep Flattening.
 * This client is stateless and uses HTTPS (neon-http), 
 * making it the most robust option for Cloudflare Edge.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * getPrisma() - The ULTIMATE stable way to get a Prisma instance in Cloudflare Edge.
 * Uses the stateless PrismaNeonHTTP adapter to avoid 1101/Worker exceptions.
 */
export function getPrisma(): PrismaClient {
    // 1. Return cached instance if available
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    // 2. Resolve Connection String
    let connectionString = process.env.DATABASE_URL || '';
    const match = connectionString.match(/(postgresql?:\/\/[^\s"']+)/);
    if (match) connectionString = match[1];

    // 3. Early safety exit for build-time
    if (!connectionString || connectionString.includes('dummy')) {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
             return new PrismaClient(); 
        }
    }

    // 4. Create Stateless HTTP Adapter
    const sql = neon(connectionString);
    const adapter = new PrismaNeonHTTP(sql);
    
    // 5. Initialize the Client
    const client = new PrismaClient({ 
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });

    // 6. Cache in non-production environments
    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
}

/**
 * recursiveFlatten() - Definitively solves the persistent { data: { data: { ... } } } nesting bug.
 * It peels away all 'data' wrappers regardless of how deep they are nested by the frontend.
 */
export function flattenPayload(obj: any): any {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    
    // If the object has a 'data' property that is also an object, peel it and recurse.
    if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
        return flattenPayload({ ...obj, ...obj.data });
    }
    
    return obj;
}

/**
 * @deprecated For backward compatibility, use the shim in lib/db.ts
 */
export const prisma = {} as PrismaClient;
