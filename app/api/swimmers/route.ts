import { NextResponse } from 'next/server';
import { flattenPayload, V12_FINGERPRINT } from '@/lib/prisma';
import { withApiHandler } from '@/lib/api-handler';
import { requireAnyAuth, requireCoach, hashPassword } from '@/lib/auth-api';
import { getNeon } from '@/lib/db-pool';
import * as crypto from 'crypto';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const swimmers = await sql`SELECT * FROM "Swimmer" ORDER BY "name" ASC`;

        const isCoach = (auth as any).role === 'coach';
        const safe = (swimmers || []).map((s: any) => {
            if (isCoach) return s;
            const { password, ...rest } = s;
            return rest;
        });
        return NextResponse.json(safe, { headers: V12_FINGERPRINT });
    });
}

export async function POST(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireCoach(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const data = flattenPayload(await request.json());

        const hashedPassword = data.password ? await hashPassword(String(data.password)) : '';
        const swimmerId = crypto.randomUUID();
        const gender = data.gender === 'female' ? 'female' : 'male';

        // 1. Fetch starter gear from ShopItem to populate inventory and equippedItems
        const keysToFetch = ['head_basic_cap', 'eyes_basic_goggles'];
        if (gender === 'male') {
            keysToFetch.push('body_basic_male', 'lower_basic_male');
        } else {
            keysToFetch.push('body_basic_female', 'lower_basic_female');
        }

        const inventoryIds: string[] = [];
        const equippedMapping: Record<string, string> = {};

        try {
            const shopItems = await sql`
                SELECT id, "imageKey", "slotType" 
                FROM "ShopItem" 
                WHERE "imageKey" = ANY(${keysToFetch})
            `;

            shopItems.forEach((item: any) => {
                inventoryIds.push(item.id);
                equippedMapping[item.slotType] = item.id;
            });
        } catch (e) {
            console.error("Starter pack gear fetch failed, continuing with empty defaults:", e);
        }

        const initialXp = Number(data.xp) !== undefined && !isNaN(Number(data.xp)) ? Number(data.xp) : 200;
        const initialTotalXp = data.totalXp !== undefined ? Number(data.totalXp) : initialXp;
        const initialBalance = data.balance !== undefined ? Number(data.balance) : initialXp;

        const swimmer = await sql`
            INSERT INTO "Swimmer" (
                "id", "name", "group", "username", "password", "status", "readiness", 
                "xp", "level", "gender", "totalXp", "balance", 
                "inventory", "equippedItems", "wishlist", "currentStreak", "createdAt", "updatedAt"
            )
            VALUES (
                ${swimmerId},
                ${String(data.name)},
                ${String(data.group)},
                ${String(data.username)},
                ${hashedPassword || ''},
                ${data.status || 'Active'},
                ${Number(data.readiness) || 100},
                ${initialXp},
                ${Number(data.level) || 1},
                ${gender},
                ${initialTotalXp},
                ${initialBalance},
                ${JSON.stringify(inventoryIds)},
                ${JSON.stringify(equippedMapping)},
                '[]',
                0,
                NOW(),
                NOW()
            )
            RETURNING *
        `;

        // Create transaction history entry for the starter pack reward
        try {
            const txId = crypto.randomUUID();
            await sql`
                INSERT INTO "XpTransaction" ("id", "swimmerId", "amount", "source", "description", "balanceAfter", "totalXpAfter", "createdAt")
                VALUES (
                    ${txId},
                    ${swimmerId},
                    ${initialBalance},
                    'starter_pack',
                    '新手入队大礼包',
                    ${initialBalance},
                    ${initialTotalXp},
                    NOW()
                )
            `;
        } catch (txError) {
            console.error("Failed to write starter pack transaction ledger:", txError);
        }

        return NextResponse.json(swimmer[0], { headers: V12_FINGERPRINT });
    });
}

export async function PUT(request: Request) {
    return withApiHandler(async () => {
        const auth = await requireAnyAuth(request);
        if (auth instanceof NextResponse) return auth;

        const sql = getNeon();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        if (auth.role === 'athlete' && auth.userId !== id) {
            return NextResponse.json({ error: 'Forbidden: Can only update your own profile' }, { status: 403 });
        }

        const data = flattenPayload(await request.json());

        // Fetch existing to preserve unspecified fields — avoids overwriting with null
        const existing = await sql`SELECT * FROM "Swimmer" WHERE "id" = ${id}`;
        if (existing.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        const current = existing[0];

        const fields: string[] = [];
        const values: any[] = [];

        const addField = (col: string, val: any) => {
            fields.push(`"${col}" = $${values.length + 1}`);
            values.push(val);
        };

        if (data.name !== undefined) addField('name', String(data.name));
        else addField('name', current.name);
        
        if (data.group !== undefined) addField('group', String(data.group));
        else addField('group', current.group);
        
        if (data.username !== undefined) addField('username', String(data.username));
        else addField('username', current.username);
        
        if (data.status !== undefined) addField('status', String(data.status));
        else addField('status', current.status);
        
        if (data.readiness !== undefined) addField('readiness', Number(data.readiness));
        else addField('readiness', current.readiness);
        
        if (data.xp !== undefined) addField('xp', Number(data.xp));
        else addField('xp', current.xp);
        
        if (data.level !== undefined) addField('level', Number(data.level));
        else addField('level', current.level);
        
        if (data.gender !== undefined) addField('gender', String(data.gender));
        else addField('gender', current.gender || 'male');

        if (data.totalXp !== undefined) addField('totalXp', Number(data.totalXp));
        else addField('totalXp', current.totalXp || 0);

        if (data.balance !== undefined) addField('balance', Number(data.balance));
        else addField('balance', current.balance || 0);

        if (data.inventory !== undefined) {
            const invVal = typeof data.inventory === 'string' ? data.inventory : JSON.stringify(data.inventory);
            addField('inventory', invVal);
        } else {
            addField('inventory', current.inventory || '[]');
        }

        if (data.equippedItems !== undefined) {
            const eqVal = typeof data.equippedItems === 'string' ? data.equippedItems : JSON.stringify(data.equippedItems);
            addField('equippedItems', eqVal);
        } else {
            addField('equippedItems', current.equippedItems || '{}');
        }

        if (data.wishlist !== undefined) {
            const wlVal = typeof data.wishlist === 'string' ? data.wishlist : JSON.stringify(data.wishlist);
            addField('wishlist', wlVal);
        } else {
            addField('wishlist', current.wishlist || '[]');
        }

        if (data.currentStreak !== undefined) addField('currentStreak', Number(data.currentStreak));
        else addField('currentStreak', current.currentStreak || 0);

        if (data.injuryNote === null || data.injuryNote === '') addField('injuryNote', null);
        else if (data.injuryNote !== undefined) addField('injuryNote', String(data.injuryNote));
        else addField('injuryNote', current.injuryNote);
        
        if (data.injuryImageUrl === null || data.injuryImageUrl === '') addField('injuryImageUrl', null);
        else if (data.injuryImageUrl !== undefined) addField('injuryImageUrl', String(data.injuryImageUrl));
        else addField('injuryImageUrl', current.injuryImageUrl);
        if (data.lastProfileUpdate === null) addField('lastProfileUpdate', null);
        else if (data.lastProfileUpdate !== undefined) addField('lastProfileUpdate', String(data.lastProfileUpdate));
        else addField('lastProfileUpdate', current.lastProfileUpdate);
        
        if (data.mainStroke === null) addField('mainStroke', null);
        else if (data.mainStroke !== undefined) addField('mainStroke', String(data.mainStroke));
        else addField('mainStroke', current.mainStroke);
        
        if (data.injuryBodyMap !== undefined) {
            const ibmVal = data.injuryBodyMap === null ? null : typeof data.injuryBodyMap === 'string' ? data.injuryBodyMap : JSON.stringify(data.injuryBodyMap);
            addField('injuryBodyMap', ibmVal);
        } else {
            addField('injuryBodyMap', current.injuryBodyMap ? (typeof current.injuryBodyMap === 'string' ? current.injuryBodyMap : JSON.stringify(current.injuryBodyMap)) : null);
        }

        if (data.password && !String(data.password).includes(':')) {
            addField('password', await hashPassword(String(data.password)));
        }

        fields.push('"updatedAt" = NOW()');

        const query = `UPDATE "Swimmer" SET ${fields.join(', ')} WHERE "id" = $${values.length + 1} RETURNING *`;
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

        await sql`DELETE FROM "Swimmer" WHERE "id" = ${id}`;
        return NextResponse.json({ success: true }, { headers: V12_FINGERPRINT });
    });
}
