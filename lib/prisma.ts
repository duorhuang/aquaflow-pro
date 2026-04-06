import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Standard Singleton pattern for Prisma
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function extractConnectionString(val: string | undefined): string | undefined {
    if (!val) return undefined;
    const match = val.match(/(postgresql?:\/\/[^\s"']+)/);
    return match ? match[1] : val;
}

/**
 * getPrisma() - The ONLY safe way to get a Prisma instance in Cloudflare Edge.
 * Call this INSIDE your API request handlers to ensure DATABASE_URL is available
 * and initialization doesn't crash the worker module.
 */
export function getPrisma(): PrismaClient {
    // 1. Return existing instance if available
    if (globalForPrisma.prisma) {
        return globalForPrisma.prisma;
    }

    // 2. Resolve Connection String
    let connectionString = process.env.DATABASE_URL;
    
    // Try to get from Cloudflare context (Edge Runtime)
    try {
        const { env } = getCloudflareContext();
        if (env && (env as any).DATABASE_URL) {
            connectionString = (env as any).DATABASE_URL;
        }
    } catch (e) {
        // Outside cloudflare request context (local dev or build)
    }

    connectionString = extractConnectionString(connectionString);

    // 3. Fallback/Build-time safety
    if (!connectionString || connectionString.includes('dummy')) {
        // Build-time dummy client
        if (process.env.NEXT_PHASE === 'phase-production-build') {
             return new PrismaClient(); 
        }
        // Runtime error - will be caught by API try/catch
        throw new Error("DATABASE_URL is not configured.");
    }

    // 4. Configure Neon for Edge
    if (typeof globalThis.WebSocket === 'undefined') {
        try {
            const ws = require('ws');
            neonConfig.webSocketConstructor = ws;
        } catch (e) {}
    }

    // 5. Create Client with Neon Adapter
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    const client = new PrismaClient({ 
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
    });

    // 6. Cache for future requests in same worker instance
    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
}

/**
 * @deprecated Use getPrisma() inside request handlers instead for Edge stability.
 */
export const prisma = {} as PrismaClient; // Placeholder to avoid import errors elsewhere during migration
