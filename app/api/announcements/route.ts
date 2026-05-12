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

        const { blocks } = data;

        const announcement = await sql`
            INSERT INTO "CoachAnnouncement" ("targetSwimmerIds", "targetGroup", "createdAt")
            VALUES (${data.targetSwimmerIds}, ${data.targetGroup}, NOW())
            RETURNING *
        `;
        const ann = announcement[0];

        // Insert blocks if provided
        if (blocks && blocks.length > 0) {
            for (let i = 0; i < blocks.length; i++) {
                const b = blocks[i];
                await sql`
                    INSERT INTO "AnnouncementBlock" ("announcementId", "type", "content", "sortOrder", "thumbnailUrl")
                    VALUES (${ann.id}, ${String(b.type)}, ${String(b.content)}, ${i}, ${b.thumbnailUrl || null})
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
