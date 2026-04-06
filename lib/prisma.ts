import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Configure Neon WebSocket for local dev if needed
if (typeof globalThis.WebSocket === 'undefined') {
    try {
        const ws = require('ws');
        neonConfig.webSocketConstructor = ws;
    } catch (e) {}
}

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function extractConnectionString(val: string | undefined): string | undefined {
    if (!val) return undefined;
    const match = val.match(/(postgresql?:\/\/[^\s"']+)/);
    return match ? match[1] : val;
}

export function getPrismaClient(): PrismaClient {
    // If we're in a global context (like local dev), reuse the client
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    let connectionString = process.env.DATABASE_URL;
    
    // Try to get from Cloudflare context if available
    try {
        const context = getCloudflareContext();
        if (context?.env && (context.env as any).DATABASE_URL) {
            connectionString = (context.env as any).DATABASE_URL;
        }
    } catch (e) {}

    connectionString = extractConnectionString(connectionString);

    // Build-time safety or fallback
    if (!connectionString || connectionString.includes('dummy')) {
        // Return a mock client for build time if necessary
        if (process.env.NEXT_PHASE === 'phase-production-build') {
             return new PrismaClient(); 
        }
    }

    const pool = new Pool({ 
        connectionString: connectionString || 'postgresql://dummy:dummy@localhost:5432/dummy', 
        connectionTimeoutMillis: 10000,
        max: 10 
    });
    const adapter = new PrismaNeon(pool);
    const client = new PrismaClient({ adapter });

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = client;
    }
    
    return client;
}

// Export a direct instance
export const prisma = getPrismaClient();
