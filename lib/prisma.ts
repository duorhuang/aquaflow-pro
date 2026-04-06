import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * Global cache for the Prisma instance.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * getPrisma() - The ULTIMATE stable way to get a Prisma instance in Cloudflare Edge.
 * This version uses HTTPS (neon-http) which is significantly more stable
 * in Serverless/Edge environments than WebSockets.
 */
export function getPrisma(): PrismaClient {
    // 1. Return cached instance if available
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    // 2. Resolve Connection String
    let connectionString = process.env.DATABASE_URL || '';
    
    // Clean potential corruption
    const match = connectionString.match(/(postgresql?:\/\/[^\s"']+)/);
    if (match) connectionString = match[1];

    // 3. Early safety exit
    if (!connectionString || connectionString.includes('dummy')) {
        if (process.env.NEXT_PHASE === 'phase-production-build') {
             return new PrismaClient(); 
        }
    }

    // 4. Create Client using the HTTP Adapter (Optimized for Edge)
    const sql = neon(connectionString);
    const adapter = new PrismaNeonHTTP(sql);
    const client = new PrismaClient({ 
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });

    // 5. Cache in non-production
    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
}

/**
 * @deprecated Use getPrisma() inside your route handlers.
 */
export const prisma = {} as PrismaClient;
