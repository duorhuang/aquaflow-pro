import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

/**
 * Global cache to ensure we only have ONE Prisma instance per worker.
 * This is critical for connection pooling and performance.
 */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * getPrisma() - The ULTIMATE stable way to get a Prisma instance in Cloudflare Edge.
 * It strictly avoids Node.js-only modules like 'ws' and follows Neon + Prisma best practices.
 */
export function getPrisma(): PrismaClient {
    // 1. Return cached instance if available
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    // 2. Resolve Connection String
    // In Cloudflare Pages/Workers using OpenNext, environment variables are in process.env
    let connectionString = process.env.DATABASE_URL;

    // Handle string corruption or dummy values
    if (connectionString) {
        const match = connectionString.match(/(postgresql?:\/\/[^\s"']+)/);
        if (match) connectionString = match[1];
    }

    // 3. Early exit if no connection string (safety)
    if (!connectionString || connectionString.includes('dummy')) {
        // Basic dummy client for build-time safety
        if (process.env.NEXT_PHASE === 'phase-production-build') {
             return new PrismaClient(); 
        }
    }

    // 4. Create and Cache the Client
    // Cloudflare Edge already has global WebSocket, Neon uses it automatically.
    const pool = new Pool({ connectionString: connectionString || '' });
    const adapter = new PrismaNeon(pool);
    const client = new PrismaClient({ adapter });

    // In dev, cache to avoid HMR exhaustion. In prod, the Worker is short-lived.
    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
}

/**
 * @deprecated Use getPrisma() directly inside your route handlers.
 */
export const prisma = {} as PrismaClient;
