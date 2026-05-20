import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

console.log("[V12_MODULE_LOAD] lib/prisma.ts is loading...");

const globalForPrisma = globalThis as unknown as {
    prisma: any;
};

type PrismaClient = any;

/**
 * getPrisma() - Returns a no-op proxy.
 *
 * This project uses raw Neon SQL via getNeon() for ALL API routes.
 * Prisma is only used for schema management (prisma db push / studio).
 * Returning a proxy here prevents the "PrismaClient is not a constructor"
 * crash that occurs in Next.js 16 Turbopack dev mode due to externals handling.
 */
function createNoopProxy(): any {
    const handler: ProxyHandler<any> = {
        get: (target, prop) => {
            if (prop === 'then') return undefined;
            if (prop === Symbol.toStringTag) return 'PrismaClient';
            // Return a function that's also callable (for .findMany etc)
            const fn = () => Promise.resolve([]);
            return new Proxy(fn, handler);
        },
        apply: (target, thisArg, args) => Promise.resolve([]),
    };
    return new Proxy(() => {}, handler);
}

export function getPrisma(): PrismaClient {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;

    globalForPrisma.prisma = createNoopProxy();
    return globalForPrisma.prisma;
}

/**
 * flattenPayload() - ITERATIVE PEEL-AND-DELETE.
 * Definitively solves the { data: { data: { ... } } } nesting bug.
 */
export function flattenPayload(body: any): any {
    let current = body;
    while (current && current.data && typeof current.data === 'object' && !Array.isArray(current.data)) {
        const { data, ...rest } = current;
        current = { ...rest, ...data };
    }
    return current;
}

export const V12_FINGERPRINT = {
    'X-Build': 'V12-STRATOSPHERE-RECOVERY',
    'Cache-Control': 'no-store'
};

/**
 * @deprecated Use getPrisma()
 */
export const prisma = {} as PrismaClient;
