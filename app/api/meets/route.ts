import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const meets = await sql`SELECT * FROM "Meet" ORDER BY "date" ASC, "time" ASC`;

        // Calculate closest upcoming meet countdown details
        const now = new Date();
        let closestMeet: any = null;
        let diffMs = Infinity;

        meets.forEach((meet: any) => {
            const meetDateStr = meet.date; // YYYY-MM-DD
            const meetTimeStr = meet.time || '00:00'; // HH:MM
            const meetDateTime = new Date(`${meetDateStr}T${meetTimeStr}:00`);
            
            if (meetDateTime.getTime() > now.getTime()) {
                const diff = meetDateTime.getTime() - now.getTime();
                if (diff < diffMs) {
                    diffMs = diff;
                    closestMeet = {
                        ...meet,
                        diffMs,
                        daysLeft: Math.floor(diff / (1000 * 60 * 60 * 24)),
                        hoursLeft: Math.floor((diff / (1000 * 60 * 60)) % 24),
                        minutesLeft: Math.floor((diff / (1000 * 60)) % 60),
                        secondsLeft: Math.floor((diff / 1000) % 60)
                    };
                }
            }
        });

        // Trigger "dark-gold" prep theme if an active meet is within 7 days
        const isDarkGoldActive = closestMeet && closestMeet.daysLeft < 7 && closestMeet.isActive;

        return NextResponse.json({
            meets,
            closestMeet,
            isDarkGoldActive
        }, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        if (!data.name || !data.date) {
            return NextResponse.json({ error: 'Meet name and date are required' }, { status: 400 });
        }

        const id = data.id || crypto.randomUUID();
        const time = data.time || null;
        const location = data.location || null;
        const description = data.description || null;
        const isActive = data.isActive !== undefined ? Boolean(data.isActive) : true;

        const record = await sql`
            INSERT INTO "Meet" ("id", "name", "date", "time", "location", "description", "isActive", "createdAt", "updatedAt")
            VALUES (${id}, ${String(data.name)}, ${String(data.date)}, ${time}, ${location}, ${description}, ${isActive}, NOW(), NOW())
            RETURNING *
        `;

        // Create Activity Feed Item notifying swimmers of the new meet
        try {
            const swimmers = await sql`SELECT id FROM "Swimmer"`;
            for (const sw of swimmers) {
                const feedId = crypto.randomUUID();
                await sql`
                    INSERT INTO "ActivityFeedItem" ("id", "swimmerId", "type", "title", "detail", "isRead", "createdAt")
                    VALUES (
                        ${feedId},
                        ${sw.id},
                        'milestone',
                        ${`全新赛事发布: 「${data.name}」`},
                        ${`时间: ${data.date} ${time || ''} | 地点: ${location || '待定'}。全力备战！`},
                        false,
                        NOW()
                    )
                `;
            }
        } catch (feedErr) {
            console.error("Failed to propagate meet announcement to swimmer feeds:", feedErr);
        }

        return NextResponse.json(record[0], { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const data = flattenPayload(await request.json());

        const existing = await sql`SELECT * FROM "Meet" WHERE "id" = ${id}`;
        if (existing.length === 0) {
            return NextResponse.json({ error: 'Meet not found' }, { status: 404 });
        }
        const current = existing[0];

        const fields: string[] = [];
        const values: any[] = [];

        const addField = (col: string, val: any) => {
            fields.push(`"${col}" = $${values.length + 1}`);
            values.push(val);
        };

        if (data.name !== undefined) addField('name', String(data.name));
        else addField('name', current.name);

        if (data.date !== undefined) addField('date', String(data.date));
        else addField('date', current.date);

        if (data.time !== undefined) addField('time', data.time);
        else addField('time', current.time);

        if (data.location !== undefined) addField('location', data.location);
        else addField('location', current.location);

        if (data.description !== undefined) addField('description', data.description);
        else addField('description', current.description);

        if (data.isActive !== undefined) addField('isActive', Boolean(data.isActive));
        else addField('isActive', current.isActive);

        fields.push('"updatedAt" = NOW()');

        const query = `UPDATE "Meet" SET ${fields.join(', ')} WHERE "id" = $${values.length + 1} RETURNING *`;
        values.push(id);
        const result = await sql(query, values);

        return NextResponse.json(result[0], { headers: V12_FINGERPRINT });
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

        await sql`DELETE FROM "Meet" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
