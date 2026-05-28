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
            await sql`
                UPDATE "ActivityFeedItem"
                SET "isRead" = true
                WHERE "swimmerId" = ${swimmerId}
            `;
            return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });

        } else if (action === 'read_one') {
            if (!feedItemId) return NextResponse.json({ error: 'Feed Item ID required' }, { status: 400 });
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
