import { getPrisma } from './prisma';

/**
 * DB SHIM: Exported for backward compatibility with older components
 * and API routes that still use 'import { db } from "@/lib/db"'.
 * 
 * This ensures system-wide stability by routing all database access
 * through the optimized V5-ULTRA getPrisma() singleton.
 */
export const db = getPrisma();
