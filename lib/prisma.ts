import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

// Configure Neon WebSocket - Cloudflare Workers has native WebSocket support
// Only import ws for Node.js environments (local dev, scripts)
if (typeof globalThis.WebSocket === 'undefined') {
    try {
        const ws = require('ws');
        neonConfig.webSocketConstructor = ws;
    } catch (e) {
        // ws not available, might be running in edge with native WebSocket
    }
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// LAZY initialization — the database connection is only created
// the first time `prisma` is actually used at runtime.
// This prevents build-time crashes when DATABASE_URL is not available.
function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL must be set");
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);

    const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query"] : [],
    });

    return client;
}

// A truly lazy proxy so that PrismaClient is only instantiated 
// when the very first query is made (at request time, not module import time).
// This is critical for Cloudflare Workers because `process.env` might only
// be fully populated by the adapter when the request handler executes.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        if (prop === 'then') return undefined;

        // If at build time we lack DATABASE_URL, return the safe dummy proxy
        if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("dummy")) {
            return new Proxy(() => {}, {
                get: () => () => Promise.resolve([]),
                apply: () => Promise.resolve([]),
            });
        }

        // At runtime, instantiate the client if it hasn't been instantiated yet
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = createPrismaClient();
        }

        // Delegate to the real Prisma client
        return (globalForPrisma.prisma as any)[prop];
    }
});
