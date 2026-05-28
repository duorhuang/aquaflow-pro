/**
 * Deprecated: lib/db.ts was a backward-compatible wrapper around Prisma.
 * Prisma ORM is not used in this project — all API routes use raw Neon SQL via getNeon().
 * This file exists only to prevent import errors in stale references.
 */
export const db = new Proxy({}, {
  get: () => {
    console.error('[DEPRECATED] lib/db.ts is deprecated. Use getNeon() from lib/db-pool.ts instead.');
    return Promise.resolve([]);
  }
});
