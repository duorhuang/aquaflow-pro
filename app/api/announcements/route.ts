import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group');
        const archived = searchParams.get('archived');

        // Compute 7-day cutoff
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 7);
        const cutoffStr = cutoff.toISOString();

        let query: any;
        if (archived === 'true') {
            // Archive view: show only non-starred items older than 7 days
            if (group) {
                query = sql`
                    SELECT * FROM "CoachAnnouncement"
                    WHERE "targetGroup" = ${group}
                      AND "createdAt" < ${cutoffStr}
                      AND "isStarred" = false
                    ORDER BY "createdAt" DESC
                `;
            } else {
                query = sql`
                    SELECT * FROM "CoachAnnouncement"
                    WHERE "createdAt" < ${cutoffStr}
                      AND "isStarred" = false
                    ORDER BY "createdAt" DESC
                `;
            }
        } else {
            // Active feed: starred OR within 7 days
            if (group) {
                query = sql`
                    SELECT * FROM "CoachAnnouncement"
                    WHERE "targetGroup" = ${group}
                      AND ("createdAt" >= ${cutoffStr} OR "isStarred" = true)
                    ORDER BY "createdAt" DESC
                `;
            } else {
                query = sql`
                    SELECT * FROM "CoachAnnouncement"
                    WHERE "createdAt" >= ${cutoffStr} OR "isStarred" = true
                    ORDER BY "createdAt" DESC
                `;
            }
        }

        const announcements: any[] = await query;

        // Include blocks for each announcement
        const results = await Promise.all(announcements.map(async (announcement: any) => {
            const blocks = await sql`
                SELECT * FROM "AnnouncementBlock"
                WHERE "announcementId" = ${announcement.id}
                ORDER BY "sortOrder" ASC
            `;
            // Parse JSON fields
            if (announcement.targetSwimmerIds && typeof announcement.targetSwimmerIds === 'string') {
                try { announcement.targetSwimmerIds = JSON.parse(announcement.targetSwimmerIds); } catch { announcement.targetSwimmerIds = []; }
            }
            return { ...announcement, blocks };
        }));

        return NextResponse.json(results || [], { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const targetSwimmerIds = data.targetSwimmerIds
            ? JSON.stringify(data.targetSwimmerIds)
            : null;

        const announcement = await sql`
            INSERT INTO "CoachAnnouncement" ("id", "targetSwimmerIds", "targetGroup", "createdAt", "isStarred")
            VALUES (${crypto.randomUUID()}, ${targetSwimmerIds}, ${data.targetGroup}, NOW(), false)
            RETURNING *
        `;
        const ann = announcement[0];
        if (!ann?.id) return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500, headers: V12_FINGERPRINT });

        // Insert blocks if provided
        const { blocks } = data;
        if (blocks && blocks.length > 0) {
            for (let i = 0; i < blocks.length; i++) {
                const b = blocks[i];
                await sql`
                    INSERT INTO "AnnouncementBlock" ("id", "announcementId", "type", "content", "sortOrder", "thumbnailUrl")
                    VALUES (${crypto.randomUUID()}, ${ann.id}, ${String(b.type)}, ${String(b.content)}, ${i}, ${b.thumbnailUrl || null})
                `;
            }
        }

        // Fetch announcement with blocks
        const resultBlocks = await sql`
            SELECT * FROM "AnnouncementBlock"
            WHERE "announcementId" = ${ann.id}
            ORDER BY "sortOrder" ASC
        `;

        return NextResponse.json({ ...ann, blocks: resultBlocks }, { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());
        const { id, isStarred } = data;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`
            UPDATE "CoachAnnouncement"
            SET "isStarred" = ${isStarred}
            WHERE "id" = ${id}
        `;

        const updated = await sql`SELECT * FROM "CoachAnnouncement" WHERE "id" = ${id}`;
        return NextResponse.json(updated[0], { headers: V12_FINGERPRINT });
    });
}

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`DELETE FROM "CoachAnnouncement" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
