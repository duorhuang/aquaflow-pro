import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(req);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(req.url);
        const group = searchParams.get('group');

        let announcements: any[];
        if (group) {
            announcements = await sql`
                SELECT * FROM "CoachAnnouncement"
                WHERE "targetGroup" = ${group}
                ORDER BY "createdAt" DESC
            `;
        } else {
            announcements = await sql`
                SELECT * FROM "CoachAnnouncement"
                ORDER BY "createdAt" DESC
            `;
        }

        // Include blocks for each announcement
        const results = await Promise.all(announcements.map(async (announcement: any) => {
            const blocks = await sql`
                SELECT * FROM "AnnouncementBlock"
                WHERE "announcementId" = ${announcement.id}
                ORDER BY "sortOrder" ASC
            `;
            // Parse JSON fields
            if (announcement.targetSwimmerIds && typeof announcement.targetSwimmerIds === 'string') {
                announcement.targetSwimmerIds = JSON.parse(announcement.targetSwimmerIds);
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

        const sql = neon(process.env.DATABASE_URL!);
        const data = flattenPayload(await request.json());

        const targetSwimmerIds = data.targetSwimmerIds
            ? JSON.stringify(data.targetSwimmerIds)
            : null;

        const announcement = await sql`
            INSERT INTO "CoachAnnouncement" ("id", "targetSwimmerIds", "targetGroup", "createdAt")
            VALUES (gen_random_uuid()::text, ${targetSwimmerIds}, ${data.targetGroup}, NOW())
            RETURNING *
        `;
        const ann = announcement[0];

        // Insert blocks if provided
        const { blocks } = data;
        if (blocks && blocks.length > 0) {
            for (let i = 0; i < blocks.length; i++) {
                const b = blocks[i];
                await sql`
                    INSERT INTO "AnnouncementBlock" ("id", "announcementId", "type", "content", "sortOrder", "thumbnailUrl")
                    VALUES (gen_random_uuid()::text, ${ann.id}, ${String(b.type)}, ${String(b.content)}, ${i}, ${b.thumbnailUrl || null})
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

export async function DELETE(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = neon(process.env.DATABASE_URL!);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await sql`DELETE FROM "CoachAnnouncement" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
