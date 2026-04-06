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

import { getCloudflareContext } from "@opennextjs/cloudflare";

function extractConnectionString(val: string | undefined): string | undefined {
    if (!val) return undefined;
    const match = val.match(/(postgresql?:\/\/[^\s"']+)/);
    return match ? match[1] : val;
}

// LAZY initialization — the database connection is only created
// the first time `prisma` is actually used at runtime.
// This prevents build-time crashes when DATABASE_URL is not available.
function createPrismaClient(): PrismaClient {
    let connectionString = process.env.DATABASE_URL;
    try {
        const { env } = getCloudflareContext();
        if (env && (env as any).DATABASE_URL) {
            connectionString = (env as any).DATABASE_URL;
        }
    } catch (e) {
        // running outside cloudflare request context
    }
    
    connectionString = extractConnectionString(connectionString);

    if (!connectionString) {
        throw new Error("DATABASE_URL must be set");
    }

    const pool = new Pool({ 
        connectionString,
        connectionTimeoutMillis: 10000, // 10s timeout for China-to-US connections
        max: 10, // Limit concurrent connections
    });
    const adapter = new PrismaNeon(pool);

    const client = new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });

    return client;
}

// Use a Proxy so the client is only instantiated on first access (e.g. inside a request handler)
// This is critical for Cloudflare Workers where `process.env` is not populated at the global module scope.
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        if (prop === 'then') return undefined; // not a thenable

        let connectionString = process.env.DATABASE_URL;
        try {
            const { env } = getCloudflareContext();
            if (env && (env as any).DATABASE_URL) {
                connectionString = (env as any).DATABASE_URL;
            }
        } catch (e) {}

        connectionString = extractConnectionString(connectionString);

        // Only use dummy proxy IF we are explicitly in a restricted build environment
        const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';
        
        if (!connectionString || connectionString.includes("dummy")) {
            if (isBuildTime) {
                console.log("🛠️ Prisma: Build-time dummy proxy active.");
                return new Proxy(() => {}, {
                    get: (_t, p) => {
                        if (p === 'then') return undefined;
                        return () => Promise.resolve([]); // Return empty array instead of null for safety
                    },
                    apply: () => Promise.resolve([]),
                });
            } else {
                // If we're at runtime and connection string is missing, this is a CRITICAL configuration error
                console.error("❌ Prisma Error: DATABASE_URL is missing at runtime!");
                // Instead of returning null, we should probably throw or return a proxy that throws on execute
                return new Proxy(() => {}, {
                    get: (_t, p) => {
                        if (p === 'then') return undefined;
                        return () => { throw new Error("DATABASE_URL is missing! Please check your environment variables."); };
                    },
                    apply: () => { throw new Error("DATABASE_URL is missing!"); }
                });
            }
        }

        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = createPrismaClient();
        }

        const client = globalForPrisma.prisma as any;
        const value = client[prop];
        if (value !== undefined) {
            return typeof value === 'function' ? value.bind(client) : value;
        }
        
        // Fallback to the target object (for Object.assign used in db.ts)
        return Reflect.get(_target, prop);
    },
    set(target, prop, value) {
        return Reflect.set(target, prop, value);
    }
});
