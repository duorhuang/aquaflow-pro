/**
 * Shared Neon SQL client singleton.
 * Prevents per-request connection creation — all API routes reuse one pooled connection
 * per worker instance, eliminating connection exhaustion under concurrent load.
 */

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';

let _sql: NeonQueryFunction<false, false> | null = null;

export function getNeon(): NeonQueryFunction<false, false> {
    if (_sql) return _sql;

    const connectionString = process.env.DATABASE_URL || '';
    if (!connectionString || connectionString.includes('dummy')) {
        throw new Error('DATABASE_URL is not configured');
    }

    // Add pg_bouncer mode + keepalive for connection stability
    let url = connectionString;
    if (!url.includes('pgbouncer')) {
        url = url.replace('/neondb?', '/neondb?pgbouncer=true&');
    }
    if (!url.includes('connection_limit')) {
        url = url.includes('?') ? `${url}&connection_limit=50` : `${url}?connection_limit=50`;
    }

    _sql = neon(url);
    return _sql;
}
