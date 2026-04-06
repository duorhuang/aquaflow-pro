import { neon } from '@neondatabase/serverless';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * V5-ULTRA PREVIEW: This client is stateless and uses HTTPS, 
 * making it the most robust option for Cloudflare Edge.
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

    // neon() creates an HTTPS stateless client
    const sql = neon(connectionString);
    const adapter = new PrismaNeonHTTP(sql);
    const client = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
}

/**
 * helper to flatten incoming request bodies that might be wrapped in "data"
 */
export function flattenPayload(body: any): any {
    if (body && body.data && typeof body.data === 'object' && !Array.isArray(body.data)) {
        return { ...body, ...body.data };
    }
    return body;
}

export const prisma = {} as PrismaClient;
