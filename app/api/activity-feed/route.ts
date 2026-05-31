import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/utils';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const { searchParams } = new URL(request.url);
        const swimmerId = searchParams.get('swimmerId');
        if (!swimmerId) {
            return NextResponse.json({ error: 'Swimmer ID required' }, { status: 400 });
        }

        // SECURITY: Athletes can only view their own activity feed
        if (auth.role === 'athlete' && swimmerId !== auth.userId) {
            return NextResponse.json({ error: 'Forbidden: Can only view your own feed' }, { status: 403 });
        }

        const sql = getNeon();
        const feed = await sql`
            SELECT * FROM "ActivityFeedItem"
            WHERE "swimmerId" = ${swimmerId}
            ORDER BY "createdAt" DESC
            LIMIT 50
        `;

        return NextResponse.json(feed, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());
        const { action, swimmerId, feedItemId } = data;

        if (action === 'read_all') {
            if (!swimmerId) return NextResponse.json({ error: 'Swimmer ID required' }, { status: 400 });
            // SECURITY: Verify athlete owns the feed
            if (auth.role === 'athlete' && swimmerId !== auth.userId) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
            await sql`
                UPDATE "ActivityFeedItem"
                SET "isRead" = true
                WHERE "swimmerId" = ${swimmerId}
            `;
            return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });

        } else if (action === 'read_one') {
            if (!feedItemId) return NextResponse.json({ error: 'Feed Item ID required' }, { status: 400 });
            // SECURITY: Verify the feed item belongs to the requesting athlete
            if (auth.role === 'athlete') {
                const itemCheck = await sql`SELECT "swimmerId" FROM "ActivityFeedItem" WHERE "id" = ${feedItemId}`;
                if (itemCheck.length > 0 && itemCheck[0].swimmerId !== auth.userId) {
                    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                }
            }
            await sql`
                UPDATE "ActivityFeedItem"
                SET "isRead" = true
                WHERE "id" = ${feedItemId}
            `;
            return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
            
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    });
}
