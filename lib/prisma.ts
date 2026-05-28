/**
 * Re-exports from lib/utils.ts for backward compatibility.
 * flattenPayload and V12_FINGERPRINT have been moved to lib/utils.ts.
 *
 * getPrisma() returns a no-op proxy — this project uses raw Neon SQL via getNeon().
 * Prisma is only used for schema management (prisma db push / studio).
 */
export { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';

import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';

const globalForPrisma = globalThis as unknown as { prisma: any };
type PrismaClient = any;

function createNoopProxy(): any {
    const handler: ProxyHandler<any> = {
        get: (target, prop) => {
            if (prop === 'then') return undefined;
            if (prop === Symbol.toStringTag) return 'PrismaClient';
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

/** @deprecated Use getPrisma() */
export const prisma = {} as PrismaClient;
