import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

// Configure Neon WebSocket - Cloudflare Workers has native WebSocket support
// Only import ws for Node.js environments (local dev, scripts)
if (typeof globalThis.WebSocket === 'undefined') {
    // Node.js environment - need ws package
    try {
        // Dynamic import to avoid bundling issues
        const ws = require('ws');
        neonConfig.webSocketConstructor = ws;
    } catch (e) {
        // ws not available, might be running in edge with native WebSocket
    }
}

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Ensure connection string exists
if (!connectionString) {
    throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === "development" ? ["query"] : [],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
