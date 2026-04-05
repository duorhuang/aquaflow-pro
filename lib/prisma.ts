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

// Use a getter so the client is only instantiated on first access
export const prisma: PrismaClient = globalForPrisma.prisma ?? (() => {
    // During build time, return a dummy proxy that won't crash
    if (!process.env.DATABASE_URL) {
        return new Proxy({} as PrismaClient, {
            get(_target, prop) {
                if (prop === 'then') return undefined; // not a thenable
                return new Proxy(() => {}, {
                    get: () => () => Promise.resolve(null),
                    apply: () => Promise.resolve(null),
                });
            }
        });
    }

    const client = createPrismaClient();
    if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = client;
    }
    return client;
})();
